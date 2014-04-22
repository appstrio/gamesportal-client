var path = require('path');

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
    'angular-masonry/angular-masonry.js',
    'angular-sanitize/angular-sanitize.min.js',
    'angular-ui-router/release/angular-ui-router.min.js',
    'angularjs-media/app/lib/angularjs.media.directives.js',
    'masonry/dist/masonry.pkgd.min.js',
    'ng-infinite-scroller/build/ng-infinite-scroll.min.js'
].map(function (src) {
    return path.join(paths.bower, src);
});

var vendorPackages = [
    //    paths.src + '/' + paths.vendor + '/jquery-ui.js',
    './src/js/vendor/*.js'
];

paths.origin = {
    jade: paths.src + '/jade/**/*.jade',
    less: paths.src + '/less/*.less',
    assets: paths.assets + '/**/*',
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
