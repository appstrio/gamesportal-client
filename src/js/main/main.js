/* global ga */
var mainModule = mainModule || angular.module('aio.main', []);

mainModule.controller('MainCtrl', [
    '$scope', '$log', '$q', '$timeout', '$http', 'Firebase',
    'Games', '$state', '$stateParams', 'Facebook', 'Chrome', 'Config', '$translate',
    function ($scope, $log, $q, $timeout, $http, Firebase, Games, $state, $stateParams,
        Facebook, Chrome, Config, $translate) {
        $scope.allGames = [];
        $scope.appName = Config.APP_NAME;
        $scope.appLogo = './img/logo-' + $scope.appName.toLowerCase().replace(/ /g, '') + '.png';
        document.title = $scope.appName;

        //lazy load adsense
        if ($scope.appName === 'Mojo Games') {
            $.getScript('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', function () {
                console.debug('loaded google ads');
            });
        }
        //lazy load addthis
        $.getScript('//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-534644e35a88a9ba', function () {
            window.addthis_config = window.addthis_config || {};
            window.addthis_config.data_track_addressbar = false;
        });

        var page = 0, //  hold current page
            loaded = false; // whether the app was already loaded

        var rand = _.random(0, 999999999);
        $scope.topIframeAd = {
            iframe: 'http://ads.ad4game.com/www/delivery/afr.php?zoneid=39440&cb=' + rand,
            a: 'http://ads.ad4game.com/www/delivery/dck.php?n=af1fdb1c&cb=' + rand,
            img: 'http://ads.ad4game.com/www/delivery/avw.php?zoneid=39440&cb=' + rand + '&n=af1fdb1c'
        };
        $scope.rightSkyAd = {
            iframe: 'http://ads.ad4game.com/www/delivery/afr.php?zoneid=39438&cb=' + rand,
            a: 'http://ads.ad4game.com/www/delivery/dck.php?n=a1a724da&cb=' + rand,
            img: 'http://ads.ad4game.com/www/delivery/avw.php?zoneid=39438&cb=' + rand + '&n=a1a724da'
        };

        //header is fixed by default
        $scope.fixedHeader = true;
        $scope.smallHeader = false;

        // init - get all games from games db
        Games.then(function (games) {
            $scope.allGames = _.sortBy(_.toArray(games), function (i) {
                return parseInt(i.priority);
            });
            var repeatLargeThumbnailsEvery = 20,
                lastLargeThumbnailIndex = 0;

            angular.forEach($scope.allGames, function (game, index) {
                //stop if thumbnail is found
                _.some(game.thumbnails, function (thumbnail) {
                    if (thumbnail.width > 250 && thumbnail.height > 250) {
                        game.largeThumbnail = thumbnail;
                        if (index > 10 && (!lastLargeThumbnailIndex || (index - lastLargeThumbnailIndex) > repeatLargeThumbnailsEvery)) {
                            lastLargeThumbnailIndex = index;
                            game.promoted = true;
                        }
                        return true;
                    }
                    return false;
                });
            });

            $scope.games = _.first($scope.allGames, Config.GAMES_PER_FIRSTPAGE);
        });

        $scope.getGameClass = function (game, $index) {
            var _class = {};
            if (($index + 1) % 21 === 0) {
                _class['rotated-right'] = true;
            } else if (($index + 1) % 18 === 0) {
                _class['rotated-left'] = true;
            }

            if (game.premium) {
                _class.premium = true;
            } else if (game.hot) {
                _class.hot = true;
            }

            if (game.promoted && game.largeThumbnail) {
                _class.promoted = true;
            }

            return _class;
        };

        // init - init user data object
        Firebase.initting().then(function () {
            $scope.userData = Firebase.userData();
        });

        // masonry options
        $scope.masonryOptions = {
            gutter: 20,
            isFitWidth: true,
            isAnimated: false
        };

        loaded = true;

        // login user
        $scope.login = function () {
            return Facebook.login();
        };

        // logout user
        $scope.logout = function () {
            return Firebase.logout();
        };

        // render more games
        $scope.loadMore = _.throttle(function () {
            if (!$scope.allGames) {
                return;
            }
            ++page;
            $scope.games = _.first($scope.allGames, Config.GAMES_PER_FIRSTPAGE + (page * Config.GAMES_PER_PAGE));
        }, 2000);

        var loadGame = function (gameId) {
            $state.go('game', {
                gameID: gameId
            });
        };

        // load game
        $scope.runGame = function (game, e) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            //reset search field
            $scope.gameSearch = '';
            //if app isn't installed, and this is a first time user
            if (!Chrome.isAppInstalled() && !Config.RETURN_USER && $scope.appName === 'Gamestab') {
                console.log('offer to download extension');
                //deprecated for now due to #51
                Chrome.installApp()['finally'](function () {
                    localStorage.returnUser = true;
                    Config.RETURN_USER = true;
                    loadGame(game.id);
                });
            } else {
                loadGame(game.id);
            }
        };

        //open overlay
        $scope.openMainOverlay = function (overlayID) {
            $scope.overlayID = overlayID;
        };

        $scope.playAnotherGame = function () {
            $scope.runGame($scope.allGames[_.random(0, $scope.allGames.length - 1)]);
        };

        // close overlay
        $scope.closeOverlay = function () {
            if ($stateParams.overlayID) {
                $state.transitionTo($state.current, {}, {
                    location: 'true',
                    reload: false,
                    inherit: false,
                    notify: false
                });
            }
            $scope.overlayID = null;
        };

        // go back home (and laod overlay)
        $scope.goHome = function (overlayID) {
            $state.go('main', {
                overlayID: overlayID
            });
        };
        // change the language of the site given the language key
        $scope.changeLanguage = function (nationality) {
            $translate.use(nationality.langKey);
            $scope.selectedNationality = nationality;
            $scope.dropdownFlags = false;
        };
        var hideFlag = _.debounce(function () {
            $scope.$apply(function () {
                $scope.dropdownFlags = false;
            });
        }, 10);

        var languageTimeout;
        $scope.showLanguageMenu = function () {
            $scope.dropdownFlags = true;
            clearTimeout(languageTimeout);
            languageTimeout = setTimeout(hideFlag, 1500);
        };

        $scope.keepLanguageMenu = function () {
            clearTimeout(languageTimeout);
            $scope.dropdownFlags = true;
        };

        $scope.nationalities = [{
            langKey: 'en',
            language: 'English',
            flag: './img/flags/en.png'
        }, {
            langKey: 'es',
            language: 'Español',
            flag: './img/flags/es.png'
        }, {
            langKey: 'he',
            language: 'עברית',
            flag: './img/flags/he.png'
        }, {
            langKey: 'pt',
            language: 'Português',
            flag: './img/flags/pt.png'
        }, {
            langKey: 'de',
            language: 'Deutsch',
            flag: './img/flags/de.png'
        }, {
            langKey: 'fr',
            language: 'Français',
            flag: './img/flags/fr.png'
        }, {
            langKey: 'pl',
            language: 'Polski',
            flag: './img/flags/pl.png'
        }];
        //default-flag TEMP until auto select will be implemented
        $scope.selectedNationality = $scope.nationalities[0];

        ga('create', Config.ANALYTICS_ID, {
            'cookieDomain': 'none'
        });
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $scope.masonryOptions.isAnimated = false;
            $scope.masonryOptions.transitionDuration = 0;
            $scope.overlayID = $stateParams.overlayID;

            //report analytics on state change
            if (toState.name !== fromState.name) {
                ga('send', 'pageview', {
                    page: window.location.pathname +
                        window.location.hash
                });

            }

            //header doesn't stay fixed in game state to have banner in view
            $scope.fixedHeader = toState.name !== 'game';
        });
    }
]);
