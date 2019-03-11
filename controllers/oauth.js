const ErrorCode = require('../lib/ErrorCode');
const getSql = require("../models/db");
const Util = require("../lib/utils");
const log4js = require('../lib/log');
const config = require("../config");
const getSession = require("../lib/getSession");
const getRedis = require("../lib/getRedis");
Array.prototype.in_array = function (e) {
    var r = new RegExp(',' + e + ',');
    return (r.test(',' + this.join(this.S) + ','));
};
class oAuth {
    constructor() {
    };
    /**
     *  postAuth权限控制,必带token
     *  第一次进来时，获取token，
     * */
    async Auth(req, res, next) {
        if (req.path == "/auth/login" || req.path == "/auth/register" || req.path == "/auth/admin_login" || req.path == "/auth/wxpaylist") {
            next()
        } else {
            if (req.body.system == 'admin') {
                if (req.headers.token) {
                    let userSession = await getSession.getAdminSession(req.headers.token);
                    if (userSession == null || userSession == "null") {
                        let err = {
                            message: "您的用户名已失效或其他人登录把您踢下,请重新登录",
                            code: ErrorCode.TokenLoss,
                        };
                        res.json(err);
                    } else {
                        if (req.headers.token == userSession.token && req.headers.token != null) {
                            let obj = {
                                name: userSession.name,
                                token: userSession.token,
                                id: userSession.id,
                                type: userSession.type
                            };
                            await getRedis.setAdminSession(userSession.token, obj);
                            await getRedis.setAdminSession(userSession.id, obj);
                            next();
                        } else {
                            let err = {
                                message: "您没有权限调用这个接口",
                                code: ErrorCode.TokenLoss,
                            };
                            res.json(err);
                        }
                    }
                } else {
                    let err = {
                        message: "您没有权限调用这个接口",
                        code: ErrorCode.TokenLoss,
                    };
                    res.json(err);
                }
            }
            else {
                let userToken = await getSession.getUserSession(req.headers.token);
                let userT = userToken == null ? null : userToken.token;
                if (req.headers.token == userT && req.headers.token != null) {
                    next();
                } else {
                    let err = {
                        message: "您的账号已被登录，请重新登录",
                        code: ErrorCode.TokenLoss
                    };
                    res.json(err);
                }
            }

        }
    }


    /**
      * 注册用户信息
      * */
    async register(req, res, next) {
        try {
            let { code, phone, user_name, password } = req.body;
            let cbErr = {
                code: ErrorCode.ParamError
            };
            if (Util.isNull(user_name) || Util.isNull(phone)) {
                cbErr.message = "请完善用户信息再提交";
                return res.json(cbErr);
            }
            if (Util.isNull(password)) {
                cbErr.message = "请填写密码";
                return res.json(cbErr);
            }
            let pager = {};
            let userId = await getSession.getUserSession(req.headers.token);
            let ids = userId == null ? null : userId.id;
            let isExist = await getSql.getphone_number(phone);
            if (isExist.data && isExist.data.length && isExist.data[0].user_id != ids) {
                cbErr.message = "手机号已存在";
                return res.json(cbErr);
            }
            req.body.password = Util.md5(password);
            req.body.creattime = Util.getNowTime();
            req.body.id = ids;
            req.body.user_name = encodeURIComponent(req.body.user_name);
            let cbData = await getSql.register(req.body);
            pager.code = cbData.status;
            pager.message = cbData.message;
            return res.json(pager);
        } catch (e) {
            next(e)
        }
    }

    /**
    * 获取登陆
    * */
    async login(req, res, next) {
        let { phone, password } = req.body;
        let pager = {};
        pager.code = 200;
        let cbErr = {
            code: ErrorCode.ParamError
        };
        if (Util.isNull(phone)) {
            cbErr.message = "请填写手机号";
            return res.json(cbErr);
        }
        if (Util.isNull(password)) {
            cbErr.message = "请输入密码";
            return res.json(cbErr);
        }
        let isExist = await getSql.getphone_number(phone);
        if (isExist.data.length == 0) {
            cbErr.message = "该手机号未注册";
            return res.json(cbErr);
        }
        if (isExist.data[0].password != Util.md5(password)) {
            cbErr.message = "密码错误";
            return res.json(cbErr);
        }
        pager.data = {
            user_name: decodeURIComponent(isExist.data[0].user_name),
            token: Util.randomString(32),
            status: isExist.data[0].status,
            id: isExist.data[0].user_id,
            appId: Util.randomNum(4)
        };
        let upData = {
            time: Util.getNowTime(),
            user_id: isExist.data[0].user_id,
        };
        await getSql.updateUserTime(upData);
        let obj = {
            name: pager.data.user_name,
            token: pager.data.token,
            id: isExist.data[0].user_id
        };
        let userId = await getSession.getUserSession(obj.id);
        //唯一性
        if (userId != null && userId != "null") {
            obj.token = userId.token;
            obj.id = userId.id;
        }
        pager.data.token = obj.token;
        getRedis.setUserSession(obj.id, obj);
        getRedis.setUserSession(obj.token, obj);
        return res.json(pager);
    };


