const getIndex = require("../lib/mysql").getIndex;
const getAffair = require("../lib/mysql").getAffair;
//数据请求
class getIndexSql {
    constructor() {
    }

    /***
    * 获取管理员是否存在
     * **/
    async getAdminName(name) {
        try {
            let sql = "SELECT * FROM admin WHERE user_name = '" + name + "' AND status =  0";
            return await getIndex(sql);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * 后台写入最后一次登录时间
     * **/
    async updateAdminTime(obj) {
        try {
            let sql = "UPDATE admin SET last_login_time = '" + obj.time + "' WHERE id = " + obj.id;
            return await getIndex(sql);
        } catch (e) {
            console.log(e);
        }
    }
    /**
    //超级管理员对管理员增删改查
     * **/
    async admin_super_crud(obj) {
        try {
            let { id, password, username, phone_number, status, types } = obj;
            let sql = "";
            switch (parseInt(obj.type)) {
                case 1:
                    sql = "INSERT INTO admin(password, user_name, phone_number, ip, last_login_time, status, type) VALUES ( '" + password + "', '" + username + "', '" + phone_number + "', NULL, NULL, 0, " + types + ") ";
                    break;
                case 2:
                    sql = "DELETE FROM  admin WHERE id = " + id + "  ";
                    break;
                case 3:
                    sql = "UPDATE admin SET password = '" + password + "' , user_name= '" + username + "', phone_number=" + phone_number + ",status=" + status + ",type=" + types + " WHERE id = " + id + "  ";
                    break;
                case 4:
                    sql = "SELECT id, password, user_name, phone_number, ip, last_login_time, status, type  from admin  ";
                    break;
                case 5:
                    sql = "SELECT id, password, user_name, phone_number  from admin where id = " + id + " ";
                    break;
                default:
                    break;
            }
            if (sql != "") {
                return await getIndex(sql);
            } else {
                return {
                    status: 404,
                    data: [],
                    message: "数据库报错"
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    /**
     * 管理员列表数量
     * **/
    async admin_super_selcount(obj) {
        try {
            let sql = "select  count(1) AS count from admin ";
            return await getIndex(sql);
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 发布商品
     * **/
    async admin_commodity(obj) {
        let { cid, name, icon, price, orderNum, goods_desc, is_on_sale, amount, updatetime } = obj;
        try {
            let sql = "INSERT INTO commodity (cid, name, icon, price, orderNum, goods_desc, is_on_sale, is_delete, stock, inventory, uptime, updatetime) VALUES ( " + cid + ", '" + name + "', '" + icon + "', " + price + ", " + orderNum + ", '" + goods_desc + "', " + is_on_sale + ", 0, " + amount + ", " + amount + ", '" + updatetime + "', '" + updatetime + "')";
            return await getIndex(sql);
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 商品上下架2019-03-08 14:43:39
     * **/
    async admin_commodity_is_on_sale(obj) {
        let { commodity_id, is_on_sale, updatetime } = obj;
        try {
            let sql = "UPDATE commodity SET is_on_sale=" + is_on_sale + " , updatetime='" + updatetime + "' WHERE id=" + commodity_id + " ";
            return await getIndex(sql);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * 查询每天商品交易
     * **/
    async admin_commodity_select(obj) {
        let { pageSize, pageIndex, starttime, endtime, stoptime } = obj;
        try {
            let sql = "select a.id,a.cid ,a.name,a.price, b.sum,b.total_fee,b.status,b.createtime from commodity a left join user_recharge b on a.id = b.commodity_id where b.status= 1 and (b.createtime >= '" + starttime + "' or  " + stoptime + " is null) and (b.createtime <= '" + endtime + "' or  " + stoptime + " is null)  ORDER BY b.id DESC LIMIT " + (pageIndex - 1) * pageSize + "," + pageSize + " ";
            return await getIndex(sql);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * 查询每天商品交易数量
     * **/
    async admin_commodity_selectcount(obj) {
        let { pageSize, pageIndex, starttime, endtime, stoptime } = obj;
        try {
            let sql = "select  count(1) AS count from commodity a left join user_recharge b on a.id = b.commodity_id where b.status= 1 and (b.createtime >= '" + starttime + "' or  " + stoptime + " is null) and (b.createtime <= '" + endtime + "' or  " + stoptime + " is null) ";
            return await getIndex(sql);
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
