var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Constants', ['Chrome',
    function (Chrome) {
        return {
            REALM               : '',
            ANALYTICS_UA_ACCOUNT: 'UA-48357178-1'
        };
    }
]);