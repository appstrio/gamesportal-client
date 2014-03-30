var paths = {
    build: 'build',
    assets: 'assets',
    vendor: 'js/vendor',
    bower: 'src/bower_components',
    less: 'less',
    css: 'css',
    jade: 'jade',
    src: 'src'
};

var bowerPackages = [
    paths.bower + '/jquery/jquery.min.js',
    paths.bower + '/angular/angular.min.js',
    paths.bower + '/underscore/underscore-min.js',
    paths.bower + '/async/lib/async.js',
    paths.bower + '/angular-masonry/angular-masonry.js',
    paths.bower + '/masonry/dist/masonry.pkgd.min.js',
    paths.bower + '/angular-ui-router/release/angular-ui-router.js',
    paths.bower + '/firebase/firebase.js',
    paths.bower + '/firebase-simple-login/firebase-simple-login.js',
    paths.bower + '/angularfire/angularfire.js',
    paths.bower + '/angular-sanitize/angular-sanitize.js',
    paths.bower + '/angularjs-media/app/lib/angularjs.media.directives.js',
    paths.bower + '/ng-infinite-scroller/build/ng-infinite-scroll.min.js'



];

var vendorPackages = [
//    paths.src + '/' + paths.vendor + '/jquery-ui.js',
];

paths.origin = {
    jade: paths.src + '/jade/**/*.jade',
    less: paths.src + '/less/*.less',
    assets: paths.assets + '/**/*',
    manifest: paths.src + '/manifest.json',
    js: [paths.src + '/js/**/*.js', '!' + paths.src + '/js/vendor/**/*.js']
};

paths.dist = {
    less: paths.build + '/css',
    libs: paths.build + '/' + paths.vendor,
    extraBuild: paths.build + '/data',
    minifiedScripts: 'scripts.min.js',
    minifiedLibs: 'libs.min.js',
    js: paths.build + '/js'
};

exports.paths = paths;
exports.bowerPackages = bowerPackages;
exports.vendorPackages = vendorPackages;
