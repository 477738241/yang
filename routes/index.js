let express = require('express');
let router = express.Router();
let oAuth = require('../controllers/oauth');
let admin_oauth = require('../controllers/admin_oauth');

// router.get("/",oAuth.index);
/**
 * token权限校验
 * */
router.post("/auth/*",oAuth.Auth);
/**注册用户信息**/
router.post("/auth/register",oAuth.register);
/**
 * app登录
 * **/
router.post("/auth/login",oAuth.login);
/**
 * 用户下单
 * **/
router.post("/auth/user_buy_commodity",oAuth.user_buy_commodity);
/**
 * 支付成功回调结果处理
 * **/
router.post("/auth/wechatcallbacknotification",oAuth.pwechatcallbacknotification);
/**
 * 后台登录
 * **/
router.post("/auth/admin_login",admin_oauth.admin_login);
/**
 * 管理员添加商品
 * **/
router.post("/auth/admin_commodity_add",admin_oauth.admin_commodity_add);

/**
 * 管理员商品上下架
 * **/
router.post("/auth/admin_commodity_on_sale",admin_oauth.admin_commodity_on_sale);
/**
 * 管理员查询
 * **/
router.post("/auth/admin_commodity_select",admin_oauth.admin_commodity_select);
/*
超级管理员新增管理员
*/
router.post("/auth/admin_super_crud_add",admin_oauth.admin_super_crud_add);
/*
超级管理员删除管理员
*/
router.post("/auth/admin_super_crud_del",admin_oauth.admin_super_crud_del);
/*
超级管理员对管理员修改
*/
router.post("/auth/admin_super_crud_upt",admin_oauth.admin_super_crud_upt);
/*
超级管理员查询管理员列表
*/
router.post("/auth/admin_super_crud_sel",admin_oauth.admin_super_crud_sel);

module.exports = router;


