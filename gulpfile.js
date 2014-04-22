var gulp = require('gulp');
var $gulp = require('gulp-load-plugins')({
    lazy: false
});
var semver = require('semver');
var config = require('./gulp');
var paths = config.paths;
var bowerPackages = config.bowerPackages;
var vendorPackages = config.vendorPackages;
//bower packages and vendor libs scripts
var libs = bowerPackages.concat(vendorPackages);

//jade -> html
gulp.task('scripts', function () {
    //create scripts stream
    gulp.src(['./src/js/**/*.js', '!./src/js/{snippets,vendor}/*.js'])
        .pipe($gulp.uglify())
        .pipe($gulp.concat('scripts.min.js'))
        .pipe($gulp.rev())
        .pipe(gulp.dest(paths.dist.js))
        .pipe($gulp.size({
            showFiles: true
        }));
});

gulp.task('vendors', function () {
    gulp.src(libs)
        .pipe($gulp.concat('vendors.min.js'))
        .pipe($gulp.rev())
        .pipe(gulp.dest(paths.dist.libs))
        .pipe($gulp.size({
            showFiles: true
        }));
});

gulp.task('html', function () {
    //process jades
    gulp.src(paths.origin.jade)
        .pipe($gulp.flatten())
        .pipe($gulp.jade({
            pretty: true
        }))
        .pipe(gulp.dest(paths.build))
        .pipe($gulp.size({
            showFiles: true
        }))
        .pipe($gulp.sitemap({
            siteUrl: 'http://www.mojo-games.com'
        }))
        .pipe(gulp.dest(paths.build));
});

//less -> css
gulp.task('css', function () {
    return gulp.src(paths.origin.less)
        .pipe($gulp.less())
        .pipe($gulp.autoprefixer())
        .pipe($gulp.concat('styles.min.css'))
        .pipe($gulp.rev())
        .pipe($gulp.cssmin())
        .pipe(gulp.dest(paths.dist.less))
        .pipe($gulp.size({
            showFiles: true
        }));
});

gulp.task('inject', ['html', 'scripts', 'vendors', 'css'], function () {
    gulp.src('./build/index.html')
        .pipe($gulp.inject(gulp.src(['build/js/**/*.js', 'build/css/**/*.css'], {
            read: false
        }), {
            addRootSlash: false,
            ignorePath: 'build',
            sort: function (a) {
                if (a.filepath.indexOf('vendors') > -1) {
                    return -1;
                }
                return 1;
            }
        }))
        .pipe(gulp.dest(paths.build));
});

gulp.task('serve', ['build'], function () {
    $gulp.connect.server({
        root: 'build',
        port: 8080,
        livereload: true
    });
});

gulp.task('livereload', ['build'], function () {
    $gulp.connect.reload();
});

//clean build folder
gulp.task('clean', function () {
    return gulp.src(paths.build, {
        read: false
    })
        .pipe($gulp.clean());
});

//bump versions on package/bower/manifest
gulp.task('bump', function () {
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
gulp.task('assets', function () {
    // copy regular assets
    // gulp.src('./src/assets/**/*')
        // .pipe(gulp.dest('./build/assets'));

    //copy images
    return gulp.src('./src/img/**/*.{ico,jpeg,jpg,gif,bmp,png,webp}')
        .pipe(gulp.dest('./build/img'));
});

//all tasks are watch -> bump patch version -> reload extension (globally enabled)
gulp.task('watch', function () {
    gulp.watch('./src/**/*', ['build', 'livereload']);
});

gulp.task('build', ['clean'], function () {
    gulp.start('assets', 'vendors', 'css', 'html', 'scripts', 'inject');
});

//default task
gulp.task('default', function () {
    gulp.start('build', 'serve', 'watch');
});

// aws
gulp.task('deploy', ['build', 'assets', 'inject'], function () {
    /*
     * AWS Configuration
     */
    var details = require('./ignored/aws.json');
    var publisher = $gulp.awspublish.create(details);
    var headers = {
        'Cache-Control': 'max-age=315360000, no-transform, public'
    };

    return gulp.src('build/**/*')
        .pipe(publisher.publish(headers))
        .pipe(publisher.sync()) // sync local directory with bucket
    .pipe($gulp.awspublish.reporter()); // print upload updates to console
});
