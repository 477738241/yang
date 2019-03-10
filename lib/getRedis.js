const redis = require("../lib/redis");
const config = require("../config");
const redisClient_user = redis.createClient({ db: 5 });
const redisClient_admin = redis.createClient({ db: 7 });
//请求数据方法
class getRedis {
    constructor() {

    }
    /**
     * 存用户名等信息
     * **/
    setUserSession(token, obj) {
        redisClient_user.set(config.session_UserCode + token, JSON.stringify(obj), 'EX', config.session_ttl_userSession);
    }
    setUserSessionTtl(token, obj) {
        redisClient_user.set(config.session_UserCode + token, JSON.stringify(obj), 'EX', config.session_ttl_sendSessionTTL);
    }
    /**
     * 获取用户信息
     * **/
    getUserSession(obj) {
        let p = new Promise(function (resolve, reject) {
            redisClient_user.get(config.session_UserCode + obj, function (err1, obj) {
                if (err1) {
                    resolve(null);
                } else {
                    resolve(obj);
                }
            });
        });
        return p;
    }

    /**
 * 存后台登录信息,获取后台管理员信息
 * **/
    getAdminSession(token) {
        let p = new Promise(function (resolve, reject) {
            redisClient_admin.get(config.session_AdminCode + token, function (err1, obj) {
                if (err1) {
                    resolve(null);
                } else {
                    resolve(obj);
                }
            });
        });
        return p;
    }
    setAdminSession(token, obj) {
        redisClient_admin.set(config.session_AdminCode + token, JSON.stringify(obj), 'EX', config.session_ttl_userSession);
    }
    setAdminSessionTTL(token, obj) {
        redisClient_admin.set(config.session_AdminCode + token, JSON.stringify(obj), 'EX', config.session_ttl_userSessionTTL);
    }
}
module.exports = new getRedis();
