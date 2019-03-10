const ErrorCode = require('../lib/ErrorCode');
const admin_db = require("../models/admin_db");
const Util = require("../lib/utils");
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
 * 管理后台登录
 * */
    async admin_login(req, res, next) {
        let pager = {};
        if (req.body.system != 'admin') {
            pager = {
                code: ErrorCode.ParamError,
                message: "参数缺失",
                data: []
            }
            return res.json(pager);
        }
        let username = req.body.username;
        let getAdminName = await admin_db.getAdminName(username);
        if (getAdminName.status == 200 && getAdminName.data.length) {
            let password = req.body.password;
            if (Util.isNull(password)) {
                pager = {
                    code: ErrorCode.ParamError,
                    message: "请输入密码",
                    data: []
                }
                return res.json(pager);
            }

            //校验密码
            if (Util.md5(password) == getAdminName.data[0].password) {
                //增加最后登录时间
                let upData = {
                    time: Util.getNowTime(),
                    id: getAdminName.data[0].id
                };
                await admin_db.updateAdminTime(upData);
                let token = Util.randomString(32);
                //token存入redis
                let obj = {
                    name: getAdminName.data[0].real_name,
                    token: token,
                    id: getAdminName.data[0].id,
                    type: getAdminName.data[0].type
                };
                let userSession = await getSession.getAdminSession(obj.id);
                //唯一性
                if (userSession != null && userSession != "null") {
                    await getRedis.setAdminSessionTTL(userSession.token, null);
                }
                await getRedis.setAdminSession(obj.id, obj);
                await getRedis.setAdminSession(token, obj);
                return res.json({
                    code: 200,
                    type: obj.type,
                    token: token,
                    name: username
                });
            } else {
                let err = {
                    message: "密码错误,请重新输入",
                    code: ErrorCode.NotFound
                };
                return res.json(err);
            }
        } else {
            let err = {
                message: "用户名不存在",
                code: ErrorCode.NotFound
            };
            return res.json(err);
        }
    }
    //管理员添加商品
    async admin_commodity_add(req, res, next) {
        let { cid, name, icon, price, orderNum, goods_desc, is_on_sale, amount } = req.body;
        let pager = {
            code: ErrorCode.ParamError,
            data: []
        };
        if (Util.isNull(cid)) {
            pager.message = "请选择商品分类";
            return res.json(pager);
        }
        if (Util.isNull(name)) {
            pager.message = "请填写商品名称";
            return res.json(pager);
        }
        if (Util.isNull(icon)) {
            pager.message = "请上传商品图片";
            return res.json(pager);
        }
        if (Util.isNull(price)) {
            pager.message = "请填写商品价格";
            return res.json(pager);
        }
        if (Util.isNull(orderNum)) {
            pager.message = "请填写商品排序";
            return res.json(pager);
        }
        if (Util.isNull(goods_desc)) {
            pager.message = "请填写商品描述";
            return res.json(pager);
        }
        if (Util.isNull(is_on_sale)) {
            pager.message = "请选择是否上架";
            return res.json(pager);
        }
        if (Util.isNull(amount)) {
            pager.message = "请填写商品数量";
            return res.json(pager);
        }
        req.body.updatetime = Util.getNowTime()
        let cbData = await admin_db.admin_commodity(req.body);
        pager = {
            code: cbData.status,
            message: cbData.message,
            data: []
        }
        return res.json(pager);
    }

    //管理员商品上下架
    async admin_commodity_on_sale(req, res, next) {
        let { commodity_id, is_on_sale } = req.body;
        let pager = {
            code: ErrorCode.ParamError,
            data: []
        };
        if (Util.isNull(commodity_id)) {
            pager.message = "请选择商品"
            return res.json(pager);
        }
        if (Util.isNull(is_on_sale)) {
            pager.message = "请选择是否上架"
            return res.json(pager);
        }
        let commodity_list = await admin_db.admin_commodity_list(req.body);
        if (commodity_list.data.length == 0) {
            pager.message = "该商品不存在";
            return res.json(pager);
        }
        if (is_on_sale == 1) {
            if (Number(commodity_list.data[0].stock) == 0) {
                pager.message = "该商品库存不足";
                return res.json(pager);
            }
            if (commodity_list.data[0].is_delete == 1) {
                pager.message = "该商品已删除";
                return res.json(pager);
            }
        }
        req.body.updatetime = Util.getNowTime()
        let cbData = await admin_db.admin_commodity_is_on_sale(req.body);
        pager = {
            code: cbData.status,
            message: cbData.message,
            data: []
        }
        return res.json(pager);
    }
    /**
     * 管理员查询每日最新商品数据
     * **/
    async admin_commodity_select(req, res, next) {
        try {
            let pager = {};
            let pageIndex = req.body.pageIndex, pageSize = req.body.pageSize;
            req.body.pageIndex = pageIndex == null || isNaN(pageIndex) ? 1 : req.body.pageIndex;
            req.body.pageSize = pageSize == null || isNaN(pageSize) ? 10 : pageSize;
            let date = req.body.date
            if (isNaN(date)) {
                req.body.starttime = date + " 00:00:00";
                req.body.endtime = date + " 23:59:59";
                req.body.stoptime = 1;
            }
            else {
                req.body.starttime = null;
                req.body.endtime = null;
                req.body.stoptime = null;
            }
            let cbData = await admin_db.admin_commodity_select(req.body);
            let cbCount = await admin_db.admin_commodity_selectcount(req.body);
            pager.total = cbCount.data.length ? cbCount.data[0].count : 0;
            pager.code = cbData.status;
            pager.data = cbData.data;
            return res.json(pager);
        } catch (e) {
            next(e)
        }
    }

    //超级管理员新增管理员
    async admin_super_crud_add(req, res, next) {
        let { password, username, phone_number, types } = req.body;
        let pager = {
            code: ErrorCode.ParamError,
            data: []
        };
        let userSession = await getSession.getAdminSession(req.headers.token);
        if (userSession.type != 0) {
            pager.message = "非超级管理员，无法进行此操作"
            return res.json(pager);
        }
        if (Util.isNull(username)) {
            pager.message = "请填写管理员名称"
            return res.json(pager);
        }
        if (Util.isNull(password)) {
            pager.message = "请填写管理员密码"
            return res.json(pager);
        }
        if (Util.isNull(phone_number)) {
            pager.message = "请填写管理员手机号"
            return res.json(pager);
        }
        if (Util.isNull(types)) {
            pager.message = "请选择管理类别"
            return res.json(pager);
        }
        let getAdminName = await admin_db.getAdminName(username);
        if (getAdminName.data.length != 0) {
            pager.message = "该用户名已存在"
            return res.json(pager);
        }
        req.body.password = Util.md5(password);
        req.body.type = 1;
        let cbData = await admin_db.admin_super_crud(req.body);
        pager = {
            code: cbData.status,
            message: cbData.message,
            data: []
        }
        return res.json(pager);
    }

    //超级管理员删除管理员
    async admin_super_crud_del(req, res, next) {
        let { id } = req.body;
        let pager = {
            code: ErrorCode.ParamError,
            data: []
        };
        let userSession = await getSession.getAdminSession(req.headers.token);
        if (userSession.type != 0) {
            pager.message = "非超级管理员，无法进行此操作"
            return res.json(pager);
        }
        if (Util.isNull(id)) {
            pager.message = "请选择管理员进行删除"
            return res.json(pager);
        }
        if (id == 1) {
            pager.message = "超级管理员不能删除自己"
            return res.json(pager);
        }
        req.body.type = 2;
        let cbData = await admin_db.admin_super_crud(req.body);
        pager = {
            code: cbData.status,
            message: cbData.message,
            data: []
        }
        return res.json(pager);
    }

    //超级管理员对管理员修改
    async admin_super_crud_upt(req, res, next) {
        let { id, password, username, phone_number, status, types } = req.body;
        let pager = {
            code: ErrorCode.ParamError,
            data: []
        };
        let userSession = await getSession.getAdminSession(req.headers.token);
        if (userSession.type != 0) {
            pager.message = "非超级管理员，无法进行此操作"
            return res.json(pager);
        }
        if (Util.isNull(id)) {
            pager.message = "请选择管理员进行操作"
            return res.json(pager);
        }
        if (Util.isNull(username)) {
            pager.message = "请填写管理员名称"
            return res.json(pager);
        }
        if (Util.isNull(password)) {
            pager.message = "请填写管理员密码"
            return res.json(pager);
        }
        if (Util.isNull(phone_number)) {
            pager.message = "请填写管理员手机号"
            return res.json(pager);
        }
        if (Util.isNull(types)) {
            pager.message = "请选择管理员类别"
            return res.json(pager);
        }
        if (Util.isNull(status)) {
            pager.message = "请选择管理员状态"
            return res.json(pager);
        }
        let data = {
            type: 5,
            id: id
        }
        let is_id = await admin_db.admin_super_crud(data);
        if (is_id.data.length == 0) {
            pager.message = "该管理员不存在"
            return res.json(pager);
        }
        let getAdminName = await admin_db.getAdminName(username);
        if (getAdminName.data.length != 0) {
            if (getAdminName.data[0].id != id) {
                pager.message = "该管理员名称已存在"
                return res.json(pager);
            }
        }
        req.body.type = 3;
        req.body.password = Util.md5(password);
        let cbData = await admin_db.admin_super_crud(req.body);
        pager = {
            code: cbData.status,
            message: cbData.message,
            data: []
        }
        return res.json(pager);

    }
    /**
        * 超级管理员查询管理员列表
        * **/
    async admin_super_crud_sel(req, res, next) {
        try {
            let pager = {};
            let pageIndex = req.body.pageIndex, pageSize = req.body.pageSize;
            req.body.pageIndex = pageIndex == null || isNaN(pageIndex) ? 1 : req.body.pageIndex;
            req.body.pageSize = pageSize == null || isNaN(pageSize) ? 10 : pageSize;
            pager = {
                code: ErrorCode.ParamError,
                data: []
            };
            let userSession = await getSession.getAdminSession(req.headers.token);
            if (userSession.type != 0) {
                pager.message = "非超级管理员，无法进行此操作"
                return res.json(pager);
            }
            req.body.type = 4;
            let cbData = await admin_db.admin_super_crud(req.body);
            let cbCount = await admin_db.admin_super_selcount(req.body);
            pager.total = cbCount.data.length ? cbCount.data[0].count : 0;
            pager.code = cbData.status;
            pager.data = cbData.data;
            return res.json(pager);
        } catch (e) {
            next(e)
        }
    }

}
module.exports = new oAuth();
