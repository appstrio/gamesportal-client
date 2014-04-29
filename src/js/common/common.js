var commonModule = commonModule || angular.module('aio.common', []);

commonModule.directive('overlay', ['$rootScope',
    function ($rootScope) {
        return function (scope, element, attrs) {
            element.on('click', function () {
                $rootScope.$apply(function () {
                    scope.closeOverlay(attrs.overlay);
                });
            }).on('click', '.modal-dialog', function (e) {
                e.stopPropagation();
            });
        };
    }
]).directive('mojoHeader', ['$rootScope', '$window',
    function ($rootScope, $window) {
        return {
            restrict: 'A',
            scope: {
                isSmall: '=',
                isFixed: '='
            },
            link: function (scope, element, attrs) {
                //make header small
                var changeHeader = _.debounce(function () {
                    if (!scope.isFixed) {
                        return;
                    }
                    $rootScope.$apply(function () {
                        scope.isSmall = $window.scrollY > 10 || $window.pageYOffset > 10;
                        element.toggleClass('smaller', scope.isSmall);
                    });
                }, 10);
                angular.element($window).on('scroll', changeHeader);
            }
        };
    }
]).directive('headerMainAd', [

    function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<ins class="adsbygoogle" style="display: inline-block; width: 728px; height: 90px;" data-ad-client="ca-pub-3411183432281537" data-ad-slot="6922520402"></ins>',
            compile: function () {
                return {
                    pre: function () {},
                    post: function () {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    }
                };
            }
        };
    }
]).directive('headerGameAd', [
    function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<ins class="adsbygoogle" style="display: inline-block; width: 728px; height: 90px;" data-ad-client="ca-pub-3411183432281537" data-ad-slot="8399253601"></ins>',
            compile: function () {
                return {
                    pre: function () {},
                    post: function () {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    }
                };
            }
        };
    }
]);
