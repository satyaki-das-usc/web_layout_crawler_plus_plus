import crypto from 'crypto';
import fs from 'fs';
import util from 'util';

export function makeFileHash(filename:string , algorithm = 'sha256'):Promise<string> {
    //obtained from https://gist.github.com/GuillermoPena/9233069
    return new Promise((resolve, reject) => {
      // Algorithm depends on availability of OpenSSL on platform
      // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
      let shasum = crypto.createHash(algorithm);
      try {
        // @ts-ignore
        let s = fs.ReadStream(filename)
        s.on('data', function (data: any) {
          shasum.update(data)
        })
        // making digest
        s.on('end', function () {
          const hash = shasum.digest('hex')
          return resolve(hash);
        })
      } catch (error) {
        return reject('calc fail');
      }
    });
  }

export function pr(obj:any ) {
    console.log(util.inspect(obj, false, null, true /* enable colors */ ))
}

module.exports.makeFileHash = makeFileHash;
module.exports.pr = pr;

