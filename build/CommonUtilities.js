"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFirefoxProfileWithWebAssemblyDisabled = exports.makeFirefoxProfileWithWebAssemblyEnabled = exports.makeChromeProfile = exports.pr = exports.makeFileHash = void 0;
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var util_1 = __importDefault(require("util"));
var path_1 = __importDefault(require("path"));
function makeFileHash(filename, algorithm) {
    if (algorithm === void 0) { algorithm = 'sha256'; }
    //obtained from https://gist.github.com/GuillermoPena/9233069
    return new Promise(function (resolve, reject) {
        // Algorithm depends on availability of OpenSSL on platform
        // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
        var shasum = crypto_1.default.createHash(algorithm);
        try {
            // @ts-ignore
            var s = fs_1.default.ReadStream(filename);
            s.on('data', function (data) {
                shasum.update(data);
            });
            // making digest
            s.on('end', function () {
                var hash = shasum.digest('hex');
                return resolve(hash);
            });
        }
        catch (error) {
            return reject('calc fail');
        }
    });
}
exports.makeFileHash = makeFileHash;
function pr(obj) {
    console.log(util_1.default.inspect(obj, false, null, true /* enable colors */));
}
exports.pr = pr;
function makeChromeProfile() {
    var userDataDir = path_1.default.resolve(__dirname, '../ChromeProfile');
    if (!fs_1.default.existsSync(userDataDir)) {
        fs_1.default.mkdirSync(userDataDir, { recursive: true });
    }
    return userDataDir;
}
exports.makeChromeProfile = makeChromeProfile;
function makeFirefoxProfileWithWebAssemblyEnabled() {
    var userDataDir = path_1.default.resolve(__dirname, '../FirefoxProfile', 'WebAssemblyEnabled');
    if (!fs_1.default.existsSync(userDataDir)) {
        fs_1.default.mkdirSync(userDataDir, { recursive: true });
    }
    return userDataDir;
}
exports.makeFirefoxProfileWithWebAssemblyEnabled = makeFirefoxProfileWithWebAssemblyEnabled;
function makeFirefoxProfileWithWebAssemblyDisabled() {
    var userDataDir = path_1.default.resolve(__dirname, '../FirefoxProfile', 'WebAssemblyDisabled');
    if (!fs_1.default.existsSync(userDataDir)) {
        fs_1.default.mkdirSync(userDataDir, { recursive: true });
    }
    var prefs = "user_pref(\"javascript.options.wasm\", false);";
    fs_1.default.writeFileSync(path_1.default.join(userDataDir, "./user.js"), prefs);
    return userDataDir;
}
exports.makeFirefoxProfileWithWebAssemblyDisabled = makeFirefoxProfileWithWebAssemblyDisabled;
module.exports.makeFileHash = makeFileHash;
module.exports.pr = pr;
//# sourceMappingURL=CommonUtilities.js.map