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
var fs_1 = __importDefault(require("fs"));
var util_1 = __importDefault(require("util"));
var readFile = util_1.default.promisify(fs_1.default.readFile);
var argv = require('yargs')
    .option('url', {
    alias: 'u',
    type: 'string',
    description: 'URL to scan',
})
    .option('file', {
    alias: 'f',
    type: 'string',
    description: 'File path of text file (CSV) containing list of websites to scan',
})
    .option('full', {
    alias: 'l',
    type: 'boolean',
    default: false,
    description: 'Set true to download all of the files on a web page when visited with the crawler',
})
    .argv;
var PROD = process.env.NODE_ENV === 'production' ? true : false;
var URL_TO_SCAN = process.env.URL_TO_SCAN;
function readUrlList(filepath) {
    return __awaiter(this, void 0, void 0, function () {
        var fileContents, sitesList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readFile(filepath, { encoding: 'utf8' })];
                case 1:
                    fileContents = _a.sent();
                    sitesList = fileContents.split('\n')
                        .map(function (line) { return line.trim(); });
                    return [2 /*return*/, sitesList];
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
function crawlSite(urlToScan, database) {
    return __awaiter(this, void 0, void 0, function () {
        var pageURL, _a, _b, browser_1, crawler, e_1_1;
        var e_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    pageURL = urlToScan;
                    if (!pageURL.includes('http://') && !pageURL.includes('https://')) {
                        pageURL = "http://" + pageURL;
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 7, 8, 9]);
                    _a = __values(['chrome', 'firefox']), _b = _a.next();
                    _d.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 6];
                    browser_1 = _b.value;
                    crawler = new WebCrawler_1.Crawler(database, pageURL, argv);
                    console.log("Scanning with " + browser_1 + ": WebAssembly Enabled");
                    return [4 /*yield*/, crawler.scanPages(browser_1)];
                case 3:
                    _d.sent();
                    crawler.setAlwaysScreenshot();
                    console.log("Scanning with " + browser_1 + ": WebAssembly Disabled");
                    return [4 /*yield*/, crawler.screenshotPagesWithWebAssemblyDisabled(browser_1)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var db, sitesToScan, sitesToScan_1, sitesToScan_1_1, urlToScan, e_2_1, urlToScan;
        var e_2, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    db = new MySQLConnector_1.MySQLConnector();
                    if (!(argv.file != null)) return [3 /*break*/, 10];
                    return [4 /*yield*/, readUrlList(argv.file)];
                case 1:
                    sitesToScan = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 7, 8, 9]);
                    sitesToScan_1 = __values(sitesToScan), sitesToScan_1_1 = sitesToScan_1.next();
                    _c.label = 3;
                case 3:
                    if (!!sitesToScan_1_1.done) return [3 /*break*/, 6];
                    urlToScan = sitesToScan_1_1.value;
                    console.log("" + urlToScan);
                    return [4 /*yield*/, crawlSite(urlToScan, db)];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    sitesToScan_1_1 = sitesToScan_1.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_2_1 = _c.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (sitesToScan_1_1 && !sitesToScan_1_1.done && (_b = sitesToScan_1.return)) _b.call(sitesToScan_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 9:
                    db.close();
                    return [3 /*break*/, 12];
                case 10:
                    if (!(argv.url != null || URL_TO_SCAN != null)) return [3 /*break*/, 12];
                    urlToScan = (_a = URL_TO_SCAN !== null && URL_TO_SCAN !== void 0 ? URL_TO_SCAN : argv.url) !== null && _a !== void 0 ? _a : '';
                    if (!(urlToScan !== '')) return [3 /*break*/, 12];
                    return [4 /*yield*/, crawlSite(urlToScan, db)];
                case 11:
                    _c.sent();
                    db.close();
                    _c.label = 12;
                case 12: return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=index.js.map