var configModule = configModule || angular.module('aio.config', []);

configModule.factory('Config', function () {

    var getDocInfo = function () {
        //TODO - extract to external helper
        var _appname;
        var _realm;
        var _chromeId;
        var _fbId;

        try {
            if (document.location.hostname === 'play.gamestab.me') {
                _appname = 'Gamestab';
                _chromeId = 'amlhfkalaoikfbpoolhpdhignhjhlhko'; // gamestab,
                _fbId = '1481519478732760'; //Play Gamestab
            }
            _realm = document.location.origin;
        } catch (e) {
            console.info('Error with doc.location', e);
        }
        _appname = _appname || 'Mojo Games';
        _realm = _realm || 'http://www.mojo-games.com';
        _chromeId = _chromeId || 'fmpeljkajhongibcmcnigfcjcgaopfid'; //mojo-games
        _fbId = _fbId || '224435141079794'; //mojo-games

        return {
            appName: _appname,
            realm: _realm,
            chromeId: _chromeId,
            fbId: _fbId
        };
    };

    var _docInfo = getDocInfo();
    var APP_NAME = _docInfo.appName;
    var REALM = _docInfo.realm;
    var FACEBOOK_ID = _docInfo.fbId;
    var CHROME_ID = _docInfo.chromeId;

    var isLocalStorage = (function () {
        try {
            return localStorage && localStorage.getItem;
        } catch (e) {
            return false;
        }
    })();

    var POINTS = {
        CHROME_APP_INSTALL: 499999,
        FACEBOOK_CONNET: 30000,
        FACEBOOK_INVITE: 99999,
        GIVE_AWAY: 20000,
        PLAY_HOT_GAME: 1500,
        PLAY_NEW_GAME: 999,
        PLAY_PREMIUM_GAME: 2000,
        PLAY_REGULAR_GAME: 499
    };

    var INVITE_FRIENDS_POST = function () {
        return {
            NAME: 'Let\'s play fun games on ' + APP_NAME,
            CAPTION: 'Win coins, win cool prizes!',
            DESCRIPTION: (
                'Playing free games and collecting coins. Come and compete in our leaderboard!'
            ),
            LINK: REALM
            // PICTURE: ''
        };
    };

    //first time user by default
    var returnUser = false;
    if (isLocalStorage) {
        returnUser = typeof localStorage.returnUser !== 'undefined';
    } else {
        returnUser = true; //no localStorage
    }

    var baseConfig = {
        REALM: REALM,
        APP_NAME: APP_NAME,
        FIREBASE_URL: 'https://bizibizi.firebaseio.com',
        GAMES_PER_FIRSTPAGE: 50, // amount of games for the first page
        GAMES_PER_PAGE: 50, // amount of games for load more games
        POINTS: POINTS,
        CHROME_APP_ID: CHROME_ID,
        IS_CHROME: (typeof chrome !== 'undefined' && chrome.webstore),
        RETURN_USER: returnUser
    };

    var developmentConfig = function () {
        REALM = 'http://localhost:8080';

        return angular.extend(baseConfig, {
            FACEBOOK_APP_ID: '638964789507220',
            REALM: REALM,
            INVITE_FRIENDS_POST: INVITE_FRIENDS_POST()
        });
    };

    var productionConfig = function () {
        return angular.extend(baseConfig, {
            FACEBOOK_APP_ID: FACEBOOK_ID,
            INVITE_FRIENDS_POST: INVITE_FRIENDS_POST()
        });
    };

    var isDevelopment = location.hostname === 'localhost';
    var _config = isDevelopment ? developmentConfig() : productionConfig();
    return _config;
});
