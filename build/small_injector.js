//Data store for call logging
self.WebAssemblyCallsFound = {
    altered: false,
    WasmFiles: {},
    addWasmFileReference: function (wasmFileHashString) {
        if (this.WasmFiles[wasmFileHashString] != null) {
            return;
        }
        this.WasmFiles[wasmFileHashString] =  {
            instantiate: [],
            instantiateStreaming: [],
            exportCalls: {},
            importCalls: {},
            addExport: function (name, stack) {
                if (!this.exportCalls[name]) {
                    this.exportCalls[name] = [];
                }
                if (this.exportCalls[name].length > 3) {
                    return;
                }
                this.exportCalls[name].push(stack);
            },
            addImport: function (name, stack) {
                if (!this.importCalls[name]) {
                    this.importCalls[name] = [];
                }
                if (this.importCalls[name].length > 3) {
                    return;
                }
                this.importCalls[name].push(stack);
            },
            addInstantiate: function (stack) {
                // if (this.instantiate.length > 3) {
                //     return;
                // }
                this.instantiate.push(stack);
            },
            addInstantiateStreaming: function (stack) {
                // if (this.instantiateStreaming.length > 3) {
                //     return;
                // }
                this.instantiateStreaming.push(stack);
            }
        }
    }
}

function __arrayBufferToString(buffer){ // Convert an ArrayBuffer to an UTF-8 String

    var bufView = new Uint8Array(buffer);
    var length = bufView.length;
    var result = '';
    var addition = Math.pow(2,8)-1;

    for(var i = 0;i<length;i+=addition){
        if(i + addition > length){
            addition = length - i;
        }
        result += String.fromCharCode.apply(null, bufView.subarray(i,i+addition));
    }
    return result;
}

