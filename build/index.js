"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var MySQLConnector_1 = require("./MySQLConnector");
var WebCrawler_1 = require("./WebCrawler");
var uuidv1_1 = __importDefault(require("uuidv1"));
var userDataDir = uuidv1_1.default();
var argv = require('yargs')
    .option('url', {
    alias: 'u',
    type: 'string',
    description: 'URL to scan',
})
    .argv;
var PROD = process.env.NODE_ENV === 'production' ? true : false;
var URL_TO_SCAN = process.env.URL_TO_SCAN;
function getNextSite(db) {
    return __awaiter(this, void 0, void 0, function () {
        var sqlString, siteResult, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sqlString = "CALL getNextSite();";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.query(sqlString, [])];
                case 2:
                    siteResult = _a.sent();
                    return [2 /*return*/, siteResult[1][0].Domain]; // Indexes caused by stored procedure rows
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function waitFor(seconds) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, seconds);
                })];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var randomNumber, db, domain, crawler, mainScanError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    randomNumber = Math.floor(Math.random() * 10);
                    return [4 /*yield*/, waitFor(randomNumber * 1000)];
                case 1:
                    _a.sent();
                    db = new MySQLConnector_1.MySQLConnector();
                    return [4 /*yield*/, getNextSite(db)];
                case 2:
                    domain = _a.sent();
                    _a.label = 3;
                case 3:
                    if (!(domain != null)) return [3 /*break*/, 8];
                    console.log("Crawling Site " + domain);
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    crawler = new WebCrawler_1.Crawler(db, domain);
                    return [4 /*yield*/, getNextSite(db)];
                case 5:
                    // await crawler.scanPages(false);
                    domain = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    mainScanError_1 = _a.sent();
                    console.error('Main scan error', mainScanError_1);
                    return [3 /*break*/, 8];
                case 7: return [3 /*break*/, 3];
                case 8:
                    db.close();
                    return [2 /*return*/];
            }
        });
    });
}
if (argv.url != null || URL_TO_SCAN != null) {
    (function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var urlToScan, db, crawler, _b, _c, browser, e_2_1;
            var e_2, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        urlToScan = (_a = URL_TO_SCAN !== null && URL_TO_SCAN !== void 0 ? URL_TO_SCAN : argv.url) !== null && _a !== void 0 ? _a : '';
                        if (!(urlToScan !== '')) return [3 /*break*/, 10];
                        db = new MySQLConnector_1.MySQLConnector();
                        crawler = new WebCrawler_1.Crawler(db, urlToScan);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 7, 8, 9]);
                        _b = __values(['chrome', 'firefox']), _c = _b.next();
                        _e.label = 2;
                    case 2:
                        if (!!_c.done) return [3 /*break*/, 6];
                        browser = _c.value;
                        console.log("Scanning with " + browser + ": WebAssembly Enabled");
                        return [4 /*yield*/, crawler.scanPages(browser)];
                    case 3:
                        _e.sent();
                        console.log("Scanning with " + browser + ": WebAssembly Disabled");
                        return [4 /*yield*/, crawler.screenshotPagesWithWebAssemblyDisabled(browser)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        _c = _b.next();
                        return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_2_1 = _e.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 9:
                        db.close();
                        _e.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    })();
}
else {
    main();
}
//# sourceMappingURL=index.js.map