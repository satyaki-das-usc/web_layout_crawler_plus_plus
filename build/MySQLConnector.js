"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLConnector = void 0;
var mysql_1 = __importDefault(require("mysql"));
var CONFIG = require('./config.json');
var PROD = process.env.NODE_ENV ? process.env.NODE_ENV == 'production' : false;
var envConfigs = {
    "mysql_host": PROD ? process.env.PROD_MYSQL_HOST : process.env.DEV_MYSQL_HOST,
    "mysql_user": PROD ? process.env.PROD_MYSQL_USER : process.env.DEV_MYSQL_USER,
    "mysql_password": PROD ? process.env.PROD_MYSQL_PASS : process.env.DEV_MYSQL_PASS,
    "mysql_port": PROD ? process.env.PROD_MYSQL_PORT : process.env.DEV_MYSQL_PORT
};
var mysql_host = envConfigs.mysql_host || CONFIG.mysql_host;
var mysql_user = envConfigs.mysql_user || CONFIG.mysql_user;
var mysql_password = envConfigs.mysql_password || CONFIG.mysql_password;
var mysql_database = CONFIG.mysql_database;
var mysql_port = envConfigs.mysql_port || CONFIG.mysql_port;
var MySQLConnector = /** @class */ (function () {
    function MySQLConnector(host, user, password, database) {
        if (host === void 0) { host = mysql_host; }
        if (user === void 0) { user = mysql_user; }
        if (password === void 0) { password = mysql_password; }
        if (database === void 0) { database = mysql_database; }
        this.connection = mysql_1.default.createPool({
            host: host,
            user: user,
            password: password,
            database: database,
            multipleStatements: true,
            port: mysql_port,
            insecureAuth: true
        });
        console.log(mysql_host, mysql_user, mysql_password, mysql_database, mysql_port);
        // this.connection.connect();
    }
    MySQLConnector.prototype.query = function (queryString, escapeValues) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connection.query(queryString, escapeValues, function (error, results, fields) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
    };
    MySQLConnector.prototype.close = function () {
        this.connection.end();
    };
    return MySQLConnector;
}());
exports.MySQLConnector = MySQLConnector;
module.exports.MySQLConnector = MySQLConnector;
//# sourceMappingURL=MySQLConnector.js.map