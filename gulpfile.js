var gulp = require('gulp');
var $gulp = require('gulp-load-plugins')({
    lazy: false
});
var semver = require('semver');
var config = require('./gulp');

/*
 * AWS Configuration
 */
var awsDetails = require('./ignored/aws.json');
var awsPublisher = $gulp.awspublish.create(awsDetails);
var awsHeaders = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
};

//get paths from config file
var paths = config.paths;
var bowerPackages = config.bowerPackages;
var vendorPackages = config.vendorPackages;
var libs = bowerPackages.concat(vendorPackages);

//jade -> html
gulp.task('jade', function() {
    return gulp.src(paths.origin.jade)
        .pipe($gulp.flatten())
        .pipe($gulp.jade({
            pretty: false
        }))
        .pipe(gulp.dest(paths.build))
        .pipe($gulp.sitemap({
            siteUrl: 'http://www.mojo-games.com'
        }))
        .pipe(gulp.dest(paths.build));
});

//less -> css
gulp.task('less', function() {
    return gulp.src(paths.origin.less)
        .pipe($gulp.less())
        .pipe($gulp.autoprefixer())
        .pipe($gulp.cssmin())
        .pipe(gulp.dest(paths.dist.less));
});

// copy & uglify js scripts
gulp.task('scripts', function() {
    return gulp.src(paths.origin.js)
        .pipe($gulp.uglify())
        .pipe(gulp.dest(paths.dist.js));
});

gulp.task('serve', ['build'], function() {
    $gulp.connect.server({
        root: 'build',
        port: 8080,
        livereload: true
    });
});

gulp.task('livereload', ['build'], function() {
    $gulp.connect.reload();
});

//clean build folder
gulp.task('clean', function() {
    return gulp.src(paths.build, {
        read: false
    })
        .pipe($gulp.clean());
});

//bump versions on package/bower/manifest
gulp.task('bump', function() {
    //reget package
    var _pkg = require('package.json');
    //increment version
    var newVer = semver.inc(_pkg.version, 'patch');
    //log action
    $gulp.util.log('Bumping version', $gulp.util.colors.cyan(_pkg.version), '=>', $gulp.util.colors.blue(newVer));
    //increment bower & package version separately since they are in different places
    gulp.src(['./bower.json', './package.json'])
        .pipe($gulp.bump({
            version: newVer
        }))
        .pipe(gulp.dest('./'));
});

//handle assets
gulp.task('assets', function() {
    //copy regular assets
    gulp.src('./src/assets/**/*')
        .pipe(gulp.dest('./build/assets'));

    //copy images
    return gulp.src('./src/img/**/*.{ico,jpeg,jpg,gif,bmp,png,webp}')
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
    gulp.start('assets', 'libs', 'jade', 'less', 'scripts');
});

//default task
gulp.task('default', function() {
    gulp.start('build', 'serve', 'watch');
});

// aws
gulp.task('deploy', ['build'], function() {
    return gulp.src('./build/**/*')
        .pipe(awsPublisher.publish(awsHeaders))
        .pipe(awsPublisher.sync()) // sync local directory with bucket
    //.pipe(awsPublisher.cache()) // create a cache file to speed up next uploads
    .pipe($gulp.awspublish.reporter()); // print upload updates to console
});
