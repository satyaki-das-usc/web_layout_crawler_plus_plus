import crypto from 'crypto';
import fs from 'fs';
import util from 'util';
import path from 'path';

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

export function makeChromeProfile(){
  const userDataDir = path.resolve(__dirname, '../ChromeProfile');
  if(!fs.existsSync(userDataDir)){
		fs.mkdirSync(userDataDir, { recursive: true });
	}
  return userDataDir
}

export function makeFirefoxProfileWithWebAssemblyEnabled(){
  const userDataDir = path.resolve(__dirname, '../FirefoxProfile', 'WebAssemblyEnabled');
  if(!fs.existsSync(userDataDir)){
		fs.mkdirSync(userDataDir, { recursive: true });
	}
  return userDataDir
}

export function makeFirefoxProfileWithWebAssemblyDisabled(){
  const userDataDir = path.resolve(__dirname, '../FirefoxProfile', 'WebAssemblyDisabled');

	if(!fs.existsSync(userDataDir)){
		fs.mkdirSync(userDataDir, { recursive: true });
	}

	let prefs = `user_pref("javascript.options.wasm", false);`;

  fs.writeFileSync(path.join(userDataDir, "./user.js"), prefs);
  return userDataDir;
}



module.exports.makeFileHash = makeFileHash;
module.exports.pr = pr;

