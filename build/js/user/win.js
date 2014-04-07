var winModule = winModule || angular.module('aio.win', []);

winModule.controller('WinCtrl', ['$scope', 'Facebook', 'Win',
    function($scope, Facebook, Win) {

        $scope.inviteFBFriends = function() {
            Win.winFacebookInvite().then(function() {
                alert('success');
            }).
            catch (function(msg) {
                alert('error:' + msg);
            });
        };

        $scope.installChromeApp = function() {
            Win.winChromeApp().then(function() {
                alert('success');
            }).
            catch (function(msg) {
                console.log('error:', msg);
                alert('error:' + msg);
            });
        };

    }
]).factory('Win', ['$rootScope', 'Facebook', 'Firebase', 'Config', 'Chrome',
    function($rootScope, Facebook, Firebase, Config, Chrome) {
        var FACEBOOK_INVITE_POINTS = Config.POINTS.FACEBOOK_INVITE,
            CHROME_APP_INSTALL_POINTS = Config.POINTS.CHROME_APP_INSTALL;

        return {
            winFacebookInvite: function() {
                return Facebook.inviteFriends().then(function(response) {
                    return Firebase.raisePoints(FACEBOOK_INVITE_POINTS);
                });
            },

            winChromeApp: function() {
                return Chrome.installApp().then(function() {
                    return Firebase.raisePoints(CHROME_APP_INSTALL_POINTS);
                });
            }

        };
    }
]);
