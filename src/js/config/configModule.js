var configModule = configModule || angular.module('aio.config', []);

configModule.factory('Config', function () {

    var getDocInfo = function () {
        //TODO - extract to external helper
        var _appname;
        var _realm;
        var _chromeId;
        var _fbId;
        var _analyticsId;
        var _firebaseUrl;

        try {
            if (true || document.location.hostname === 'play.gamestab.me') {
                _appname = 'Gamestab';
                _chromeId = 'amlhfkalaoikfbpoolhpdhignhjhlhko'; // gamestab,
                _fbId = '1481519478732760'; //Play Gamestab
                _analyticsId = 'UA-47928276-8';
                _firebaseUrl = 'https://gamestab.firebaseio.com';
            }
            _realm = document.location.origin;
        } catch (e) {
            console.info('Error with doc.location', e);
        }
        //All params are mojogames defaults
        _appname = _appname || 'Mojo Games';
        _realm = _realm || 'http://www.mojo-games.com';
        _chromeId = _chromeId || 'fmpeljkajhongibcmcnigfcjcgaopfid';
        _fbId = _fbId || '224435141079794'; //mojo-games
        _analyticsId = _analyticsId || 'UA-49896275-3';
        _firebaseUrl = _firebaseUrl || 'https://bizibizi.firebaseio.com';

        return {
            appName: _appname,
            realm: _realm,
            chromeId: _chromeId,
            fbId: _fbId,
            analyticsId: _analyticsId,
            firebaseUrl: _firebaseUrl
        };
    };

    var _docInfo = getDocInfo();
    var APP_NAME = _docInfo.appName;
    var REALM = _docInfo.realm;

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
        ANALYTICS_ID: _docInfo.analyticsId,
        FIREBASE_URL: _docInfo.firebaseUrl,
        GAMES_PER_FIRSTPAGE: 70, // amount of games for the first page
        GAMES_PER_PAGE: 50, // amount of games for load more games
        POINTS: POINTS,
        CHROME_APP_ID: _docInfo.chromeId,
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
            FACEBOOK_APP_ID: _docInfo.fbId,
            INVITE_FRIENDS_POST: INVITE_FRIENDS_POST()
        });
    };

    var isDevelopment = location.hostname === 'localhost';
    var _config = isDevelopment ? developmentConfig() : productionConfig();
    return _config;
});
