const config = {
    /**
     *    程序运行的端口
     */
    port: "8088",//访问端口
    /**
     * 限制用户唯一登录
     */
    only_sign: true,
    enjoyPath: 'http://127.0.0.1:8088',//访问地址
    /**
     * 图片存储路径
     * **/
    imgPath: './img/',
    /**
        *mysql 数据库配置/
     */
    mysql_db: 'enjoy',
    mysql_userid: 'root',
    mysql_password: 'asd123',
    mysql_host: '127.0.0.1',
    mysql_port: '3306',
    //日志
    logfile: './enjoy/logs/',
    /**
     * redis配置
     * */
    redis_host: "127.0.0.1",
    redis_port: 6379,
    redis_session_db: 1,
    redis_session_password: '',
    /**
     * session前缀
     * **/
    session_UserCode: 'yang', //用户信息前缀
    session_wxtokenTTL: 60 * 60 * 2,
    session_ttl_userSession: 60 * 60 * 24, //用户信息失效时间，24小时
    session_ttl_userTaskSession: 60 * 60,
    session_ttl_userSessionTTL : 5, //后台信息失效时间被顶缓存5秒
    session_ttl_sendSessionTTL: 5,
};
module.exports = config;