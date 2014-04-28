/* global swfobject */
var gamesModule = gamesModule || angular.module('aio.games', []);

gamesModule.service('Games', ['$log', '$q', '$timeout', '$http', 'Firebase',
    function ($log, $q, $timeout, $http, Firebase) {

        var localStorageKey = 'games';
        var oldTimeout = 1000 * 3600 * 24;
        var veryOldTimeout = 1000 * 3600 * 24 * 7;
        var initting = $q.defer();

        var initLocalStorage = function () {
            try {
                if (isLocalStorage()) {
                    var str = localStorage.getItem(localStorageKey);
                    var obj = JSON.parse(str);
                    if (obj.games && obj.games) {
                        if (isVeryOld(obj.timestamp)) {

                        } else if (isOld(obj.timestamp)) {
                            refreshFirebase();
                            return initting.resolve(obj.games);
                        } else {
                            return initting.resolve(obj.games);
                        }
                    }
                }
            } catch (e) {
                console.warn('Ran into', e);
            } finally {
                initFirebase();
            }
        };

        var refreshFirebase = function () {
            Firebase.getGames().then(function (games) {
                storeGames(games);
            });
        };

        var initFirebase = function () {
            Firebase.getGames().then(function (games) {
                initting.resolve(games);
                storeGames(games);
            }).
            catch (function () {
                initting.reject();
            });
        };

        var storeGames = function (array) {
            if (isLocalStorage()) {
                var obj = {
                    timestamp: Date.now(),
                    games: array
                };
                try {
                    var str = JSON.stringify(obj);
                    localStorage.setItem(localStorageKey, str);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        var isLocalStorage = function () {
            return localStorage && localStorage.getItem;
        };

        var isOld = function (timestamp) {
            return (Date.now() - parseInt(timestamp) >= oldTimeout);
        };

        var isVeryOld = function (timestamp) {
            return (Date.now() - parseInt(timestamp) >= veryOldTimeout);
        };

        if (isLocalStorage()) {
            initLocalStorage();
        } else {
            initFirebase();
        }

        return initting.promise;
        //    return $http.get('bizigames.json?rnd=' + Date.now()).then(function(data){
        //        return data.data;
        //    });
    }
]).controller('GameCtrl', ['$scope', '$log', '$q', '$timeout', '$http', '$stateParams', '$state', 'Firebase', 'Games', 'GamesHelpers',

    function ($scope, $log, $q, $timeout, $http, $stateParams, $state, Firebase, Games, GamesHelpers) {
        var pointsPerGame = 100;
        $scope.gameLoading = true;

        /**
         * initializes the service.
         * extract the game ID from the url params
         * and find it in the games DB.
         * if no game found, redirect back to home page.
         * if game was found, check whether it is a premium game
         * and if yes whether game is unlocked.
         * if game isn't unlocked, offer to unlock the game
         */
        var init = function () {
            // get game ID
            var gameId = $stateParams.gameID;
            // check if game ID is ok
            if (!gameId) {
                $state.go('main');
            }

            // find game in the games DB
            GamesHelpers.findGameById(gameId).then(function (game) {
                // check if found game
                if (!game) {
                    return $state.go('main');
                }

                if (game.source === 'miniclip') {
                    $scope.miniclipURL = 'http://www.miniclip.com/games/' + game.data_game_name + '/en/webgame.php?bodybg=1&width=' + game.width + '&height=' + game.height;
                }
                // check access
                return checkPremium(game);
            });

            // get more games
            Games.then(function (games) {
                var howMany = 8;
                $scope.moreGames = _.shuffle(games).slice(0, howMany);
                $scope.evenMoreGames = _.shuffle(games).slice(0, 5);
            });
        };

        /**
         * check if game is premium, and if user unlocked the game
         * @param game
         */
        var checkPremium = function (game) {
            // check access
            return Firebase.checkAccessToGame(game).then(function (access) {
                if (access) {
                    // access granted - play game
                    $scope.game = game;
                    GamesHelpers.raisePointsForGame(game);
                } else {
                    // no access - show overlay
                    $scope.lockedGame = game;
                    $scope.overlayUnlockGame = true;
                }
            }).
            catch (function () {
                alert('Error check premium');
            });
        };

        $scope.getGameZoom = _.memoize(function (game) {
            if (!game || !game.width) {
                return;
            }
            var widthFactor, heightFactor;

            widthFactor = game.width > 640 ? 640 / game.width : 1;
            heightFactor = game.height > 480 ? 480 / game.height : 1;
            return Math.min(1, widthFactor, heightFactor);
        });

        $scope.rateGame = function (game, side) {
            if (!game || !game.name || !game.id) {
                console.warn('missing game info', game);
                return;
            }
            if ($scope.votingProgress) {
                return alert('Please wait... Still not done voting');
            }
            var field = side === 'down' ? 'voteDown' : 'voteUp';
            console.log('Sending rating', game.name, field);
            $scope.votingProgress = true;
            Firebase.changeGameRating(game, field, function (error, success, snapshot) {
                if (error) {
                    console.warn('problem with rating', error);
                }

                //TODO update local game with new value
                console.log('new value', field, snapshot.val());
                $scope.$apply(function () {
                    game[field] = snapshot.val();
                    $scope.votingProgress = false;
                });
            });
        };

        var defaultRating = 4;

        $scope.getGameRating = function (game) {
            if (!game) {
                return defaultRating;
            }

            if (game.voteUp > 0 || game.voteDown > 0) {
                var up = game.voteUp || 0;
                var down = game.voteDown || 0;
                return (up / (up + down) * 5).toFixed(2);
            }

            return defaultRating;
        };

        /**
         * unlock the game by paying coins
         * @param game
         */
        $scope.unlockGame = function (game) {
            Firebase.unlockGame(game).then(function () {
                $scope.game = game;
                $scope.lockedGame = null;
                $scope.overlayUnlockGame = false;
            }, function () {

            });
        };

        $scope.getIframeSize = function (game) {
            var ret = {};
            var scale = 'scale(' + $scope.getGameZoom(game) + ')';
            ret['-moz-transform'] = ret['-o-transform'] = ret['-webkit-transform'] = scale;
            return ret;
        };

        init();
    }
]).controller('EditGameCtrl', ['$scope', '$log', '$q', '$timeout',
    '$http', '$stateParams', '$state', 'Firebase', 'Games', 'GamesHelpers',
    function ($scope, $log, $q, $timeout, $http, $stateParams, $state, Firebase, Games, GamesHelpers) {

        /**
         * initializes the service.
         * extract the game ID from the url params
         * and find it in the games DB.
         * use game number instead if provided
         */
        var init = function () {
            // get game ID
            var gameId = $stateParams.gameID;
            var gamePromise;
            // check if game ID is ok
            if (!gameId) {
                alert('No game id. Cannot continue :(');
            } else {
                gamePromise = GamesHelpers.findGameById(gameId);
            }

            // find game in the games DB
            if (gamePromise) {
                gamePromise.then(function (game) {
                    // check if found game
                    if (!game) {
                        alert('Cant find the game with game id' + gameId);
                    } else {
                        $scope.game = game;
                        GamesHelpers.getGameIndex(game.id).then(function (index) {
                            $scope.gameIndex = index;
                        });
                    }
                }).
                catch (function () {
                    alert('Cant find the game with game id' + gameId);
                });
            }
        };

        $scope.nextAndSave = function () {
            var game = $scope.game;
            game.priority = game.priority || 1000;
            Firebase.setGameWithPriority(game, function () {
                GamesHelpers.findNextGameById(game.id).then(function (newGame) {
                    if (newGame) {
                        $state.go('editGame', {
                            gameID: newGame.id
                        });
                    } else {
                        alert('cant find next game :(');
                    }

                });
            });
        };

        $scope.previousGame = function () {
            var game = $scope.game;
            GamesHelpers.findPreviousGameById(game.id).then(function (newGame) {
                if (newGame) {
                    $state.go('editGame', {
                        gameID: newGame.id
                    });
                } else {
                    alert('cant find previous game');
                }
            });
        };

        init();

    }

]).factory('GamesHelpers', ['Games', 'Firebase', 'Config',
    function (Games, Firebase, Config) {

        var gamesArr;

        /**
         * find game by game ID
         * @param gameID
         * @returns {*}
         */
        var findGameById = function (gameID) {
            return Games.then(function (games) {
                return _.findWhere(games, {
                    id: gameID
                });
            });
        };

        /**
         * find next game by game ID
         * @param gameID
         * @returns {*}
         */
        var findNextGameById = function (gameID) {
            return Games.then(function (games) {
                gamesArr = gamesArr || _.toArray(games);
                var current = _.findWhere(gamesArr, {
                    id: gameID
                });
                var index = gamesArr.indexOf(current);
                return gamesArr[++index];
            });
        };

        /**
         * find prev game by game ID
         * @param gameID
         * @returns {*}
         */
        var findPreviousGameById = function (gameID) {
            return Games.then(function (games) {
                gamesArr = gamesArr || _.toArray(games);
                var current = _.findWhere(gamesArr, {
                    id: gameID
                });
                var index = gamesArr.indexOf(current);
                index = (index === 0) ? gamesArr.length - 1 : index - 1;
                console.log(index);
                return gamesArr[index];
            });
        };

        var getGameIndex = function (gameID) {
            return Games.then(function (games) {
                gamesArr = gamesArr || _.toArray(games);
                var current = _.findWhere(gamesArr, {
                    id: gameID
                });
                var index = gamesArr.indexOf(current);
                return index;
            });
        };

        /**
         * Raise user's points for playing a game
         */
        var raisePointsForGame = function (game, options) {
            var amount = 0;
            options = options || {};

            if (options.specialReward) {
                amount = Config.POINTS[options.specialReward];
            } else if (game.premium) {
                amount = Config.POINTS.PLAY_PREMIUM_GAME;
            } else if (game.hot) {
                amount = Config.POINTS.PLAY_HOT_GAME;
            } else if (game.new) {
                amount = Config.POINTS.PLAY_NEW_GAME;
            } else {
                amount = Config.POINTS.PLAY_REGULAR_GAME;
            }

            if (options.boost) {
                amount = amount * parseInt(Config.POINTS.BOOST_FACTOR);
            }

            Firebase.raisePoints(amount);
        };

        return {
            findGameById: findGameById,
            findNextGameById: findNextGameById,
            findPreviousGameById: findPreviousGameById,
            raisePointsForGame: raisePointsForGame,
            getGameIndex: getGameIndex
        };
    }
]);
