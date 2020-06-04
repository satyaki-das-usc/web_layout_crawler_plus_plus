"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pr = exports.makeFileHash = void 0;
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var util_1 = __importDefault(require("util"));
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
module.exports.makeFileHash = makeFileHash;
module.exports.pr = pr;
//# sourceMappingURL=CommonUtilities.js.map