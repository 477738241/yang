/**
 * 错误编码
 * @readonly
 * @enum {number}
 */
const ErrorCode = {
    /**
     * 0-操作成功
     *
     * */
    Success: 0,

    /**
     * 1000-服务端错误
     *
     */
    SystemError: 500,

    /**
     * 212-没有权限访问这个接口
     *
     * */
    TokenLoss: 212,

    /**
     * 1002-token过期
     *
     *  */
    TokenError: 1002,

    /**
     *1003-请求接口地址有误
     *
     */
    NotFound: 404,

    /**
     * 400-参数有误
     *
     */
    ParamError: 400,
    /**
     * 401-短信验证码错误
     *
     * **/
    codeError : 401,
    /**
     * 2001-验证失败
     *
     */
    VerifyFail: 2001,

    /**
     * 2002-数据库操作错误
     */
    DbError:2002
}

module.exports = ErrorCode;