const getRedis = require('./getRedis');
class getSession{
    //用户信息
    async getUserSession(t){
        let userToken = await getRedis.getUserSession(t);
        let users;
        if(userToken == null || userToken == "null"){
            users = null;
        }else{
            users = JSON.parse(userToken);
        }
        return users;
    }
    //后台用户管理员
    async getAdminSession(t){
        let userToken = await getRedis.getAdminSession(t);
        let users;
        if(userToken == null || userToken == "null"){
            users = null;
        }else{
            users = JSON.parse(userToken);
        }
        return users;
    }
}
module.exports = new getSession();