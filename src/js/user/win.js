var winModule = winModule || angular.module('aio.win', []);

winModule.controller('WinCtrl', ['$scope', 'Facebook', 'Win', 'Chrome',
    function ($scope, Facebook, Win, Chrome) {

        $scope.inviteFBFriends = function () {
            Win.winFacebookInvite().then(function () {
                alert('success');
            }).
            catch (function (msg) {
                console.warn('Problem sharing to friends', msg);
            });
        };

        //true if user has app installed
        $scope.isChromeInstalled = Chrome.isAppInstalled();

        $scope.installChromeApp = function () {
            //make sure app isn't installed safety
            if (!$scope.isChromeInstalled) {
                console.log('offer to download extension');
                //install app then add points
                Win.winChromeApp().then(function () {
                    console.log('success install');
                }, function (e) {
                    console.warn('error install', e);
                });
            }
        };

    }
]).factory('Win', ['$rootScope', 'Facebook', 'Firebase', 'Config', 'Chrome',
    function ($rootScope, Facebook, Firebase, Config, Chrome) {
        var FACEBOOK_INVITE_POINTS = Config.POINTS.FACEBOOK_INVITE,
            CHROME_APP_INSTALL_POINTS = Config.POINTS.CHROME_APP_INSTALL;

        return {
            winFacebookInvite: function () {
                return Facebook.inviteFriends().then(function () {
                    return Firebase.raisePoints(FACEBOOK_INVITE_POINTS);
                });
            },

            winChromeApp: function () {
                return Chrome.installApp().then(function () {
                    return Firebase.raisePoints(CHROME_APP_INSTALL_POINTS);
                });
            }
        };
    }
]);
