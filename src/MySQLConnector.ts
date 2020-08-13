import mysql from 'mysql';
const CONFIG = require('./config.json');

const PROD: boolean = process.env.NODE_ENV ? process.env.NODE_ENV == 'production' : false;

const envConfigs = {
    "mysql_host": PROD ? process.env.PROD_MYSQL_HOST : process.env.DEV_MYSQL_HOST,
    "mysql_user": PROD ? process.env.PROD_MYSQL_USER : process.env.DEV_MYSQL_USER,
    "mysql_password": PROD ? process.env.PROD_MYSQL_PASS : process.env.DEV_MYSQL_PASS,
    "mysql_port": PROD ? process.env.PROD_MYSQL_PORT : process.env.DEV_MYSQL_PORT
}

const mysql_host = envConfigs.mysql_host || CONFIG.mysql_host;
const mysql_user = envConfigs.mysql_user || CONFIG.mysql_user;
const mysql_password = envConfigs.mysql_password || CONFIG.mysql_password;
const mysql_database = CONFIG.mysql_database;
const mysql_port = envConfigs.mysql_port || CONFIG.mysql_port;

export class MySQLConnector {
    connection: mysql.Pool;
    constructor(host = mysql_host,
        user = mysql_user,
        password = mysql_password,
        database = mysql_database) {
        this.connection = mysql.createPool({
            host,
            user,
            password,
            database,
            multipleStatements: true,
            port: mysql_port,
            insecureAuth: true
        });
        console.log(mysql_host, mysql_user, mysql_password, mysql_database, mysql_port)
        // this.connection.connect();
    }
    query(queryString: string, escapeValues: any[]): any {
        return new Promise((resolve, reject) => {
            this.connection.query(queryString, escapeValues, function (error, results, fields) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results)
            })
        })
    }
    close() {
        this.connection.end();
    }
}
module.exports.MySQLConnector = MySQLConnector;