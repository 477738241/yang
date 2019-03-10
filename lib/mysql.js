const mysql = require("mysql");
const config = require("../config");
const log4js = require("./log");
const logger = log4js.logger("mysql");
const async = require("async");
const conn = mysql.createPool({
    host : config.mysql_host,
    user : config.mysql_userid,
    password : config.mysql_password,
    database : config.mysql_db,
    port : config.mysql_port
});
const getAll = {};


//单个请求数据方法
getAll.getIndex = function(sql,value) {
    let p = new Promise(function (resolve, reject) {
        conn.getConnection(function (err, connection) {
            if (err) {
                console.log("获取数据库：" + err);
                let errs = {
                    message : "数据库链接超时",
                    status : 400,
                    data : []
                };
                logger.error('【error】', 'status:', errs.status, 'message:', errs.message || '');
                reject(errs);
                // reject(err);
            }else {
                if(typeof value == "undefined" || typeof value == undefined){
                    value = null;
                }
                let option = {
                    sql : sql,
                    values : value
                }
                connection.query(option, function (err1, rows, fields) {
                    if (err1) {
                        let errs = {
                            message : "参数有误",
                            status : 400,
                            data : []
                        };
                        // resolve(errs);
                        reject(errs);
                    }else {
                        let cbDatas = {
                            message : "操作成功",
                            status : 200,
                            data : rows
                        };
                        resolve(cbDatas);
                    }
                    connection.release();
                });
            }
        })
    });
    return p;
};
//事务请求数据方法
getAll.getAffair = function(sqlparamsEntities){
    let p = new Promise(function(resolve,reject){
        conn.getConnection(function (err, connection) {
            if (err) {
                console.log("获取数据库：" + err);
                let errs = {
                    message : "数据库链接超时",
                    status : 400,
                    data : []
                };
                logger.error('【error】', 'status:', errs.status, 'message:', errs.message || '');
                reject(errs);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    connection.release();
                    let errs = {
                        message : "参数有误",
                        status : 400,
                        data : []
                    };
                    reject(errs);
                }
                console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
                let funcAry = [];
                sqlparamsEntities.forEach(function (sql_param) {
                    let temp = function (cb) {
                        if(typeof sql_param.value == "undefined" || typeof sql_param.value == undefined){
                            sql_param.value = null;
                        }
                        let sql = sql_param.sql ? sql_param.sql : sql_param;
                        let option = {
                            sql : sql,
                            values : sql_param.value
                        }
                        connection.query(option, function (tErr, rows, fields) {
                            return cb(tErr,rows);
                        })
                    };
                    funcAry.push(temp);
                });
                async.series(funcAry, function (err, result) {
                    if (err) {
                        connection.rollback(function (err) {
                            connection.release();
                            console.log("回滚了");
                            let errs = {
                                message : "参数有误",
                                status : 400,
                                data : []
                            };
                            reject(errs);
                            // throw err;
                        });
                    } else {
                        connection.commit(function (err, info) {
                            console.log("transaction info: " + JSON.stringify(info));
                            if (err) {
                                console.log("执行事务失败，" + err);
                                connection.rollback(function (err) {
                                    console.log("transaction error: " + err);
                                    connection.release();
                                    let errs = {
                                        message : "参数有误",
                                        status : 400,
                                        data : []
                                    };
                                    reject(errs);
                                });
                            } else {
                                connection.release();
                                let cbDatas = {
                                    message : "操作成功",
                                    status : 200,
                                    data : info
                                };
                                resolve(cbDatas);
                            }
                        })
                    }
                })
            });
        });
    });
    return p;
}

module.exports = getAll;
