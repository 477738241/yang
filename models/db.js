const getIndex = require("../lib/mysql").getIndex;
const getAffair = require("../lib/mysql").getAffair;
//数据请求
class getIndexSql {
    constructor() {
    }
    /**
    * 用户注册
     * **/
    async register(obj) {
        let { user_name, phone, password, creattime } = obj;
        try {
            let sql = "INSERT INTO user ( user_name, phone_number, password,creattime, ip, last_login_time, status, point) VALUES ( '" + user_name + "', '" + phone + "','" + password + "', '" + creattime + "',NULL, NULL, 0, 0);";
            let list = await getIndex(sql);
            return list;
        } catch (e) {
            console.log(e);
        }
    }

    //手机号查询用户id,密码
    async getphone_number(phone_number) {
        let sql = "SELECT user_id,password,user_name,status FROM user WHERE phone_number = " + phone_number + "";
        return await getIndex(sql);
    }

    /**
     * 用户写入最后一次登录时间
     * **/
    async updateUserTime(obj) {
        try {
            let sql = "UPDATE user SET last_login_time = '" + obj.time + "' WHERE user_id = " + obj.user_id;
            return await getIndex(sql);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * 用户购买商品下单
     * **/
    async user_buy_commodity(obj) {
        let { userid, commodity_id, sum, out_trade_no, total_fee, type, createtime, name, recharge } = obj;
        let sql1 = "SELECT max(id)+1 as recharge_id from user_recharge";
        let recharge_id;
        let oks = await getIndex(sql1).then(async res => {
            recharge_id = res.data[0].recharge_id;
            let sql2 = "INSERT INTO user_recharge ( user_id, commodity_id, sum, out_trade_no, total_fee, status, type, createtime) VALUES (" + userid + ", " + commodity_id + ", " + sum + ", '" + out_trade_no + "', " + total_fee + ", 0, " + type + ", '" + createtime + "')";
            let sql3 = "INSERT INTO wx_payorder( user_id, user_name, phone_number, openid, status, body, out_trade_no, total_fee, recharge_id,recharge, time_start, time_expire, return_code, return_msg, trade_type, result_code, err_code, err_code_des, type, querys, createtime) VALUES ( " + userid + ", '', '', '', 0, '" + name + "', '" + out_trade_no + "', " + total_fee + ", " + recharge_id + ", '" + recharge + "',NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, " + type + ", 0, '" + createtime + "')";
            let sql4 = "UPDATE commodity SET stock = stock - " + sum + " where  id =" + commodity_id + "";
            return await getAffair([sql2, sql3, sql4]);
        }).catch(res => {
            let err = {
                status: 400,
                message: "参数错误",
                data: []
            };
            return err;
        });
        return oks;
    }
    /**
     * 微信回调通知支付结果
     * **/
    async user_wechat_result(obj) {
        let { total_fee, out_trade_no, pay_status, status, state } = obj;
        try {
            let sql1 = "update wx_payorder set status = " + pay_status + ",total_pay=" + total_fee + " where out_trade_no='" + out_trade_no + "' ";
            let sql2 = "update user_recharge set status =" + status + ",state=" + state + " where out_trade_no='" + out_trade_no + "' ";
            return await getAffair(sql1, sql2);
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 商品列表
     * **/
    async admin_commodity_list(obj) {
        let { commodity_id } = obj;
        try {
            let sql = "select id ,name, icon, price, orderNum, goods_desc, is_on_sale, is_delete, stock, inventory from commodity where id=" + commodity_id + " ";

            return await getIndex(sql);
        } catch (e) {
            console.log(e);
        }
    }
}
module.exports = new getIndexSql();
