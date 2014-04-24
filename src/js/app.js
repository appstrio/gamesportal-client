/*
 * main module
 */
angular.module('myApp', [
    'aio.main', 'aio.settings', 'aio.analytics', 'aio.games', 'aio.firebase', 'wu.masonry',
    'ui.router', 'ngSanitize', 'aio.counter', 'angularjs.media.directives', 'infinite-scroll',
    'aio.win', 'aio.leaderboard', 'aio.facebook', 'aio.config', 'aio.chrome', 'aio.common', 'ui.bootstrap',
    'pascalprecht.translate'
]).config(['$stateProvider', '$urlRouterProvider', '$sceDelegateProvider', '$translateProvider',
    function ($stateProvider, $urlRouterProvider, $sceDelegateProvider, $translateProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('main', {
                url        : '/:overlayID',
                templateUrl: 'main.html'
            })
            .state('game', {
                url        : '/games/:gameID',
                templateUrl: 'game.html',
                controller : 'GameCtrl'
            }).state('editGame', {
                url        : '/games/:gameID/edit',
                templateUrl: 'edit-game.html',
                controller : 'EditGameCtrl'
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

        $translateProvider.translations('en', {
            'FIND_GAME'      : 'Find A Game',
            'COINS_COLLECTED': 'coins collected',
            'CONNECT'        : 'Connect',
            'SIGNOUT'        : 'Sign Out',
        });

        $translateProvider.translations('es', {
            'FIND_GAME'      : 'Busca un Juego',
            'COINS_COLLECTED': 'monedas recogidas',
            'CONNECT'        : 'Conectar',
            'SIGNOUT'        : 'Salir',
        });

        $translateProvider.translations('he', {
            'FIND_GAME'      : 'מצא משחק',
            'COINS_COLLECTED': 'מטבעות שצברת',
            'CONNECT'        : 'התחבר',
            'SIGNOUT'        : 'התנתק',
        });

        $translateProvider.translations('pt', {
            'FIND_GAME'      : 'encontrar um Jogo',
            'COINS_COLLECTED': 'moedas coletadas',
            'CONNECT'        : 'Conectar',
            'SIGNOUT'        : 'Sair',

        });

        $translateProvider.translations('de', {
            'FIND_GAME'      : 'Finden Sie ein Spiel',
            'COINS_COLLECTED': 'münzen gesammelt',
            'CONNECT'        : 'Verbinden',
            'SIGNOUT'        : 'austragen',

        });

        $translateProvider.translations('fr', {
            'FIND_GAME'      : 'trouver un jeu',
            'COINS_COLLECTED': 'pièces collectées',
            'CONNECT'        : 'Relier',
            'SIGNOUT'        : 'Déconnexion',
        });

        $translateProvider.translations('pl', {
            'FIND_GAME'      : 'Znajdź grę',
            'COINS_COLLECTED': 'monety zebrane',
            'CONNECT'        : 'połączyć',
            'SIGNOUT'        : 'zaloguj się',
        });

        $translateProvider.preferredLanguage('en');

    }
]);

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
