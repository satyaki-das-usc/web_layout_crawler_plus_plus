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
exports.Crawler = void 0;
var fs_1 = require("fs");
var mv_1 = __importDefault(require("mv"));
var util_1 = require("util");
var readdir = util_1.promisify(fs_1.readdir);
var mkdir = util_1.promisify(fs_1.mkdir);
var stat = util_1.promisify(fs_1.stat);
var unlink = util_1.promisify(fs_1.unlink);
var rmdir = util_1.promisify(fs_1.rmdir);
var URL = require('url').URL;
var fs_extra_1 = __importDefault(require("fs-extra")); // v 5.0.0
var sanitize_filename_1 = __importDefault(require("sanitize-filename"));
var PROD = process.env.NODE_ENV === 'production' ? true : false;
var puppeteer_1 = require("puppeteer");
var path_1 = require("path");
var Queue_1 = require("./Queue");
var config_json_1 = require("./config.json");
var SubURLScanMode;
(function (SubURLScanMode) {
    SubURLScanMode["FULL"] = "full";
    SubURLScanMode["RANDOM"] = "random";
    SubURLScanMode["FIRST_N_PERCENT"] = "first_n_percent";
})(SubURLScanMode || (SubURLScanMode = {}));
var SUBPAGE_PERCENTAGE_TO_VISIT = (process.env.SUBPAGE_PERCENTAGE_TO_VISIT != null) ? parseFloat(process.env.SUBPAGE_PERCENTAGE_TO_VISIT) : 0.25;
var MAX_DEPTH_LEVEL = (process.env.MAX_DEPTH_LEVEL != null) ? parseInt(process.env.MAX_DEPTH_LEVEL) : 1;
var TIME_TO_WAIT = (process.env.TIME_TO_WAIT != null) ? parseFloat(process.env.TIME_TO_WAIT) : 5;
var SUBURL_SCAN_MODE;
if (process.env.SUBURL_SCAN_MODE == null || process.env.SUBURL_SCAN_MODE.toLowerCase() == 'full') {
    SUBURL_SCAN_MODE = SubURLScanMode.FULL;
}
else if (process.env.SUBURL_SCAN_MODE.toLowerCase() == 'random') {
    SUBURL_SCAN_MODE = SubURLScanMode.RANDOM;
}
else if (process.env.SUBURL_SCAN_MODE.toLowerCase() == 'first_n_percent') {
    SUBURL_SCAN_MODE = SubURLScanMode.FIRST_N_PERCENT;
}
else {
    SUBURL_SCAN_MODE = SubURLScanMode.FULL;
}
var JS_OUTPUT_PATH = process.env.JS_OUTPUT_PATH || path_1.join(__dirname, config_json_1.crawler_js_dump_path);
var SCREENSHOT_OUTPUT_PATH = process.env.SCREENSHOT_OUTPUT_PATH || path_1.join(__dirname, config_json_1.crawler_screenshot_path);
var preloadFile = fs_1.readFileSync(path_1.join(__dirname, './small_injector.js'), 'utf8');
var Crawler = /** @class */ (function () {
    function Crawler(databaseConnector, domain, userDataDir) {
        this.pagesToVisit = new Queue_1.Queue();
        this.finalDomainOutputPath = '';
        this.screenshotOutputPath = '';
        this.webAssemblyWorkers = [];
        this.urlsSeen = new Set();
        this.containsWebAssembly = false;
        this.WebAssemblyEnabled = true;
        this.useFirefox = false;
        this.pagesWithWebAssembly = new Set();
        this.capturedRequests = new Map();
        this.capturedWebSocketRequests = new Map();
        this.browser = null;
        this.database = databaseConnector;
        this.userDataDir = PROD ? userDataDir : 'DevProfile';
        this.domain = domain;
        this.scannedSubPages = new Set();
    }
    Crawler.prototype.setLaunchOptions = function (useFirefox, disableWebAssembly) {
        if (useFirefox === void 0) { useFirefox = true; }
        if (disableWebAssembly === void 0) { disableWebAssembly = false; }
        this.WebAssemblyEnabled = !disableWebAssembly;
        var domainName = this.cleanDomain(this.domain);
        var WebAssemblyEnabledSubDirectoryName = this.WebAssemblyEnabled ? 'WebAssembly_Enabled' : 'WebAssembly_Disabled';
        this.useFirefox = useFirefox;
        var jsOutputDir = path_1.resolve(JS_OUTPUT_PATH, WebAssemblyEnabledSubDirectoryName, domainName);
        this.finalDomainOutputPath = jsOutputDir;
        var screenshotDir = path_1.resolve(SCREENSHOT_OUTPUT_PATH, WebAssemblyEnabledSubDirectoryName, domainName);
        this.screenshotOutputPath = screenshotDir;
        var launchOptions = {
            // product: 'firefox',
            userDataDir: this.userDataDir,
            // executablePath: "C:\\Program Files\\Firefox Nightly\\firefox.exe",
            // args: disableWebAssembly ? ['--js-flags=--noexpose_wasm'] : undefined,
            // args: ['--disable-setuid-sandbox', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--js-flags=--dump-wasm-module-path=${MODULE_DUMP_PATH}`],
            // ignoreDefaultArgs: ['--disable-extensions'],
            devtools: true,
            dumpio: false,
            headless: false
        };
        this.launchOptions = launchOptions;
    };
    Crawler.prototype.getFiles = function (dir) {
        return __awaiter(this, void 0, void 0, function () {
            var subdirs, files;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, readdir(dir)];
                    case 1:
                        subdirs = _a.sent();
                        return [4 /*yield*/, Promise.all(subdirs.map(function (subdir) { return __awaiter(_this, void 0, void 0, function () {
                                var res;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            res = path_1.resolve(dir, subdir);
                                            return [4 /*yield*/, stat(res)];
                                        case 1: return [2 /*return*/, (_a.sent()).isDirectory() ? this.getFiles(res) : [res]];
                                    }
                                });
                            }); }))];
                    case 2:
                        files = _a.sent();
                        return [2 /*return*/, files.reduce(function (a, f) { return a.concat(f); }, [])];
                }
            });
        });
    };
    Crawler.prototype.cleanDomainDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, rmdir(this.finalDomainOutputPath, { recursive: true })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, rmdir(this.screenshotOutputPath, { recursive: true })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log("Error deleting " + this.domain + " domain folder", e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.moveFile = function (currentPath, newPath) {
        return new Promise(function (resolve, reject) {
            mv_1.default(currentPath, newPath, {
                clobber: true
            }, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    };
    Crawler.prototype.cleanDomain = function (domain) {
        var domainName = domain.replace(/\//g, '__').replace(/:/g, '').replace(/\./g, '___').slice(0, 50);
        return domainName;
    };
    Crawler.prototype.insertInstantiateIntoDatabase = function (currentURL, domain, stackJson, parent) {
        return __awaiter(this, void 0, void 0, function () {
            var sqlParams, capturedRequests, capturedWebSocketRequests, baseQuery, sqlErr_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sqlParams = [];
                        capturedRequests = JSON.stringify(this.capturedRequests.get(currentURL));
                        capturedWebSocketRequests = JSON.stringify(this.capturedWebSocketRequests.get(currentURL));
                        baseQuery = "\n            INSERT INTO found_instantiate\n            (URL, Domain, StackTraceJSON, CapturedRequests,CapturedWebSockets,ParentPage,ScanMode) \n            VALUES(?,?,?,?,?,?,?);\n        ";
                        sqlParams.push(currentURL, domain, JSON.stringify(stackJson), capturedRequests, capturedWebSocketRequests, parent !== null && parent !== void 0 ? parent : null, SUBURL_SCAN_MODE);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.database.query(baseQuery, sqlParams)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        sqlErr_1 = _a.sent();
                        console.error('SQL Error', sqlErr_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.exit = function () {
        this.database.close();
        process.exit(0);
    };
    Crawler.prototype.sanitizeURLForFileSystem = function (url, outputPath) {
        var responseURLParsed = new URL(url);
        var responsePathname = responseURLParsed.pathname;
        var responseBasename = path_1.basename(responsePathname);
        var responsePath = responsePathname.replace(responseBasename, '');
        var safeBaseName = sanitize_filename_1.default(responseBasename).substring(0, 50);
        var safeResponseURL = responsePath + "/" + safeBaseName;
        var filePath = path_1.resolve("" + outputPath + safeResponseURL);
        if (path_1.extname(responsePathname).trim() === '') {
            filePath = filePath + "/index.html";
        }
        return filePath;
    };
    /**
     * Gets a new page and adds instrumentation code and request capturing
     */
    Crawler.prototype.getPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var page, browser, newPageError_1, currentBase64Index;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = null;
                        return [4 /*yield*/, this.getBrowser()];
                    case 1:
                        browser = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, browser.newPage()];
                    case 3:
                        page = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        newPageError_1 = _a.sent();
                        console.error('New Page Error:', newPageError_1);
                        throw newPageError_1;
                    case 5:
                        if (page == null) {
                            throw new Error('Cannot open newpage');
                        }
                        return [4 /*yield*/, page.setViewport({
                                width: 1920,
                                height: 1080
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, page.evaluateOnNewDocument(preloadFile)];
                    case 7:
                        _a.sent();
                        page.on('workercreated', function (worker) { return __awaiter(_this, void 0, void 0, function () {
                            var currentWorkerWebAssembly, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 4, , 5]);
                                        return [4 /*yield*/, worker.evaluate(preloadFile)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, worker.evaluate(function () {
                                                setTimeout(function () {
                                                    console.log(self);
                                                }, 1000);
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, worker.evaluateHandle(function () {
                                                return self.WebAssemblyCallsFound;
                                            })];
                                    case 3:
                                        currentWorkerWebAssembly = _a.sent();
                                        this.webAssemblyWorkers.push(currentWorkerWebAssembly);
                                        return [3 /*break*/, 5];
                                    case 4:
                                        err_1 = _a.sent();
                                        console.error('Worker Eval', err_1);
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, page.setRequestInterception(true)];
                    case 8:
                        _a.sent();
                        page.on('request', function (interceptedRequest) {
                            var _a, _b;
                            var requestType = interceptedRequest.resourceType();
                            var requestURL = interceptedRequest.url();
                            var currentURL = (_a = _this.currentJob) === null || _a === void 0 ? void 0 : _a.url;
                            if (currentURL != null) {
                                if (!_this.capturedRequests.get(currentURL)) {
                                    _this.capturedRequests.set(currentURL, []);
                                }
                                (_b = _this.capturedRequests.get(currentURL)) === null || _b === void 0 ? void 0 : _b.push(requestURL);
                            }
                            interceptedRequest.continue();
                        });
                        currentBase64Index = 0;
                        page.on('response', function (response) { return __awaiter(_this, void 0, void 0, function () {
                            var responseStatus, requestType, responseURL, filePath, currentURL, _a, _b, _c;
                            var _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        responseStatus = response.status();
                                        if (!(responseStatus === 200)) return [3 /*break*/, 5];
                                        requestType = response.request().resourceType();
                                        responseURL = response.url();
                                        filePath = void 0;
                                        if (responseURL.includes('data:')) {
                                            currentURL = (_e = (_d = this.currentJob) === null || _d === void 0 ? void 0 : _d.url) !== null && _e !== void 0 ? _e : 'Base64Encoded';
                                            filePath = this.sanitizeURLForFileSystem(currentURL, this.finalDomainOutputPath);
                                            filePath = path_1.dirname(filePath);
                                            filePath = path_1.resolve(filePath, "Base64_Encoded_" + currentBase64Index++);
                                        }
                                        else {
                                            filePath = this.sanitizeURLForFileSystem(responseURL, this.finalDomainOutputPath);
                                        }
                                        _f.label = 1;
                                    case 1:
                                        _f.trys.push([1, , 4, 5]);
                                        _b = (_a = fs_extra_1.default).outputFile;
                                        _c = [filePath];
                                        return [4 /*yield*/, response.buffer()];
                                    case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_f.sent()]))];
                                    case 3:
                                        _f.sent();
                                        return [3 /*break*/, 5];
                                    case 4: return [7 /*endfinally*/];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); });
                        page.setDefaultNavigationTimeout((TIME_TO_WAIT * 2) * 1000);
                        return [2 /*return*/, page];
                }
            });
        });
    };
    Crawler.prototype.makeOutputDirectories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jsOutputMkdirError_1, screenshotOutputMkdirError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mkdir(this.finalDomainOutputPath)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        jsOutputMkdirError_1 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, mkdir(this.screenshotOutputPath)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        screenshotOutputMkdirError_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.scanPages = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var firstJob, currentJob, currentURL, scanResults, e_2, browserPagesOpen, browserPagesOpen_1, browserPagesOpen_1_1, page, e_3_1, browserPagesCloseErr_1;
            var e_3, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.setLaunchOptions(false);
                        return [4 /*yield*/, this.setup()];
                    case 1:
                        _c.sent();
                        firstJob = new Queue_1.QueueJob(this.domain, this.domain, 0);
                        this.pagesToVisit.enqueue(firstJob);
                        _c.label = 2;
                    case 2:
                        if (!!this.pagesToVisit.isEmpty()) return [3 /*break*/, 20];
                        currentJob = this.pagesToVisit.dequeue();
                        if (!(currentJob != null)) return [3 /*break*/, 19];
                        this.currentJob = currentJob;
                        currentURL = currentJob.url;
                        if (this.scannedSubPages.has(currentURL)) {
                            return [3 /*break*/, 2];
                        }
                        else {
                            this.scannedSubPages.add(currentURL);
                        }
                        this.capturedRequests.clear();
                        this.capturedWebSocketRequests.clear();
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 6, , 8]);
                        return [4 /*yield*/, this.scanPage(currentJob)];
                    case 4: return [4 /*yield*/, (_c.sent())];
                    case 5:
                        scanResults = _c.sent();
                        this.containsWebAssembly = this.containsWebAssembly || scanResults.containsWebAssembly;
                        if (scanResults.containsWebAssembly) {
                            this.pagesWithWebAssembly.add(currentURL);
                        }
                        return [3 /*break*/, 8];
                    case 6:
                        e_2 = _c.sent();
                        console.error('Scan Pages:', e_2);
                        return [4 /*yield*/, this.wait(5)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 2];
                    case 8:
                        _c.trys.push([8, 18, , 19]);
                        return [4 /*yield*/, ((_a = this.browser) === null || _a === void 0 ? void 0 : _a.pages())];
                    case 9:
                        browserPagesOpen = _c.sent();
                        if (!(browserPagesOpen != null)) return [3 /*break*/, 17];
                        if (!(browserPagesOpen.length > 3)) return [3 /*break*/, 17];
                        _c.label = 10;
                    case 10:
                        _c.trys.push([10, 15, 16, 17]);
                        browserPagesOpen_1 = (e_3 = void 0, __values(browserPagesOpen)), browserPagesOpen_1_1 = browserPagesOpen_1.next();
                        _c.label = 11;
                    case 11:
                        if (!!browserPagesOpen_1_1.done) return [3 /*break*/, 14];
                        page = browserPagesOpen_1_1.value;
                        return [4 /*yield*/, page.close()];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13:
                        browserPagesOpen_1_1 = browserPagesOpen_1.next();
                        return [3 /*break*/, 11];
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        e_3_1 = _c.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 17];
                    case 16:
                        try {
                            if (browserPagesOpen_1_1 && !browserPagesOpen_1_1.done && (_b = browserPagesOpen_1.return)) _b.call(browserPagesOpen_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        browserPagesCloseErr_1 = _c.sent();
                        console.error('Browser page close error', browserPagesCloseErr_1);
                        return [3 /*break*/, 19];
                    case 19: return [3 /*break*/, 2];
                    case 20:
                        if (!!this.containsWebAssembly) return [3 /*break*/, 22];
                        return [4 /*yield*/, this.cleanDomainDir()];
                    case 21:
                        _c.sent();
                        _c.label = 22;
                    case 22: return [4 /*yield*/, this.teardown()];
                    case 23:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.takeScreenshot = function (page) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var screenshotOptions, screenshotBuffer, screenshotPath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        screenshotOptions = {
                            type: 'png',
                            fullPage: true
                        };
                        return [4 /*yield*/, page.screenshot(screenshotOptions)];
                    case 1:
                        screenshotBuffer = _c.sent();
                        if (!((_a = this.currentJob) === null || _a === void 0 ? void 0 : _a.url)) return [3 /*break*/, 3];
                        screenshotPath = this.sanitizeURLForFileSystem((_b = this.currentJob) === null || _b === void 0 ? void 0 : _b.url, this.screenshotOutputPath) + '.png';
                        return [4 /*yield*/, fs_extra_1.default.outputFile(screenshotPath, screenshotBuffer)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.isValidURL = function (url, depth) {
        //check url formatting
        if (depth < MAX_DEPTH_LEVEL) {
            if (url != null &&
                typeof (url) === 'string' &&
                url != '' &&
                url != '#' &&
                !url.includes('javascript:') &&
                !url.includes('mailto:') &&
                !url.includes('blob:') &&
                !url.includes('tel:')) {
                //If not scanned url before
                if (this.urlsSeen.has(url)) {
                    return false;
                }
                else {
                    this.urlsSeen.add(url);
                    return true;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    };
    Crawler.prototype.handleSubURLScan = function (page, currentJob) {
        return __awaiter(this, void 0, void 0, function () {
            var url, depth, bodyElem, urls, upperLimit, i, subURL, nextJob, subpagesToVisit, upperLimit, min, max, i, random, randomURL, randomAttepts, subURL, nextJob, subpagesToVisit, upperLimit, i, subURL, nextJob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(page != null && page.$ != undefined)) return [3 /*break*/, 3];
                        url = currentJob.url, depth = currentJob.depth;
                        return [4 /*yield*/, page.$('body')];
                    case 1:
                        bodyElem = _a.sent();
                        if (!(bodyElem != null && bodyElem.$$eval != undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, bodyElem.$$eval('a', function (nodes) { return nodes.map(function (n) { return n.href; }); })];
                    case 2:
                        urls = _a.sent();
                        if (SUBURL_SCAN_MODE == SubURLScanMode.FULL) {
                            upperLimit = urls.length;
                            for (i = 0; i < upperLimit; i++) {
                                subURL = urls[i];
                                if (this.isValidURL(subURL, depth)) {
                                    nextJob = new Queue_1.QueueJob(subURL, this.domain, depth + 1, "" + url);
                                    this.pagesToVisit.enqueue(nextJob);
                                }
                            }
                        }
                        else if (SUBURL_SCAN_MODE == SubURLScanMode.RANDOM) {
                            subpagesToVisit = Math.floor(urls.length * SUBPAGE_PERCENTAGE_TO_VISIT);
                            upperLimit = (urls.length < subpagesToVisit ? urls.length : subpagesToVisit);
                            min = 0;
                            max = urls.length - 1;
                            for (i = 0; i < upperLimit; i++) {
                                random = Math.floor(Math.random() * (+max - +min));
                                randomURL = urls[random];
                                for (randomAttepts = 0; randomAttepts < 4; randomAttepts++) {
                                    if (this.urlsSeen.has(randomURL)) {
                                        random = Math.floor(Math.random() * (+max - +min));
                                        randomURL = urls[random];
                                    }
                                    else {
                                        break;
                                    }
                                }
                                subURL = randomURL;
                                if (this.isValidURL(subURL, depth)) {
                                    nextJob = new Queue_1.QueueJob(subURL, this.domain, depth + 1, "" + url);
                                    this.pagesToVisit.enqueue(nextJob);
                                }
                            }
                        }
                        else if (SUBURL_SCAN_MODE == SubURLScanMode.FIRST_N_PERCENT) {
                            subpagesToVisit = Math.floor(urls.length * SUBPAGE_PERCENTAGE_TO_VISIT);
                            upperLimit = (urls.length < subpagesToVisit ? urls.length : subpagesToVisit);
                            for (i = 0; i < upperLimit; i++) {
                                subURL = urls[i];
                                if (this.isValidURL(subURL, depth)) {
                                    nextJob = new Queue_1.QueueJob(subURL, this.domain, depth + 1, "" + url);
                                    this.pagesToVisit.enqueue(nextJob);
                                }
                            }
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.formatInstrumentationDetailsForDB = function (instrumentationDetails) {
        var dbFormattedRecord = null;
        try {
            if (instrumentationDetails != null) {
                dbFormattedRecord = { altered: instrumentationDetails.altered, WasmFiles: instrumentationDetails.WasmFiles };
            }
        }
        catch (formatInstrumentationError) {
            console.error('Format instrumentation error', formatInstrumentationError);
        }
        return dbFormattedRecord;
    };
    Crawler.prototype.collectInstrumentationRecordsFromPage = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var windowWebAssemblyHandle, instrumentationRecords, windowInstrumentHandleError_1, _a, _b, webWorkerHandle, workerObject, formattedInstrumentation, workerHandlerError_1, e_4_1;
            var e_4, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        windowWebAssemblyHandle = null;
                        instrumentationRecords = {
                            window: null,
                            workers: [],
                            altered: false
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, page.evaluateHandle(function () { return window.WebAssemblyCallsFound; })];
                    case 2: return [4 /*yield*/, (_d.sent()).jsonValue()];
                    case 3:
                        windowWebAssemblyHandle = (_d.sent());
                        if (windowWebAssemblyHandle) {
                            instrumentationRecords.altered = windowWebAssemblyHandle.altered;
                            instrumentationRecords.window = this.formatInstrumentationDetailsForDB(windowWebAssemblyHandle);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        windowInstrumentHandleError_1 = _d.sent();
                        console.error('Window Instrumentation Handle Error', windowInstrumentHandleError_1);
                        return [3 /*break*/, 5];
                    case 5:
                        if (!(this.webAssemblyWorkers.length > 0)) return [3 /*break*/, 15];
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 13, 14, 15]);
                        _a = __values(this.webAssemblyWorkers), _b = _a.next();
                        _d.label = 7;
                    case 7:
                        if (!!_b.done) return [3 /*break*/, 12];
                        webWorkerHandle = _b.value;
                        _d.label = 8;
                    case 8:
                        _d.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, webWorkerHandle.jsonValue()];
                    case 9:
                        workerObject = _d.sent();
                        if (workerObject != undefined) {
                            instrumentationRecords.altered = instrumentationRecords.altered || workerObject.altered;
                            if (workerObject.altered) {
                                formattedInstrumentation = this.formatInstrumentationDetailsForDB(workerObject);
                                if (formattedInstrumentation != null) {
                                    instrumentationRecords.workers.push(formattedInstrumentation);
                                }
                            }
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        workerHandlerError_1 = _d.sent();
                        console.error(workerHandlerError_1);
                        return [3 /*break*/, 11];
                    case 11:
                        _b = _a.next();
                        return [3 /*break*/, 7];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_4_1 = _d.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 15: return [2 /*return*/, instrumentationRecords];
                }
            });
        });
    };
    Crawler.prototype.scrollToBottom = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var distance, delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        distance = 100;
                        delay = 100;
                        _a.label = 1;
                    case 1: return [4 /*yield*/, page.evaluate(function () { return document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight; })];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        //  @ts-ignore
                        return [4 /*yield*/, page.evaluate(function (y) { document.scrollingElement.scrollBy(0, y); }, distance)];
                    case 3:
                        //  @ts-ignore
                        _a.sent();
                        return [4 /*yield*/, page.waitFor(delay)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.scrollToTop = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var distance, delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        distance = -1 * 100;
                        delay = 100;
                        _a.label = 1;
                    case 1: return [4 /*yield*/, page.evaluate(function () { return document.scrollingElement.scrollTop !== 0; })];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        //  @ts-ignore
                        return [4 /*yield*/, page.evaluate(function (y) { document.scrollingElement.scrollBy(0, y); }, distance)];
                    case 3:
                        //  @ts-ignore
                        _a.sent();
                        return [4 /*yield*/, page.waitFor(delay)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.scanPage = function (currentJob) {
        var _this = this;
        var pageURL = "" + currentJob.url;
        var currentDepth = currentJob.depth;
        this.webAssemblyWorkers = [];
        if (!pageURL.includes('http://') && !pageURL.includes('https://')) {
            pageURL = "http://" + pageURL;
        }
        console.log('Scanning ', pageURL, currentDepth);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var crawlResults, page, timeout, browserErr_1, instrumentationRecords, requestsForPage, nonWasmFilesFoundError_1, err_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        crawlResults = { containsWebAssembly: false };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getPage()];
                    case 2:
                        page = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        browserErr_1 = _a.sent();
                        reject(browserErr_1);
                        return [2 /*return*/];
                    case 4:
                        page.on('error', function (error) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                reject(error);
                                return [2 /*return*/];
                            });
                        }); });
                        timeout = setTimeout(function () {
                            console.log('EXECUTE TIMEOUT');
                            resolve(crawlResults);
                        }, (TIME_TO_WAIT * 3) * 1000);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 18, 19, 20]);
                        return [4 /*yield*/, page.goto(pageURL, {
                                waitUntil: 'domcontentloaded'
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.scrollToBottom(page)];
                    case 7:
                        _a.sent();
                        if (!this.currentJob) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.handleSubURLScan(page, this.currentJob)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, page.waitFor(TIME_TO_WAIT * 1000)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.scrollToTop(page)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, this.collectInstrumentationRecordsFromPage(page)];
                    case 12:
                        instrumentationRecords = _a.sent();
                        if (!instrumentationRecords.altered) return [3 /*break*/, 16];
                        requestsForPage = this.capturedRequests.get(pageURL);
                        crawlResults = {
                            containsWebAssembly: true,
                            pageFound: pageURL,
                            domain: this.domain,
                            capturedRequests: requestsForPage,
                            intrumentationRecords: instrumentationRecords
                        };
                        _a.label = 13;
                    case 13:
                        _a.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, this.takeScreenshot(page)];
                    case 14:
                        _a.sent();
                        console.log('Insert instantiate!');
                        return [3 /*break*/, 16];
                    case 15:
                        nonWasmFilesFoundError_1 = _a.sent();
                        console.log(nonWasmFilesFoundError_1);
                        return [3 /*break*/, 16];
                    case 16: return [4 /*yield*/, page.close()];
                    case 17:
                        _a.sent();
                        return [3 /*break*/, 20];
                    case 18:
                        err_2 = _a.sent();
                        console.error('Navigation Error:', err_2);
                        reject(err_2);
                        return [2 /*return*/];
                    case 19:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 20:
                        resolve(crawlResults);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Crawler.prototype.screenshotPageOnly = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var page, browserErr_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getPage()];
                    case 1:
                        page = _a.sent();
                        return [4 /*yield*/, page.goto(url, {
                                waitUntil: 'domcontentloaded'
                            })];
                    case 2:
                        _a.sent();
                        // await this.scrollToBottom(page);
                        return [4 /*yield*/, page.waitFor(TIME_TO_WAIT * 1000)];
                    case 3:
                        // await this.scrollToBottom(page);
                        _a.sent();
                        // await this.scrollToTop(page);
                        return [4 /*yield*/, this.takeScreenshot(page)];
                    case 4:
                        // await this.scrollToTop(page);
                        _a.sent();
                        return [4 /*yield*/, page.close()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        browserErr_2 = _a.sent();
                        throw browserErr_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.screenshotPagesWithWebAssemblyDisabled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pagesToScreenshot, pagesToScreenshot_1, pagesToScreenshot_1_1, url, screenshotOnlyError_1, e_5_1;
            var e_5, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setLaunchOptions(false, true);
                        return [4 /*yield*/, this.startBrowser()];
                    case 1:
                        _b.sent();
                        pagesToScreenshot = this.pagesWithWebAssembly;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, 10, 11]);
                        pagesToScreenshot_1 = __values(pagesToScreenshot), pagesToScreenshot_1_1 = pagesToScreenshot_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!pagesToScreenshot_1_1.done) return [3 /*break*/, 8];
                        url = pagesToScreenshot_1_1.value;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.screenshotPageOnly(url)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        screenshotOnlyError_1 = _b.sent();
                        console.error("Screenshot only error for " + url, screenshotOnlyError_1);
                        return [3 /*break*/, 7];
                    case 7:
                        pagesToScreenshot_1_1 = pagesToScreenshot_1.next();
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_5_1 = _b.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (pagesToScreenshot_1_1 && !pagesToScreenshot_1_1.done && (_a = pagesToScreenshot_1.return)) _a.call(pagesToScreenshot_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        this.teardown();
                        return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.getBrowser = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.browser == null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.startBrowser()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this.browser == null) {
                            // throw new Error('Cannot start browser');
                            this.exit();
                            throw new Error('Cannot start browser');
                        }
                        return [2 /*return*/, this.browser];
                }
            });
        });
    };
    Crawler.prototype.startBrowser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, launchError_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.browser = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, puppeteer_1.launch(this.launchOptions)];
                    case 2:
                        _a.browser = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        launchError_1 = _b.sent();
                        console.error('Launch Error', launchError_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.closeBrowser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var browser, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBrowser()];
                    case 1:
                        browser = _a.sent();
                        if (!(browser != null)) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, browser.close()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_3 = _a.sent();
                        this.exit();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.makeOutputDirectories()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.startBrowser()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.teardown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.closeBrowser()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.wait = function (seconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, seconds * 1000);
        });
    };
    return Crawler;
}());
exports.Crawler = Crawler;
//# sourceMappingURL=WebCrawler.js.map