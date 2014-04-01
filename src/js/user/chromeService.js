var chromeModule = chromeModule || angular.module('aio.chrome', []);

chromeModule.factory('Chrome', ['$rootScope','Config','$http', function($rootScope,Config,$http){

    var CHROME_ID = Config.CHOMRE_APP_ID;

    var isAppInstalled = function(){
        var newtabURL = "chrome-extension://" + CHROME_ID + "/newtab.html";
        return $http.get(newtabURL);
    };

    var chromeAppURL = function(id){
        return "https://chrome.google.com/webstore/detail/" + id;
    };




    var installApp = function(){
        return isAppInstalled().then(function(){
            var defer = $q.defer();
            if(Config.IS_CHROME){
                chrome.webstore.install(chromeAppURL(CHROME_ID), function(){
                    defer.resolve();
                }, function(){
                    defer.reject();
                });
            }else{
                defer.reject();
            }

            return defer.promise;
        });
    };

    return {

        isAppInstalled : isAppInstalled,
        installApp : installApp


    };


    }]);