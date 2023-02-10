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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
var fs_1 = require("fs");
var mv_1 = __importDefault(require("mv"));
var CommonUtilities_1 = require("./CommonUtilities");
var util_1 = require("util");
var readdir = util_1.promisify(fs_1.readdir);
var mkdir = util_1.promisify(fs_1.mkdir);
var stat = util_1.promisify(fs_1.stat);
var rmdir = util_1.promisify(fs_1.rmdir);
var exists = util_1.promisify(fs_1.exists);
var URL = require('url').URL;
var fs_extra_1 = __importDefault(require("fs-extra")); // v 5.0.0
var sanitize_filename_1 = __importDefault(require("sanitize-filename"));
var playwright_1 = __importDefault(require("playwright"));
var chromium = playwright_1.default.chromium, firefox = playwright_1.default.firefox;
var hasha_1 = __importDefault(require("hasha"));
var path_1 = require("path");
var Queue_1 = require("./Queue");
var adblocker_playwright_1 = require("@cliqz/adblocker-playwright");
var uuidv1 = require('uuidv1');
var config_json_1 = require("./config.json");
var chalk_1 = __importDefault(require("chalk"));
var SubURLScanMode;
(function (SubURLScanMode) {
    SubURLScanMode["FULL"] = "full";
    SubURLScanMode["RANDOM"] = "random";
    SubURLScanMode["FIRST_N_PERCENT"] = "first_n_percent";
})(SubURLScanMode || (SubURLScanMode = {}));
var SUBPAGE_PERCENTAGE_TO_VISIT = (process.env.SUBPAGE_PERCENTAGE_TO_VISIT != null) ? parseFloat(process.env.SUBPAGE_PERCENTAGE_TO_VISIT) : 0.25;
var MAX_CRAWL_DEPTH_LEVEL = (process.env.MAX__CRAWL_DEPTH_LEVEL != null) ? parseInt(process.env.MAX__CRAWL_DEPTH_LEVEL) : config_json_1.max_crawl_depth_level;
var HEADLESS_BROWSER = false;
var TIME_TO_WAIT = (process.env.TIME_TO_WAIT != null) ? parseFloat(process.env.TIME_TO_WAIT) : config_json_1.time_to_wait_on_page;
var SUBURL_SCAN_MODE;
var suburl_scan_option = (_a = process.env.SUBURL_SCAN_MODE) !== null && _a !== void 0 ? _a : config_json_1.suburl_scan_mode;
if (config_json_1.suburl_scan_mode.toLowerCase() == 'full') {
    SUBURL_SCAN_MODE = SubURLScanMode.FULL;
}
else if (config_json_1.suburl_scan_mode.toLowerCase() == 'random') {
    SUBURL_SCAN_MODE = SubURLScanMode.RANDOM;
}
else if (config_json_1.suburl_scan_mode.toLowerCase() == 'first_n_percent') {
    SUBURL_SCAN_MODE = SubURLScanMode.FIRST_N_PERCENT;
}
else {
    SUBURL_SCAN_MODE = SubURLScanMode.FULL;
}
var JS_OUTPUT_PATH = process.env.JS_OUTPUT_PATH || path_1.join(__dirname, config_json_1.crawler_js_dump_path);
var SCREENSHOT_OUTPUT_PATH = process.env.SCREENSHOT_OUTPUT_PATH || path_1.join(__dirname, config_json_1.crawler_screenshot_path);
var preloadFile = fs_1.readFileSync(path_1.join(__dirname, './small_injector.js'), 'utf8');
var Crawler = /** @class */ (function () {
    function Crawler(databaseConnector, domain, argv) {
        this.enteringScreening = false;
        this.hasVideo = false;
        this.domainReal = ""; // this is because the misuse of domain
        this.videoFormat = [".mp4", ".mov", ".wmv", ".avi", ".avchd", ".flv", ".f4v", ".f4p", ".f4a", ".f4b", ".swf", ".mkv", ".webm", ".vob", ".ogg", ".ogv", ".drc", ".gifv"];
        this.pagesToVisit = new Queue_1.Queue();
        this.userDataDir = uuidv1();
        this.finalDomainOutputPath = '';
        this.screenshotOutputPath = '';
        this.webAssemblyWorkers = [];
        this.urlsSeen = new Set();
        this.containsWebAssembly = false;
        this.WebAssemblyEnabled = true;
        this.useFirefox = false;
        this.pagesWithWebAssembly = new Set();
        this.pagesWithVideo = new Set();
        this.insertedURLs = new Set();
        this.currentBase64Index = 0;
        this.alwaysScreenshot = true;
        this.screenshotSubPath = "";
        this.capturedRequests = new Map();
        this.capturedWebSocketRequests = new Map();
        this.browser = null;
        this.database = databaseConnector;
        this.domain = domain; //new URL(domain).hostname;
        this.domainReal = new URL(domain).hostname;
        this.scannedSubPages = new Set();
        this.shouldDownloadAllFiles = argv.full;
        this.handleFileResponse = this.handleFileResponse.bind(this);
        this.handleWebAssemblyResponseOnly = this.handleWebAssemblyResponseOnly.bind(this);
    }
    Crawler.prototype.setLaunchOptions = function (browser, disableWebAssembly) {
        if (disableWebAssembly === void 0) { disableWebAssembly = false; }
        var useFirefox = browser === 'firefox';
        this.WebAssemblyEnabled = !disableWebAssembly;
        var domainName = this.cleanDomain(this.domainReal);
        var WebAssemblyEnabledSubDirectoryName = this.WebAssemblyEnabled ? 'WebAssembly_Enabled' : 'WebAssembly_Disabled';
        this.useFirefox = useFirefox;
        var UsingFirefoxSubDirectoryName = this.useFirefox ? 'Firefox' : 'Chrome';
        var jsOutputDir = path_1.resolve(JS_OUTPUT_PATH, domainName, UsingFirefoxSubDirectoryName, WebAssemblyEnabledSubDirectoryName);
        this.finalDomainOutputPath = jsOutputDir;
        var screenshotDir = path_1.resolve(SCREENSHOT_OUTPUT_PATH, domainName);
        this.screenshotSubPath = path_1.join(UsingFirefoxSubDirectoryName, WebAssemblyEnabledSubDirectoryName);
        this.screenshotOutputPath = screenshotDir;
        if (useFirefox) {
            if (!this.WebAssemblyEnabled) {
                this.userDataDir = CommonUtilities_1.makeFirefoxProfileWithWebAssemblyDisabled();
            }
            else {
                this.userDataDir = CommonUtilities_1.makeFirefoxProfileWithWebAssemblyEnabled();
            }
        }
        else {
            this.userDataDir = CommonUtilities_1.makeChromeProfile();
        }
    };
    Crawler.prototype.hashBuffer = function (buffer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, hasha_1.default.async(buffer, { algorithm: 'sha256' })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
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
            var sqlParams, capturedRequests, baseQuery, sqlErr_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sqlParams = [];
                        capturedRequests = JSON.stringify(this.capturedRequests.get(currentURL));
                        baseQuery = "\n            INSERT INTO found_page\n            (URL, Domain, StackTraceJSON, CapturedRequests,ParentPage) \n            VALUES(?,?,?,?,?);\n        ";
                        sqlParams.push(currentURL, domain, JSON.stringify(stackJson), capturedRequests, parent !== null && parent !== void 0 ? parent : null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.database.query(baseQuery, sqlParams)];
                    case 2:
                        _a.sent();
                        this.insertedURLs.add(currentURL);
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
        //join(filePath,UsingFirefoxSubDirectoryName,WebAssemblyEnabledSubDirectoryName)
        //console.log(this.screenshotSubPath)
        if (path_1.extname(responsePathname).trim() === '') {
            filePath = filePath + "/" + this.screenshotSubPath + "/index.html";
        }
        else {
            filePath = path_1.dirname(filePath) + "/" + this.screenshotSubPath + "/index.html";
        }
        //console.log(filePath);
        return filePath;
    };
    /**
     * Gets a new page and adds instrumentation code and request capturing
     */
    Crawler.prototype.handleFileResponse = function (response) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var responseStatus, responseURL, currentURL, filePath, currentURL_1, responseBody, saveResponseError_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        responseStatus = response.status();
                        if (!(responseStatus === 200)) return [3 /*break*/, 5];
                        responseURL = response.url();
                        currentURL = (_a = this.currentJob) === null || _a === void 0 ? void 0 : _a.url;
                        if (currentURL != null) {
                            if (!this.capturedRequests.get(currentURL)) {
                                this.capturedRequests.set(currentURL, []);
                            }
                            (_b = this.capturedRequests.get(currentURL)) === null || _b === void 0 ? void 0 : _b.push(responseURL);
                        }
                        filePath = void 0;
                        if (responseURL.includes('data:')) {
                            currentURL_1 = (_d = (_c = this.currentJob) === null || _c === void 0 ? void 0 : _c.url) !== null && _d !== void 0 ? _d : 'Base64Encoded';
                            filePath = this.sanitizeURLForFileSystem(currentURL_1, this.finalDomainOutputPath);
                            filePath = path_1.dirname(filePath);
                            filePath = path_1.resolve(filePath, "Base64_Encoded_" + this.currentBase64Index++);
                        }
                        else {
                            filePath = this.sanitizeURLForFileSystem(responseURL, this.finalDomainOutputPath);
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, response.body()];
                    case 2:
                        responseBody = _e.sent();
                        return [4 /*yield*/, fs_extra_1.default.outputFile(filePath, responseBody)];
                    case 3:
                        _e.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        saveResponseError_1 = _e.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.handleWebAssemblyResponseOnly = function (response) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var responseStatus, responseURL, currentURL, filePath, responseBody, saveResponseError_2, currentURL_2, responseBody, saveResponseError_3;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        responseStatus = response.status();
                        if (!(responseStatus === 200)) return [3 /*break*/, 11];
                        responseURL = response.url();
                        currentURL = (_a = this.currentJob) === null || _a === void 0 ? void 0 : _a.url;
                        filePath = void 0;
                        if (!(currentURL != null
                            && (responseURL.endsWith('.wasm')
                                || responseURL.endsWith('.wat')
                                || responseURL.endsWith('.wast')))) return [3 /*break*/, 6];
                        if (!this.capturedRequests.get(currentURL)) {
                            this.capturedRequests.set(currentURL, []);
                        }
                        (_b = this.capturedRequests.get(currentURL)) === null || _b === void 0 ? void 0 : _b.push(responseURL);
                        filePath = this.sanitizeURLForFileSystem(responseURL, this.finalDomainOutputPath);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, response.body()];
                    case 2:
                        responseBody = _e.sent();
                        return [4 /*yield*/, fs_extra_1.default.outputFile(filePath, responseBody)];
                    case 3:
                        _e.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        saveResponseError_2 = _e.sent();
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 11];
                    case 6:
                        if (!responseURL.includes('data:application/octet-stream;')) return [3 /*break*/, 11];
                        currentURL_2 = (_d = (_c = this.currentJob) === null || _c === void 0 ? void 0 : _c.url) !== null && _d !== void 0 ? _d : 'Base64Encoded';
                        filePath = this.sanitizeURLForFileSystem(currentURL_2, this.finalDomainOutputPath);
                        filePath = path_1.dirname(filePath);
                        filePath = path_1.resolve(filePath, "Base64_Encoded_" + this.currentBase64Index++);
                        _e.label = 7;
                    case 7:
                        _e.trys.push([7, 10, , 11]);
                        return [4 /*yield*/, response.body()];
                    case 8:
                        responseBody = _e.sent();
                        return [4 /*yield*/, fs_extra_1.default.outputFile(filePath, responseBody)];
                    case 9:
                        _e.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        saveResponseError_3 = _e.sent();
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.getPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var page, browser, newPageError_1, startBrowserError_1, shouldDownloadAllFiles;
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
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, browser.newPage()];
                    case 3:
                        page = _a.sent();
                        if (!this.WebAssemblyEnabled) return [3 /*break*/, 5];
                        return [4 /*yield*/, page.addInitScript(preloadFile)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        newPageError_1 = _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        if (!(page == null)) return [3 /*break*/, 14];
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 13, , 14]);
                        return [4 /*yield*/, this.startBrowser()];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, browser.newPage()];
                    case 10:
                        page = _a.sent();
                        if (!this.WebAssemblyEnabled) return [3 /*break*/, 12];
                        return [4 /*yield*/, page.addInitScript(preloadFile)];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        startBrowserError_1 = _a.sent();
                        console.error("Starting browser error", startBrowserError_1);
                        throw startBrowserError_1;
                    case 14:
                        page.on('frameattached', function (data) {
                            if (_this.enteringScreening)
                                _this.hasVideo = true;
                        });
                        return [4 /*yield*/, page.exposeFunction('saveWasmBuffer', function (stringBuffer) { return __awaiter(_this, void 0, void 0, function () {
                                var str2ab, wasmBuffer, bufferHashString;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            str2ab = function _str2ab(str) {
                                                var buf = new ArrayBuffer(str.length); // 1 byte for each char
                                                var bufView = new Uint8Array(buf);
                                                for (var i = 0, strLen = str.length; i < strLen; i++) {
                                                    bufView[i] = str.charCodeAt(i);
                                                }
                                                return Buffer.from(buf);
                                            };
                                            this.containsWebAssembly = true;
                                            if (this.currentJob) {
                                                this.pagesWithWebAssembly.add(this.currentJob.url);
                                            }
                                            wasmBuffer = str2ab(stringBuffer);
                                            return [4 /*yield*/, this.hashBuffer(wasmBuffer)];
                                        case 1:
                                            bufferHashString = _a.sent();
                                            return [4 /*yield*/, fs_extra_1.default.outputFile(path_1.resolve(this.finalDomainOutputPath, bufferHashString + ".wasm"), wasmBuffer)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 15:
                        _a.sent();
                        // await page.setViewportSize({
                        //     width: 600,//1920,
                        //     height: 800//1080
                        // });
                        return [4 /*yield*/, page.setViewportSize({
                                width: 640,
                                height: 480,
                            })];
                    case 16:
                        // await page.setViewportSize({
                        //     width: 600,//1920,
                        //     height: 800//1080
                        // });
                        _a.sent();
                        if (this.WebAssemblyEnabled) {
                            page.on('worker', function (worker) { return __awaiter(_this, void 0, void 0, function () {
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
                        }
                        this.currentBase64Index = 0;
                        shouldDownloadAllFiles = this.shouldDownloadAllFiles;
                        page.on('response', shouldDownloadAllFiles ? this.handleFileResponse : this.handleWebAssemblyResponseOnly);
                        page.setDefaultNavigationTimeout(0);
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
    Crawler.prototype.scanPages = function (browser) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, url, job, scanResults, e_2, e_3_1, firstJob, currentJob, currentURL, scanResults, e_4, browserPagesOpen, browserPagesOpen_1, browserPagesOpen_1_1, page, e_5_1, browserPagesCloseErr_1;
            var e_3, _d, e_5, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        this.setLaunchOptions(browser, false);
                        return [4 /*yield*/, this.setup()];
                    case 1:
                        _f.sent();
                        console.log(this.pagesWithWebAssembly);
                        if (!(this.pagesWithWebAssembly.size > 0)) return [3 /*break*/, 13];
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 10, 11, 12]);
                        _b = __values(this.pagesWithWebAssembly), _c = _b.next();
                        _f.label = 3;
                    case 3:
                        if (!!_c.done) return [3 /*break*/, 9];
                        url = _c.value;
                        job = new Queue_1.QueueJob(url, this.domain, 0);
                        this.currentJob = job;
                        this.capturedRequests.clear();
                        this.capturedWebSocketRequests.clear();
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, this.scanPage(job)];
                    case 5: return [4 /*yield*/, (_f.sent())];
                    case 6:
                        scanResults = _f.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_2 = _f.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _c = _b.next();
                        return [3 /*break*/, 3];
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        e_3_1 = _f.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 12];
                    case 11:
                        try {
                            if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 12: return [3 /*break*/, 31];
                    case 13:
                        firstJob = new Queue_1.QueueJob(this.domain, this.domain, 0);
                        this.pagesToVisit.enqueue(firstJob);
                        _f.label = 14;
                    case 14:
                        if (!!this.pagesToVisit.isEmpty()) return [3 /*break*/, 31];
                        currentJob = this.pagesToVisit.dequeue();
                        console.log(currentJob);
                        if (!(currentJob != null)) return [3 /*break*/, 30];
                        this.currentJob = currentJob;
                        currentURL = currentJob.url;
                        //console.log("bef scanning")
                        if (this.scannedSubPages.has(currentURL)) {
                            return [3 /*break*/, 14];
                        }
                        else {
                            this.scannedSubPages.add(currentURL);
                        }
                        // console.log("scanning")
                        this.capturedRequests.clear();
                        this.capturedWebSocketRequests.clear();
                        _f.label = 15;
                    case 15:
                        _f.trys.push([15, 18, , 20]);
                        return [4 /*yield*/, this.scanPage(currentJob)];
                    case 16: return [4 /*yield*/, (_f.sent())];
                    case 17:
                        scanResults = _f.sent();
                        return [3 /*break*/, 20];
                    case 18:
                        e_4 = _f.sent();
                        console.error('Scan Pages:', e_4);
                        return [4 /*yield*/, this.wait(5)];
                    case 19:
                        _f.sent();
                        return [3 /*break*/, 14];
                    case 20:
                        _f.trys.push([20, 29, , 30]);
                        browserPagesOpen = (_a = this.browser) === null || _a === void 0 ? void 0 : _a.pages();
                        if (!(browserPagesOpen != null)) return [3 /*break*/, 28];
                        if (!(browserPagesOpen.length > 3)) return [3 /*break*/, 28];
                        _f.label = 21;
                    case 21:
                        _f.trys.push([21, 26, 27, 28]);
                        browserPagesOpen_1 = (e_5 = void 0, __values(browserPagesOpen)), browserPagesOpen_1_1 = browserPagesOpen_1.next();
                        _f.label = 22;
                    case 22:
                        if (!!browserPagesOpen_1_1.done) return [3 /*break*/, 25];
                        page = browserPagesOpen_1_1.value;
                        return [4 /*yield*/, page.close()];
                    case 23:
                        _f.sent();
                        _f.label = 24;
                    case 24:
                        browserPagesOpen_1_1 = browserPagesOpen_1.next();
                        return [3 /*break*/, 22];
                    case 25: return [3 /*break*/, 28];
                    case 26:
                        e_5_1 = _f.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 28];
                    case 27:
                        try {
                            if (browserPagesOpen_1_1 && !browserPagesOpen_1_1.done && (_e = browserPagesOpen_1.return)) _e.call(browserPagesOpen_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7 /*endfinally*/];
                    case 28: return [3 /*break*/, 30];
                    case 29:
                        browserPagesCloseErr_1 = _f.sent();
                        console.error('Browser page close error', browserPagesCloseErr_1);
                        return [3 /*break*/, 30];
                    case 30: return [3 /*break*/, 14];
                    case 31:
                        if (!(!this.containsWebAssembly && !this.alwaysScreenshot)) return [3 /*break*/, 33];
                        return [4 /*yield*/, this.cleanDomainDir()];
                    case 32:
                        _f.sent();
                        _f.label = 33;
                    case 33: return [4 /*yield*/, this.teardown()];
                    case 34:
                        _f.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.checkVideoContainer = function (page, pageURL) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.evaluate(function () {
                            var videoElement = document.getElementsByTagName("video");
                            if (videoElement.length > 0) {
                                return true;
                            }
                            return false;
                        }).then(function (results) {
                            if (results) {
                                _this.hasVideo = true;
                                console.log(pageURL + " found video!");
                            }
                            else {
                                console.log(pageURL + " no video found");
                            }
                        }).catch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.takeScreenshot = function (page) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var screenshotBuffer, imageType, screenshotError_1, fallbackScreenshotError_1, screenshotPath, parentDir;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        //First attempt full-page screenshot
                        page.screenshot();
                        screenshotBuffer = null;
                        imageType = 'jpeg';
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        this.enteringScreening = true;
                        return [4 /*yield*/, page.screenshot({
                                type: imageType,
                                fullPage: true,
                                animations: "disabled",
                                scale: "css"
                            })];
                    case 2:
                        screenshotBuffer = _c.sent();
                        this.enteringScreening = false;
                        return [3 /*break*/, 4];
                    case 3:
                        screenshotError_1 = _c.sent();
                        console.error(chalk_1.default.yellow("Couldn't take full-page screenshot. Trying viewport screenshot."));
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(screenshotBuffer == null)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.wait(3)];
                    case 5:
                        _c.sent();
                        this.enteringScreening = true;
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, page.screenshot({
                                type: imageType,
                                fullPage: false,
                                animations: "disabled",
                                scale: "css"
                            })];
                    case 7:
                        screenshotBuffer = _c.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        fallbackScreenshotError_1 = _c.sent();
                        console.error(chalk_1.default.yellow("Couldn't take viewport screenshot."));
                        throw fallbackScreenshotError_1;
                    case 9:
                        this.enteringScreening = false;
                        _c.label = 10;
                    case 10: return [4 /*yield*/, this.checkVideoContainer(page, page.url())];
                    case 11:
                        _c.sent();
                        if (!(screenshotBuffer != null && ((_a = this.currentJob) === null || _a === void 0 ? void 0 : _a.url))) return [3 /*break*/, 14];
                        console.log(this.currentJob.url);
                        screenshotPath = this.sanitizeURLForFileSystem((_b = this.currentJob) === null || _b === void 0 ? void 0 : _b.url, this.screenshotOutputPath) + '.' + imageType;
                        parentDir = path_1.dirname(screenshotPath);
                        return [4 /*yield*/, fs_extra_1.default.outputFile(parentDir + "/screenshot." + imageType, screenshotBuffer)];
                    case 12:
                        _c.sent();
                        //console.log(this.hasVideo);
                        return [4 /*yield*/, fs_extra_1.default.outputFile(parentDir + "/screenshot.txt", "" + this.hasVideo).then(function () { return (_this.hasVideo = false); })];
                    case 13:
                        //console.log(this.hasVideo);
                        _c.sent();
                        _c.label = 14;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.isValidURL = function (url, depth) {
        //check url formatting
        if (depth < MAX_CRAWL_DEPTH_LEVEL) {
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
    Crawler.prototype.checkDomain = function (subURL) {
        if (subURL.startsWith("https://")) {
            if (this.domain.startsWith("https://")) {
                return subURL.startsWith(this.domain);
            }
            else {
                return subURL.substring(8, subURL.length).startsWith(this.domain.substring(7, this.domain.length));
            }
        }
        else {
            if (this.domain.startsWith("https://")) {
                return subURL.substring(7, subURL.length).startsWith(this.domain.substring(8, this.domain.length));
            }
            else {
                return subURL.startsWith(this.domain);
            }
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
                                if (this.isValidURL(subURL, depth) && this.checkDomain(subURL)) {
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
                                if (this.isValidURL(subURL, depth) && this.checkDomain(subURL)) {
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
                                if (this.isValidURL(subURL, depth) && this.checkDomain(subURL)) {
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
            var windowWebAssemblyHandle, instrumentationRecords, windowInstrumentHandleError_1, _a, _b, webWorkerHandle, workerObject, formattedInstrumentation, workerHandlerError_1, e_6_1;
            var e_6, _c;
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
                        return [3 /*break*/, 11];
                    case 11:
                        _b = _a.next();
                        return [3 /*break*/, 7];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_6_1 = _d.sent();
                        e_6 = { error: e_6_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_6) throw e_6.error; }
                        return [7 /*endfinally*/];
                    case 15: return [2 /*return*/, instrumentationRecords];
                }
            });
        });
    };
    Crawler.prototype.scrollToBottom = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var distance, delay, currentScroll;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        distance = 100;
                        delay = 100;
                        currentScroll = 0;
                        _a.label = 1;
                    case 1: return [4 /*yield*/, page.evaluate(function () { return document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight; })];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        //  @ts-ignore
                        return [4 /*yield*/, page.evaluate(function (y) { document.scrollingElement.scrollBy(0, y); }, distance)];
                    case 3:
                        //  @ts-ignore
                        _a.sent();
                        return [4 /*yield*/, page.waitForTimeout(delay)];
                    case 4:
                        _a.sent();
                        currentScroll += 1;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Crawler.prototype.scrollToTop = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var distance, delay, currentScroll;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        distance = -1 * 100;
                        delay = 100;
                        currentScroll = 0;
                        _a.label = 1;
                    case 1: return [4 /*yield*/, page.evaluate(function () { return document.scrollingElement.scrollTop !== 0; })];
                    case 2:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        //  @ts-ignore
                        return [4 /*yield*/, page.evaluate(function (y) { document.scrollingElement.scrollBy(0, y); }, distance)];
                    case 3:
                        //  @ts-ignore
                        _a.sent();
                        return [4 /*yield*/, page.waitForTimeout(delay)];
                    case 4:
                        _a.sent();
                        currentScroll += 1;
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
        console.log('Scanning ', pageURL, currentDepth);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var crawlResults, page, timeout, browserErr_1, instrumentationRecords, requestsForPage, takeScreenshotError_1, err_2;
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
                        //@ts-ignore
                        page.on("crash", function (error) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                reject(error);
                                return [2 /*return*/];
                            });
                        }); });
                        if (page) {
                            adblocker_playwright_1.PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch).then(function (blocker) {
                                blocker.enableBlockingInPage(page);
                            });
                        }
                        timeout = setTimeout(function () {
                            console.log('EXECUTE TIMEOUT');
                            resolve(crawlResults);
                        }, (TIME_TO_WAIT * 5) * 1000);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 23, , 24]);
                        this.hasVideo = false;
                        return [4 /*yield*/, page.goto(pageURL, {
                                waitUntil: 'load'
                            })];
                    case 6:
                        _a.sent();
                        console.log("loading");
                        return [4 /*yield*/, page.waitForTimeout(TIME_TO_WAIT * 1000)];
                    case 7:
                        _a.sent();
                        if (!this.currentJob) return [3 /*break*/, 11];
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, , 10, 11]);
                        return [4 /*yield*/, this.handleSubURLScan(page, this.currentJob)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10: return [7 /*endfinally*/];
                    case 11: return [4 /*yield*/, this.collectInstrumentationRecordsFromPage(page)];
                    case 12:
                        instrumentationRecords = _a.sent();
                        clearTimeout(timeout);
                        if (!this.alwaysScreenshot) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.takeScreenshot(page)];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14:
                        if (!instrumentationRecords.altered) return [3 /*break*/, 21];
                        console.log('*'.repeat(10) + " Found a WebAssembly module! " + '*'.repeat(10));
                        requestsForPage = this.capturedRequests.get(pageURL);
                        crawlResults = {
                            containsWebAssembly: true,
                            pageFound: pageURL,
                            domain: this.domain,
                            capturedRequests: requestsForPage,
                            intrumentationRecords: instrumentationRecords
                        };
                        this.containsWebAssembly = true;
                        this.pagesWithWebAssembly.add(pageURL);
                        _a.label = 15;
                    case 15:
                        _a.trys.push([15, 20, , 21]);
                        if (!!this.alwaysScreenshot) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.takeScreenshot(page)];
                    case 16:
                        _a.sent();
                        _a.label = 17;
                    case 17:
                        if (!!this.insertedURLs.has(pageURL)) return [3 /*break*/, 19];
                        return [4 /*yield*/, this.insertInstantiateIntoDatabase("" + pageURL, this.domain, instrumentationRecords, currentJob.parent)];
                    case 18:
                        _a.sent();
                        _a.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        takeScreenshotError_1 = _a.sent();
                        console.log(takeScreenshotError_1);
                        return [3 /*break*/, 21];
                    case 21: return [4 /*yield*/, this.closePage(page)];
                    case 22:
                        _a.sent();
                        return [3 /*break*/, 24];
                    case 23:
                        err_2 = _a.sent();
                        clearTimeout(timeout);
                        reject(err_2);
                        return [2 /*return*/];
                    case 24:
                        resolve(crawlResults);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Crawler.prototype.closePage = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var closeTimeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.closeBrowser()];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, this.startBrowser()];
                                    case 2:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 2 * 1000);
                        return page.close()
                            .then(function () {
                            clearTimeout(closeTimeout);
                            resolve();
                        });
                    })];
            });
        });
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
                                waitUntil: 'load'
                            })];
                    case 2:
                        _a.sent();
                        // await this.scrollToBottom(page);
                        return [4 /*yield*/, page.waitForTimeout(TIME_TO_WAIT * 1000)];
                    case 3:
                        // await this.scrollToBottom(page);
                        _a.sent();
                        // await this.scrollToTop(page);
                        return [4 /*yield*/, this.takeScreenshot(page)];
                    case 4:
                        // await this.scrollToTop(page);
                        _a.sent();
                        return [4 /*yield*/, this.closePage(page)];
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
    Crawler.prototype.setAlwaysScreenshot = function () {
        this.alwaysScreenshot = true;
    };
    Crawler.prototype.screenshotPagesWithWebAssemblyDisabled = function (browser) {
        return __awaiter(this, void 0, void 0, function () {
            var pagesToScreenshot, pagesToScreenshot_1, pagesToScreenshot_1_1, url, job, screenshotOnlyError_1, e_7_1;
            var e_7, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setLaunchOptions(browser, true);
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
                        job = new Queue_1.QueueJob(url, this.domain, 0);
                        this.currentJob = job;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.screenshotPageOnly(url)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        screenshotOnlyError_1 = _b.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        pagesToScreenshot_1_1 = pagesToScreenshot_1.next();
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_7_1 = _b.sent();
                        e_7 = { error: e_7_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (pagesToScreenshot_1_1 && !pagesToScreenshot_1_1.done && (_a = pagesToScreenshot_1.return)) _a.call(pagesToScreenshot_1);
                        }
                        finally { if (e_7) throw e_7.error; }
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
            var closeError_1, _a, _b, launchError_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(this.browser != null)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.browser.close()];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        closeError_1 = _c.sent();
                        console.error("Close error while starting, Couldn't close browser", closeError_1);
                        return [3 /*break*/, 4];
                    case 4:
                        _c.trys.push([4, 9, , 10]);
                        if (!this.useFirefox) return [3 /*break*/, 6];
                        _a = this;
                        return [4 /*yield*/, firefox.launchPersistentContext(this.userDataDir, {
                                // userPrefs: !this.WebAssemblyEnabled  ?  {
                                //     'javascript.options.wasm': 'false'
                                // } : undefined,
                                // devtools: true,
                                // dumpio: false,//!PROD,
                                headless: HEADLESS_BROWSER
                                //viewport: { width: 1280, height: 720 }
                            })];
                    case 5:
                        _a.browser = _c.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        _b = this;
                        return [4 /*yield*/, chromium.launchPersistentContext(this.userDataDir, {
                                // userDataDir: ,
                                args: !this.WebAssemblyEnabled ? ['--js-flags=--noexpose_wasm'] : undefined,
                                // args: ['--disable-setuid-sandbox', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--js-flags=--dump-wasm-module-path=${MODULE_DUMP_PATH}`],
                                // ignoreDefaultArgs: ['--disable-extensions'],
                                // devtools: true,
                                // dumpio: false,//!PROD,
                                headless: HEADLESS_BROWSER
                                //viewport: null
                            })];
                    case 7:
                        _b.browser = _c.sent();
                        _c.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        launchError_1 = _c.sent();
                        console.error('Launch Error', launchError_1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
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
                        this.browser = null;
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