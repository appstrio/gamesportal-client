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
            scope   : {
                isSmall: '=',
                isFixed: '='
            },
            link    : function (scope, element, attrs) {
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
]);