var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var jade = require('gulp-jade');
var less = require('gulp-less');
var usemin = require('gulp-usemin');
var flatten = require('gulp-flatten');
var cssmin = require('gulp-cssmin');
var semver = require('semver');
// var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var bump = require('gulp-bump');
var config = require('./gulp');

var connect = require('gulp-connect');
var awsDetails = require('./ignored/aws.json');
var awspublish = require('gulp-awspublish');
var awsPublisher = awspublish.create(awsDetails);

var awsHeaders = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
};

var pkg;

//get paths from config file
var paths = config.paths;
var bowerPackages = config.bowerPackages;
var vendorPackages = config.vendorPackages;
var libs = bowerPackages.concat(vendorPackages);

//to set production env use --production in command line
//production will minify & concat scripts/libs
var isProduction = Boolean(gutil.env.production);

//jade -> html
gulp.task('jade', function() {
    return gulp.src(paths.origin.jade)
        .pipe(flatten())
        .pipe(jade({
            pretty: !isProduction
        }))
        .pipe(gulp.dest(paths.build));
});

gulp.task('usemin', ['jade', 'libs'], function() {
    if (!isProduction) {
        gulp.start('scripts');
        return;
    }
    gulp.src(['build/popup.html', 'build/background.html'])
        .pipe(usemin({
            jsmin: uglify()
        }))
        .pipe(gulp.dest(paths.build));
});

//less -> css
gulp.task('less', function() {
    return gulp.src(paths.origin.less)
        .pipe(less())
        .pipe(cssmin())
        .pipe(gulp.dest(paths.dist.less));
});

// copy & uglify js scripts
gulp.task('scripts', function() {
    if (!isProduction) {
        return gulp.src(paths.origin.js)
            .pipe(gulp.dest(paths.dist.js));
    } else {
        return gulp.src(paths.origin.js)
            .pipe(uglify())
            .pipe(gulp.dest(paths.dist.js));
    }
});

gulp.task('serve', ['build'], function() {
    connect.server({
        root: 'build',
        port: 8080,
        livereload: true
    });
});

gulp.task('livereload', function() {
    connect.reload();
});

//clean build folder
gulp.task('clean', function() {
    return gulp.src(paths.build, {
        read: false
    }).pipe(clean());
});

//bump versions on package/bower/manifest
gulp.task('bump', function() {
    //reget package
    var _pkg = getPackageJson();
    //increment version
    var newVer = semver.inc(_pkg.version, 'patch');
    //log action
    gutil.log('Bumping version', gutil.colors.cyan(_pkg.version), '=>', gutil.colors.blue(newVer));
    //increment bower & package version separately since they are in different places
    gulp.src(['./bower.json', './package.json'])
        .pipe(bump({
            version: newVer
        }))
        .pipe(gulp.dest('./'));
});

//handle assets
gulp.task('assets', function() {
    //copy regular assets
    gulp.src('./src/assets/**/*')
        .pipe(gulp.dest('./build/assets'));

    return gulp.src('./src/img/**/*')
        .pipe(gulp.dest('./build/img'));
});

//copy libs
gulp.task('libs', function() {
    return gulp.src(libs)
        .pipe(gulp.dest(paths.dist.libs));
});

//all tasks are watch -> bump patch version -> reload extension (globally enabled)
gulp.task('watch', function() {
    gulp.watch('./src/**/*', ['build', 'livereload']);
});

gulp.task('build', ['clean'], function() {
    gulp.start('assets', 'libs', 'jade', 'less', 'scripts', 'usemin');
});

//default task
gulp.task('default', function() {
    gulp.start('build', 'serve', 'watch');
});

// aws
gulp.task('deploy', ['build'], function() {
    return gulp.src('./build/**')
        .pipe(awsPublisher.publish(awsHeaders))
        .pipe(awsPublisher.sync()) // sync local directory with bucket
    //.pipe(awsPublisher.cache()) // create a cache file to speed up next uploads
    .pipe(awspublish.reporter()); // print upload updates to console
});