/* Replacing WebAssembly methods with instrumented versions */
var __ogWaI = WebAssembly.instantiate;
var __ogWaIS = WebAssembly.instantiateStreaming;
WebAssembly.instantiate = function (arrayBuffer, imp) {
    const newImports = imp//{};
    self.WebAssemblyCallsFound.altered = true;
    const stackLocation = new Error().stack;
    let itemToDigestForHash;
    let promiseToWait;
    if (arrayBuffer instanceof WebAssembly.Module) {
        //buff is a Module, so cannot use Wabt or generate hash string
        const encoder = new TextEncoder();
        itemToDigestForHash = encoder.encode(arrayBuffer.toString());
        promiseToWait = () => Promise.resolve();
    } else {
        if(self.saveWasmBuffer){
            var bufstring = __arrayBufferToString(arrayBuffer);
            promiseToWait = () => self.saveWasmBuffer(bufstring);
        } else {
            promiseToWait = () => Promise.resolve();
        }
        itemToDigestForHash = arrayBuffer;
    }
    //Get the hash of the Wasm file for logging
    return promiseToWait()
    .then(crypto.subtle.digest('SHA-256', itemToDigestForHash))
    .then(wasmHash => {
            //Get the hash as a hex string
            const wasmHashString = Array.from(new Uint8Array(wasmHash)).map(b => b.toString(16).padStart(2, '0')).join('');
            //Record the wasmHash and the instantiate call
            self.WebAssemblyCallsFound.addWasmFileReference(wasmHashString);
            self.WebAssemblyCallsFound.WasmFiles[wasmHashString].addInstantiate(stackLocation);
            //Instrument the Imported JavaScript functions
            /*for (const key in imp) {
                newImports[key] = {}
                const keyObject = imp[key];
                if (keyObject != null && keyObject.toString() === "[object Math]") {
                    newImports[key] = keyObject;
                }
                for (const name in keyObject) {
                    if (typeof (keyObject[name]) === 'function') {
                        const originalImportFunction = keyObject[name];
                        newImports[key][name] = (function () {
                            const na = name;
                            const wasmHashStr = wasmHashString;
                            return function () {
                                let frames = new Error().stack;
                                self.WebAssemblyCallsFound.WasmFiles[wasmHashStr].addImport(na, frames)
                                return originalImportFunction.apply(null, arguments);
                            };
                        })()
                    } else {
                        newImports[key][name] = keyObject[name];
                    }
                }
            }*/
            //Call the original .instantiate function to get the Result Object 
            return __ogWaI(arrayBuffer, newImports)
                .then(function (re) {
                    return re;
                    //Depending on whether * buff * param was bytes or a Module,
                    //return of .instantiate can be either the Instance or a ResultObject
                    //containing a Module and Instance
                    if (re.module === undefined) {
                        //re is Instance only
                        //Make new instance object containing instrumented versions of
                        //export calls
                        const newInstance = {
                            exports: {}
                        };
                        //Instrument Export functions
                        const exportNames = Object.keys(re.exports);
                        for (const name of exportNames) {
                            const ogFunction = re.exports[name];
                            if (typeof (re.exports[name]) == 'function') {
                                //Define a closure function to record which file and function was called
                                newInstance.exports[name] = (function () {
                                    const na = name;
                                    const wasmHashStr = wasmHashString;
                                    const closureReturn = function () {
                                        let frames = new Error().stack;
                                        self.WebAssemblyCallsFound.WasmFiles[wasmHashStr].addExport(na, frames)
                                        return ogFunction.apply(this, arguments);
                                    };
                                    Object.defineProperty(closureReturn, "length", {
                                        value: ogFunction.length
                                    })
                                    return closureReturn;
                                })()
                            } else {
                                newInstance.exports[name] = re.exports[name];
                            }
                        }
                        Object.setPrototypeOf(newInstance, Object.getPrototypeOf(re))
                        return newInstance;
                    } else {
                        //re is ResultObject
                        //Make new ResultObject containing modified Instance objects
                        const newResultObject = {
                            module: re.module,
                            instance: null
                        };

                        //Make new instance object containing instrumented versions of
                        //export calls
                        const newInstance = {
                            exports: {}
                        };

                        //Instrument export functions
                        const exportNames = Object.keys(re.instance.exports);
                        for (const name of exportNames) {
                            if (typeof (re.instance.exports[name]) == 'function') {

                                const ogFunction = re.instance.exports[name];
                                //Define a closure function to record which file and function was called
                                newInstance.exports[name] = (function () {
                                    const na = name;
                                    const wasmHashStr = wasmHashString;


                                    const closureReturn = function () {
                                        let frames = new Error().stack;
                                        self.WebAssemblyCallsFound.WasmFiles[wasmHashStr].addExport(na, frames)

                                        return ogFunction.apply(this, arguments);
                                    };
                                    Object.defineProperty(closureReturn, "length", {
                                        value: ogFunction.length
                                    })

                                    return closureReturn;
                                })()

                            } else {
                                newInstance.exports[name] = re.instance.exports[name];
                            }
                        }

                        Object.setPrototypeOf(newInstance, WebAssembly.Instance)
                        newResultObject.instance = newInstance;
                        return newResultObject;
                    }
                });
        })

};

WebAssembly.instantiateStreaming = function (source, imp) {
    const stackLocation = new Error().stack;
    // self.WebAssemblyCallsFound.addInstantiateStreaming(stackLocation)
    self.WebAssemblyCallsFound.altered = true;
    const responsePromise = source.then ? source.then(sourceResponse => {
        return sourceResponse
    }) : Promise.resolve(source);
    return responsePromise.then(sourceResponse => {
        return sourceResponse.arrayBuffer()
            .then(arrayBuffer => {
                let promiseToWait;
                if(self.saveWasmBuffer){
                    var bufstring = __arrayBufferToString(arrayBuffer);
                    promiseToWait = () => self.saveWasmBuffer(bufstring);
                } else {
                    promiseToWait = () => Promise.resolve();
                }
                return promiseToWait()
                .then(() => {
                    return crypto.subtle.digest('SHA-256', arrayBuffer)
                    .then(wasmHash => {
                        const wasmHashString = Array.from(new Uint8Array(wasmHash)).map(b => b.toString(16).padStart(2, '0')).join('');
                        self.WebAssemblyCallsFound.addWasmFileReference(wasmHashString);
                        self.WebAssemblyCallsFound.WasmFiles[wasmHashString].addInstantiateStreaming(stackLocation);

                        return WebAssembly.instantiate(arrayBuffer, imp);
                    })
                })

            });
    });

};

console.log('WebAssembly instrumented to record calls!')