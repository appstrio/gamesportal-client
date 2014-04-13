/*
 * main module
 */
angular.module('myApp', [
    'aio.main', 'aio.settings', 'aio.analytics', 'aio.games', 'aio.firebase', 'wu.masonry',
    'ui.router', 'ngSanitize', 'aio.counter', 'angularjs.media.directives', 'infinite-scroll',
    'aio.win', 'aio.leaderboard', 'aio.facebook', 'aio.config', 'aio.chrome', 'aio.common', 'ui.bootstrap'
]).config(['$stateProvider', '$urlRouterProvider', '$sceDelegateProvider',
    function ($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('main', {
                url: '/:overlayID',
                templateUrl: 'main.html'
            })
            .state('game', {
                url: '/games/:gameID',
                templateUrl: 'game.html',
                controller: 'GameCtrl'
            }).state('editGame', {
                url: '/games/:gameID/edit',
                templateUrl: 'edit-game.html',
                controller: 'EditGameCtrl'
            });

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            'http://**',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'http://cdn1.kongcdn.com/**',
            'http://e.miniclip.com/**',
            'http://external.kongregate-games.com/**',
            'http://external.kongregate-games.com/**',
            'http://static.miniclip.com/**',
            'http://swf.gamedistribution.com/**',
            'http://www.miniclip.com/**',
            'http://www.myplayyard.com/**'
        ]);
    }
]);

//first boot angular
angular.element(document).ready(function () {
    //bootstrap
    angular.bootstrap(document, ['myApp']);
});
