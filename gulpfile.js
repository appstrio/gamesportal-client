var path = require('path');
var gulp = require('gulp');
var streamqueue = require('streamqueue');
var $gulp = require('gulp-load-plugins')({
    lazy: false
});

var vendors = [
    'underscore/underscore-min.js',
    'firebase/firebase.js',
    'firebase-simple-login/firebase-simple-login.js',
    'angular-masonry/angular-masonry.js',
    'bootstrap/dist/js/bootstrap.min.js',
    'angular-sanitize/angular-sanitize.min.js',
    'angular-ui-router/release/angular-ui-router.min.js',
    'angularjs-media/app/lib/angularjs.media.directives.js',
    'masonry/dist/masonry.pkgd.min.js',
    'ng-infinite-scroller/build/ng-infinite-scroll.min.js'
].map(function (package) {
    return path.join('./src/bower_components/', package);
}).concat(['./src/js/vendor/*.js']);

//build client scripts
gulp.task('scripts', function () {
    //create scripts stream
    return gulp.src(['./src/js/**/*.js', '!./src/js/{snippets,vendor}/**/*.js'])
        .pipe($gulp.uglify())
        .pipe($gulp.concat('scripts.min.js'))
        .pipe($gulp.rev())
        .pipe(gulp.dest('./build/js/'))
        .pipe($gulp.size({
            showFiles: true
        }));
});

//build vendor scripts
gulp.task('vendors', function () {
    return gulp.src(vendors)
        .pipe($gulp.concat('vendors.min.js'))
        .pipe($gulp.rev())
        .pipe(gulp.dest('./build/js/'))
        .pipe($gulp.size({
            showFiles: true
        }));
});

//build html
gulp.task('html', function () {
    //process jades
    return gulp.src('./src/jade/*.jade')
        .pipe($gulp.flatten())
        .pipe($gulp.jade({
            pretty: true
        }))
        .pipe(gulp.dest('./build/'))
        .pipe($gulp.size({
            showFiles: true
        }))
        .pipe(gulp.dest('./build/'));
});

//compile css
gulp.task('css', function () {
    var stream = streamqueue({
        objectMode: true
    });
    stream.queue(gulp.src(['./src/bower_components/bootstrap/dist/css/bootstrap{,-theme}.min.css']));
    stream.queue(gulp.src(['./src/less/style.less'])
        .pipe($gulp.less())
        .pipe($gulp.autoprefixer()));

    return stream.done()
        .pipe($gulp.flatten())
        .pipe($gulp.concat('styles.min.css'))
        .pipe($gulp.rev())
        .pipe($gulp.cssmin())
        .pipe(gulp.dest('build/css/'))
        .pipe($gulp.size({
            showFiles: true
        }));
});

//inject css, scripts & vendors to index.html
gulp.task('inject', ['html', 'scripts', 'vendors', 'css'], function () {
    return gulp.src('./build/index.html')
    //get src and organize by my desired order
    .pipe($gulp.inject(gulp.src(['./build/{js,css}/{vendors,scripts,styles}*'], {
        read: false
    }), {
        addRootSlash: false,
        ignorePath: 'build'
    })).pipe(gulp.dest('./build/'));
});

gulp.task('serve', ['build'], function () {
    return $gulp.connect.server({
        root: 'build',
        port: 8080,
        livereload: true
    });
});

gulp.task('livereload', ['build'], function () {
    return $gulp.connect.reload();
});

//clean build folder
gulp.task('clean', function () {
    return gulp.src('./build/', {
        read: false
    })
        .pipe($gulp.clean());
});

//bump versions on package/bower/manifest
gulp.task('bump', function () {
    return gulp.src(['./{bower,package}.json'])
        .pipe($gulp.bump())
        .pipe(gulp.dest('./'));
});

gulp.task('fonts', function () {
    return gulp.src(['./src/bower_components/bootstrap/fonts/*'])
        .pipe(gulp.dest('build/fonts/'));
});

//handle assets
gulp.task('images', function () {
    return gulp.src('./src/img/**/*.{ico,jpeg,jpg,gif,bmp,png,webp}')
        .pipe(gulp.dest('./build/img'));
});

//all tasks are watch -> bump patch version -> reload extension (globally enabled)
gulp.task('watch', function () {
    return gulp.watch('./src/**/*', ['build', 'livereload']);
});

gulp.task('build', ['clean'], function () {
    return gulp.start('images', 'fonts', 'css', 'html', 'vendors', 'scripts', 'inject');
});

//default task
gulp.task('default', function () {
    return gulp.start('build', 'serve', 'watch');
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
