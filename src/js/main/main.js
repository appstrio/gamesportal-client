var mainModule = mainModule || angular.module('aio.main', []);

mainModule.controller('MainCtrl', [
    '$scope', '$log', '$q', '$timeout', '$http', 'Firebase',
    'Games', '$state', '$stateParams', 'Facebook', 'Chrome', 'Config', '$window',
    function ($scope, $log, $q, $timeout, $http, Firebase,
        Games, $state, $stateParams, Facebook, Chrome, Config, $window) {

        var allGames, // hold all the games
            gamesPerFirstPage = 50, // amount of games for the first page
            gamesPerPage = 50, // amount of games for load more games
            page = 0, //  hold current page
            loaded = false; // whether the app was already loaded

        //make header small
        var changeHeader = _.debounce(function (e) {
            $('header').toggleClass('smaller', $window.scrollY > 10);
        }, 10);

        angular.element($window).on('scroll', changeHeader);

        // init - get all games from games db
        Games.then(function (games) {

            allGames = _.sortBy(_.toArray(games), function (game) {
                return parseInt(game.priority);
            });

            var repeatLargeThumbnailsEvery = 20,
                lastLargeThumbnailIndex = 0;
            angular.forEach(allGames, function (game, index) {
                angular.forEach(game.thumbnails, function (thumbnail) {
                    if (thumbnail.width > 250 && thumbnail.height > 250) {
                        game.largeThumbnail = thumbnail;
                        if (index > 10 && (!lastLargeThumbnailIndex || (index - lastLargeThumbnailIndex) > repeatLargeThumbnailsEvery)) {
                            lastLargeThumbnailIndex = index;
                            game.promoted = true;
                        }
                    }
                });
            });

            $scope.games = allGames.slice(0, gamesPerFirstPage);
        });

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
            if (!allGames) {
                return;
            }
            ++page;
            $scope.games = allGames.slice(0, gamesPerFirstPage + (page * gamesPerPage));
        }, 2000);

        var loadGame = function (gameId) {
            $state.go('game', {
                gameID: gameId
            });
        };

        // load game
        $scope.runGame = function (game, e) {
            e.stopPropagation();
            e.preventDefault();
            //if app isn't installed, and this is a first time user
            if (!Chrome.isAppInstalled() && !Config.RETURN_USER) {
                console.log('offer to download extension');
                Chrome.installApp()['finally'](function () {
                    loadGame(game.id);
                    localStorage.returnUser = true;
                    Config.RETURN_USER = true;
                });
            } else {
                loadGame(game.id);
            }
        };

        //open overlay
        $scope.openMainOverlay = function (overlayID) {
            console.log('overlayID', overlayID);
            $scope.overlayID = overlayID;
        };

        // close overlay
        $scope.closeOverlay = function (overlay) {
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

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $scope.masonryOptions.isAnimated = false;
            $scope.masonryOptions.transitionDuration = 0;
            $scope.overlayID = $stateParams.overlayID;
        });
    }
]);
