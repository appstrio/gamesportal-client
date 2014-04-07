var configModule = configModule || angular.module('aio.config', []);

configModule.factory('Config', function () {
    var REALM = 'http://www.bizigames.com';
    var APP_NAME = 'BiziGames';

    var isLocalStorage = function () {
        try {
            return localStorage && localStorage.getItem;
        } catch (e) {
            return false;
        }
    };

    var POINTS = {
        GIVE_AWAY: 20000,
        FACEBOOK_INVITE: 99999,
        CHROME_APP_INSTALL: 499999,
        PLAY_REGULAR_GAME: 499,
        PLAY_PREMIUM_GAME: 2000,
        PLAY_HOT_GAME: 1500,
        PLAY_NEW_GAME: 999
    };

    var INVITE_FRIENDS_POST = function () {
        return {
            NAME: 'Let\'s play together fun games on ' + APP_NAME,
            CAPTION: 'Win coins, win cool prizes!',
            DESCRIPTION: (
                'A small JavaScript library that allows you to harness ' +
                'the power of Facebook, bringing the user\'s identity, ' +
                'social graph and distribution power to your site.'
            ),
            LINK: REALM,
            PICTURE: ''
        };
    };

    //first time user by default
    var returnUser = false;
    if (isLocalStorage()) {
        returnUser = typeof localStorage.returnUser !== 'undefined';
    } else {
        returnUser = true; //no localStorage
    }

    var baseConfig = {
        REALM: REALM,
        APP_NAME: APP_NAME,
        FIREBASE_URL: 'https://bizibizi.firebaseio.com',
        POINTS: POINTS,
        // CHROME_APP_ID: 'heplncibihkggagnaaoigdhkgjmmllme',
        CHROME_APP_ID: 'amlhfkalaoikfbpoolhpdhignhjhlhko',
        IS_CHROME: (typeof chrome !== 'undefined' && chrome.webstore),
        RETURN_USER: returnUser
    };

    var developmentConfig = function () {
        REALM = 'http://localhost:63342/gamesportal/client/build/index.html#/';

        return angular.extend(baseConfig, {
            FACEBOOK_APP_ID: '638964789507220',
            INVITE_FRIENDS_POST: INVITE_FRIENDS_POST()
        });
    };

    var productionConfig = function () {
        return angular.extend(baseConfig, {
            FACEBOOK_APP_ID: '224435141079794',
            INVITE_FRIENDS_POST: INVITE_FRIENDS_POST()
        });
    };

    var isDevelopment = (document.URL.indexOf('localhost') > -1);
    if (isDevelopment) {
        return developmentConfig();
    } else {
        return productionConfig();
    }
});
