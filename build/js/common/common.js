var commonModule = commonModule || angular.module('aio.common', []);

commonModule.directive('overlay', ['$rootScope', function($rootScope){
    return function(scope, element, attrs){
        element.on('click', function(){
            $rootScope.$apply(function(){
                scope.closeOverlay(attrs.overlay);
            })
        }).on('click', '.modal-dialog', function(e){
                e.stopPropagation();
        });
    }
}]);