    //用户购买商品下单
    async user_buy_commodity(req, res, next) {
        let { commodity_id, sum } = req.body
        let pager = {
            code: ErrorCode.ParamError,
            data: []
        };
        if (req.body.system == 'admin') {
            pager.message = "请使用客户端请求";
            return res.json(pager);
        }
        let userId = await getSession.getUserSession(req.headers.token);
        let ids = userId == null ? null : userId.id;
        req.body.userid = ids;
        
        if (Util.isNull(commodity_id)) {
            pager.message = "请选择商品";
            return res.json(pager);
        }
        if (Util.isNull(sum) || Number(sum) < 1) {
            pager.message = "请选择商品数量";
            return res.json(pager);
        }
        if (Number(sum) < 1) {
            pager.message = "商品数量需大于或等于1";
            return res.json(pager);
        }
        let commodity_list = await getSql.admin_commodity_list(req.body);
        if (commodity_list.data.length == 0) {
            pager.message = "该商品不存在";
            return res.json(pager);
        }
        if (Number(commodity_list.data[0].stock) < Number(sum)) {
            pager.message = "该商品库存不足";
            return res.json(pager);
        }
        if (commodity_list.data[0].is_on_sale == 0) {
            pager.message = "该商品已下架";
            return res.json(pager);
        }
        if (commodity_list.data[0].is_delete == 1) {
            pager.message = "该商品不存在";
            return res.json(pager);
        }
        req.body.total_fee = Number(commodity_list.data[0].price) * Number(sum);
        req.body.type = 0;
        req.body.name = commodity_list.data[0].name;
        req.body.recharge = 'user_recharge';
        req.body.createtime = Util.getNowTime();
        req.body.out_trade_no = Util.getTimeStamp(req.body.createtime) + "" + req.body.userid;
        let cbData = await getSql.user_buy_commodity(req.body);
        let orede = {
            out_trade_no: req.body.out_trade_no,
            total_fee: req.body.total_fee
        }
        pager = {
            code: cbData.status,
            message: cbData.message,
            data:orede
        }
        return res.json(pager);
    }

    /**
    * 微信回调通知支付结果
    * **/
    async pwechatcallbacknotification(req, res, next) {
        try {
            if (req.body.xml.return_code == "SUCCESS") {
                let nowtime = Util.getNewTime(new Date());
                let total_fee = Number(req.body.xml.total_fee) / 100;
                //签名
                // let stringB = "appid=" + req.body.xml.appid + "&bank_type=" + req.body.xml.bank_type + "&cash_fee=" + req.body.xml.cash_fee + "&fee_type=" + req.body.xml.fee_type + "&is_subscribe=" + req.body.xml.is_subscribe + "&mch_id=" + req.body.xml.mch_id + "&nonce_str=" + req.body.xml.nonce_str + "&openid=" + req.body.xml.openid + "&out_trade_no=" + req.body.xml.out_trade_no + "&result_code=" + req.body.xml.result_code + "&return_code=" + req.body.xml.return_code + "&time_end=" + req.body.xml.time_end + "&total_fee=" + req.body.xml.total_fee + "&trade_type=" + req.body.xml.trade_type + "&transaction_id=" + req.body.xml.transaction_id;
                // // // 第二步：拼接API密钥：
                // let stringSignTempb = stringB + "&key=" + config.key  //注：key为商户平台设置的密钥key 
                // let signb = crypto.createHash('md5').update(stringSignTempb).digest('hex').toUpperCase();
                // //回调成功后修改订单状态
                // if (req.body.xml.sign == signb) {
                    let datas = {
                        total_fee: total_fee,
                        out_trade_no: req.body.xml.out_trade_no,
                        status: 1,
                        pay_status: 2,
                        state: 1
                    }
                    let DbData = await getSql.user_wechat_result(datas);
                    if (DbData.status == 200) {
                        let str = "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>";
                        return res.send(str);
                    }
                    else {
                        let str = "<xml><return_code><![CDATA[FAIL]]></return_code>";
                        return res.send(str);
                    }
                // }
                // else {
                //     let datas = {
                //         total_fee: total_fee,
                //         out_trade_no: req.body.xml.out_trade_no,
                //         status: 1,
                //         pay_status: 1,
                //         state: 0
                //     }
                //     let DbData = await getSql.user_wechat_result(datas);
                //     if (DbData.status == 200) {
                //         let str = "<xml><return_code><![CDATA[FAIL]]></return_code>";
                //         return res.send(str);
                //     }
                // }

            }
            else {
                let str = "<xml><return_code><![CDATA[FAIL]]></return_code>";
                return res.send(str);
            }
        } catch (e) {
            next(e)
        }
    }
}
module.exports = new oAuth();
