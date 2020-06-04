import {
    readdir as _readdir,
    mkdir as _mkdir,
    unlink as _unlink,
    readFileSync,
    stat as _stat,
    rmdir as _rmdir
} from 'fs';
const os = require("os");
import mv from 'mv';
import {makeChromeProfile, makeFirefoxProfileWithWebAssemblyDisabled, makeFirefoxProfileWithWebAssemblyEnabled} from './CommonUtilities';
import {
    promisify
} from 'util';
const readdir = promisify(_readdir);
const mkdir = promisify(_mkdir);
const stat = promisify(_stat);
const unlink = promisify(_unlink);
const rmdir = promisify(_rmdir);
const {
    URL
} = require('url');

import fse from 'fs-extra'; // v 5.0.0
import sanitize from "sanitize-filename";
import {MySQLConnector} from './MySQLConnector';
const PROD = process.env.NODE_ENV === 'production' ? true : false;
import playwright, { Browser, JSHandle, Page, BrowserType, LaunchOptions, BrowserContext } from 'playwright';
const { chromium, firefox } = playwright;

import {
    join,
    resolve as _resolve,
    basename,
    extname,
    dirname,
} from 'path';
import {Queue, QueueJob} from './Queue';
import uuidv1 from 'uuidv1';
import {
    crawler_js_dump_path,
    crawler_screenshot_path,
    max_crawl_depth_level,
    time_to_wait_on_page
} from './config.json';
enum SubURLScanMode {
    FULL = 'full',
    RANDOM = 'random',
    FIRST_N_PERCENT = 'first_n_percent'
}
const SUBPAGE_PERCENTAGE_TO_VISIT: number = (process.env.SUBPAGE_PERCENTAGE_TO_VISIT != null) ? parseFloat(process.env.SUBPAGE_PERCENTAGE_TO_VISIT) : 0.25;
const MAX_CRAWL_DEPTH_LEVEL = (process.env.MAX__CRAWL_DEPTH_LEVEL != null) ? parseInt(process.env.MAX__CRAWL_DEPTH_LEVEL) : max_crawl_depth_level;
const HEADLESS_BROWSER = false;
const TIME_TO_WAIT: number = (process.env.TIME_TO_WAIT != null) ? parseFloat(process.env.TIME_TO_WAIT) : time_to_wait_on_page;
let SUBURL_SCAN_MODE: SubURLScanMode;
if(process.env.SUBURL_SCAN_MODE == null || process.env.SUBURL_SCAN_MODE.toLowerCase() == 'full'){
    SUBURL_SCAN_MODE = SubURLScanMode.FULL;
}
else if(process.env.SUBURL_SCAN_MODE.toLowerCase() == 'random'){
    SUBURL_SCAN_MODE = SubURLScanMode.RANDOM;
}
else if(process.env.SUBURL_SCAN_MODE.toLowerCase() == 'first_n_percent'){
    SUBURL_SCAN_MODE = SubURLScanMode.FIRST_N_PERCENT;
} else {
    SUBURL_SCAN_MODE = SubURLScanMode.FULL;
}

const JS_OUTPUT_PATH = process.env.JS_OUTPUT_PATH || join(__dirname, crawler_js_dump_path);
const SCREENSHOT_OUTPUT_PATH = process.env.SCREENSHOT_OUTPUT_PATH || join(__dirname, crawler_screenshot_path);
const preloadFile = readFileSync(join(__dirname, './small_injector.js'), 'utf8');
declare global {
    interface Window {
        WebAssemblyCallsFound: WebAssemblyInstrumentation;
    }
}

type Nullable < T > = T | null;

declare interface WasmFile {
    instantiate: string[],
    instantiateStreaming: string[],
    exportCalls: any,
    importCalls: any,
    addExport: Function,
    addImport: Function,
    addInstantiate: Function,
    addInstantiateStreaming: Function
}

declare interface CrawlResults {
    containsWebAssembly: boolean,
    pageFound?: string,
    domain?: string,
    capturedRequests?: string[],
    intrumentationRecords?: InstrumentationRecords
}

declare interface WebAssemblyInstrumentation {
        altered: boolean,
        WasmFiles: any,
        addWasmFileReference: Function
}

declare interface DBInstrumentationRecord {
    altered:boolean,
    WasmFiles: any
}
declare interface InstrumentationRecords {
    window: DBInstrumentationRecord | null,
    workers: DBInstrumentationRecord[],
    altered: boolean
}

declare interface WebSocketLogs {
    sent: string[];
    received: string[];
}

export class Crawler {
    capturedRequests: Map<string,string[]>;
    capturedWebSocketRequests: Map<string,WebSocketLogs>;
    browser: BrowserContext | null;
    database: MySQLConnector;
    pagesToVisit = new Queue<QueueJob> ();
    userDataDir: string = uuidv1();
    launchOptions: any;
    domain: string;
    finalDomainOutputPath: string = '';
    screenshotOutputPath: string = '';
    webAssemblyWorkers: JSHandle <WebAssemblyInstrumentation>[] = [];
    scannedSubPages: Set<string>;
    currentJob?: QueueJob;
    urlsSeen: Set<string> = new Set();
    containsWebAssembly: boolean = false;
    WebAssemblyEnabled: boolean = true;
    useFirefox = false;
    pagesWithWebAssembly: Set<string> = new Set()

    constructor(databaseConnector: MySQLConnector, domain: string) {
        this.capturedRequests = new Map();
        this.capturedWebSocketRequests = new Map();
        this.browser = null;
        this.database = databaseConnector;
        this.domain = domain;
        this.scannedSubPages = new Set<string>();
    }

    setLaunchOptions(browser: string,disableWebAssembly=false){
        const useFirefox= browser === 'firefox';
        this.WebAssemblyEnabled = !disableWebAssembly;
        const domainName = this.cleanDomain(this.domain);
        const WebAssemblyEnabledSubDirectoryName = this.WebAssemblyEnabled ? 'WebAssembly_Enabled' : 'WebAssembly_Disabled';
        this.useFirefox = useFirefox;
        const UsingFirefoxSubDirectoryName = this.useFirefox ? 'Firefox' : 'Chrome';
        const jsOutputDir = _resolve(JS_OUTPUT_PATH, domainName,UsingFirefoxSubDirectoryName,WebAssemblyEnabledSubDirectoryName);
        this.finalDomainOutputPath = jsOutputDir;
        const screenshotDir = _resolve(SCREENSHOT_OUTPUT_PATH, domainName,UsingFirefoxSubDirectoryName,WebAssemblyEnabledSubDirectoryName);
        this.screenshotOutputPath = screenshotDir;

        if(useFirefox){
            if(!this.WebAssemblyEnabled){
                this.userDataDir = makeFirefoxProfileWithWebAssemblyDisabled();
            }
            else {
                this.userDataDir = makeFirefoxProfileWithWebAssemblyEnabled();
            }
        } else {
            this.userDataDir = makeChromeProfile();
        }
    }

    async getFiles(dir: string): Promise<string[]> {
        const subdirs = await readdir(dir);
        const files = await Promise.all(
            subdirs.map(async (subdir) => {
            const res = _resolve(dir, subdir);
            return (await stat(res)).isDirectory() ? this.getFiles(res) : [res];
            })
        );
        return files.reduce((a, f) => a.concat(f), []);
    }

    

    async cleanDomainDir() {
        try {
            await rmdir(this.finalDomainOutputPath, {recursive: true})    
            await rmdir(this.screenshotOutputPath, {recursive: true})    
        } catch (e) {
            console.log(`Error deleting ${this.domain} domain folder`, e);
        }
    }

    moveFile(currentPath: string, newPath: string) {
        return new Promise((resolve, reject) => {
            mv(currentPath, newPath, {
                clobber: true
            }, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        })
    }

    cleanDomain(domain:string): string{
        const domainName = domain.replace(/\//g, '__').replace(/:/g, '').replace(/\./g, '___').slice(0, 50);
        return domainName;
    }

    async insertInstantiateIntoDatabase(currentURL:string, domain: string, stackJson: InstrumentationRecords, parent?:string) {
        let sqlParams = [];
        let capturedRequests = JSON.stringify(this.capturedRequests.get(currentURL));
        
        const baseQuery = `
            INSERT INTO found_page
            (URL, Domain, StackTraceJSON, CapturedRequests,ParentPage) 
            VALUES(?,?,?,?,?);
        `

        sqlParams.push(currentURL, domain, JSON.stringify(stackJson), capturedRequests,
             parent ?? null);
        try {
            await this.database.query(baseQuery, sqlParams);
        } catch (sqlErr) {
            console.error('SQL Error', sqlErr)
        }

        return;
    }

    exit(){
        this.database.close();
        process.exit(0);
    }

    sanitizeURLForFileSystem(url: string, outputPath: string){
        const responseURLParsed = new URL(url);
        let responsePathname = responseURLParsed.pathname;
        const responseBasename = basename(responsePathname);
        let responsePath = responsePathname.replace(responseBasename, '');
        const safeBaseName = sanitize(responseBasename).substring(0, 50);
        const safeResponseURL = `${responsePath}/${safeBaseName}`;
        let filePath = _resolve(`${outputPath}${safeResponseURL}`);
        if (extname(responsePathname).trim() === '') {
            filePath = `${filePath}/index.html`;
        }
        return filePath;
    }

    /**
     * Gets a new page and adds instrumentation code and request capturing
     */
    async getPage() {
            let page: Page|null = null;
            const browser = await this.getBrowser()
            try{
                page = await browser.newPage();
                if(this.WebAssemblyEnabled){
                    await page.addInitScript(preloadFile)
                }

            } catch(newPageError){
                console.error('New Page Error:', newPageError);
                throw newPageError
            }

            if(page == null){
                throw new Error('Cannot open newpage');
            }
            // await page.setViewportSize({
            //     width: 600,//1920,
            //     height: 800//1080
            // });
            await page.setViewportSize({
                width: 640,
                height: 480,
              });
            
              if(this.WebAssemblyEnabled){
                page.on('worker', async worker => {
                    // console.log('Worker created: ' + worker.url())
                    try {
                        await worker.evaluate(preloadFile)
                        await worker.evaluate(() => {
                            setTimeout(() => {
                                console.log(self);
                            }, 1000)
                        })
                        const currentWorkerWebAssembly: JSHandle<WebAssemblyInstrumentation> = await worker.evaluateHandle(() => {
                            return self.WebAssemblyCallsFound;
                        })
                        this.webAssemblyWorkers.push(currentWorkerWebAssembly);
                    } catch (err) {
                        console.error('Worker Eval', err)
                    }
                });
              }

            let currentBase64Index = 0;
            page.on('response', async (response) => {
                const responseStatus = response.status();
                if (responseStatus === 200) {
                    const responseURL = response.url();
                    const currentURL = this.currentJob?.url;
                    if(currentURL != null){
                        if (!this.capturedRequests.get(currentURL)) {
                            this.capturedRequests.set(currentURL,[]);
                        }
                        this.capturedRequests.get(currentURL)?.push(responseURL);
                    }
                    let filePath;
                    if(responseURL.includes('data:')){
                        //Write out to file
                        const currentURL = this.currentJob?.url ?? 'Base64Encoded';
                        filePath = this.sanitizeURLForFileSystem(currentURL, this.finalDomainOutputPath); 
                        filePath = dirname(filePath);
                        filePath = _resolve(filePath, `Base64_Encoded_${currentBase64Index++}`);

                    } else {
                        filePath = this.sanitizeURLForFileSystem(responseURL, this.finalDomainOutputPath); 
                    }
                    try{
                        const responseBody = await response.body()
                        await fse.outputFile(filePath,responseBody);
                    }catch(saveResponseError){
                        // console.error(`Save response error for ${responseURL}`);
                    }
                   
                }
            });

            // page.setDefaultNavigationTimeout((TIME_TO_WAIT * 2) * 1000)
            return page;
    }

    async makeOutputDirectories(){
        //Web file output
        try{
            await mkdir(this.finalDomainOutputPath)
        } catch(jsOutputMkdirError){
        }

        try{
            await mkdir(this.screenshotOutputPath)
        } catch(screenshotOutputMkdirError){
        }
    }

    async scanPages(browser: string) {
        this.setLaunchOptions(browser, false);
        await this.setup();

        if(this.pagesWithWebAssembly.size > 0){
            for(const url of this.pagesWithWebAssembly){
                const job = new QueueJob(url, this.domain, 0);
                this.capturedRequests.clear();
                this.capturedWebSocketRequests.clear();
                try{
                    const scanResults = await (await this.scanPage(job));
                } catch(e){
                    continue;
                }

            }
        } else {
            const firstJob = new QueueJob(this.domain, this.domain, 0);
            this.pagesToVisit.enqueue(firstJob);
    
            while (!this.pagesToVisit.isEmpty()){
                const currentJob = this.pagesToVisit.dequeue();
                if (currentJob != null) {
                    this.currentJob = currentJob
                    const currentURL = currentJob.url;
                    if(this.scannedSubPages.has(currentURL)){
                        continue;
                    } else {
                        this.scannedSubPages.add(currentURL);
                    }
                    this.capturedRequests.clear();
                    this.capturedWebSocketRequests.clear();
                    try {
                        const scanResults = await (await this.scanPage(currentJob));
                        this.containsWebAssembly = this.containsWebAssembly || scanResults.containsWebAssembly;
                        if(scanResults.containsWebAssembly){
                            this.pagesWithWebAssembly.add(currentURL);
                        }
                    } catch (e) {
                        console.error('Scan Pages:', e);
                        await this.wait(5);
                        continue;
                    }
    
                    //check how many open pages
                    try{
                        const browserPagesOpen = this.browser?.pages();
                        if(browserPagesOpen != null){
                            if(browserPagesOpen.length > 3){
                                for(const page of browserPagesOpen){
                                    await page.close();
                                }
                            }
                        }
                    } catch(browserPagesCloseErr){
                        console.error('Browser page close error', browserPagesCloseErr);
                    }
    
                }
            }
        }


        if(!this.containsWebAssembly){
            await this.cleanDomainDir();
        }
        await this.teardown();
    }

    async takeScreenshot(page: Page){
        const screenshotBuffer = await page.screenshot({
            type: 'png',
            fullPage: true
        });
        if(this.currentJob?.url){
            const screenshotPath = this.sanitizeURLForFileSystem(this.currentJob?.url, this.screenshotOutputPath) + '.png';
            await fse.outputFile(screenshotPath, screenshotBuffer);
        }
    }
    
    isValidURL(url: string, depth: number): boolean {
        //check url formatting
        if (depth < MAX_CRAWL_DEPTH_LEVEL) {
            if (url != null && 
                typeof (url) === 'string' &&
                url != '' &&
                url != '#' &&
                    !url.includes('javascript:') &&
                    !url.includes('mailto:') &&
                    !url.includes('blob:') &&
                    !url.includes('tel:')
            ){
                //If not scanned url before
                if(this.urlsSeen.has(url)){
                    return false
                } else {
                        this.urlsSeen.add(url);
                        return true                
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async handleSubURLScan(page: Page,  currentJob: QueueJob){
        if (page != null && page.$ != undefined) {
            const {url,depth} = currentJob; 
            let bodyElem = await page.$('body');
            if (bodyElem != null && bodyElem.$$eval != undefined) {
                let urls: string[] = await bodyElem.$$eval('a', (nodes: any) => nodes.map((n: any) => n.href));

                if(SUBURL_SCAN_MODE == SubURLScanMode.FULL){
                    const upperLimit = urls.length;
                    for (let i = 0; i < upperLimit; i++) {
                        const subURL = urls[i];
                        if (this.isValidURL(subURL, depth)) {
                            const nextJob = new QueueJob(subURL, this.domain, depth + 1, `${url}`)
                            this.pagesToVisit.enqueue(nextJob);
                        }
                    }
                } else if(SUBURL_SCAN_MODE == SubURLScanMode.RANDOM){
                    const subpagesToVisit = Math.floor(urls.length * SUBPAGE_PERCENTAGE_TO_VISIT);
                    const upperLimit =(urls.length < subpagesToVisit ? urls.length : subpagesToVisit);  
                    const min = 0; 
                    const max = urls.length - 1;
                    for (let i = 0; i < upperLimit; i++) {
                        let random = Math.floor(Math.random() * (+max - +min))
                        let randomURL = urls[random];
                        for(let randomAttepts = 0; randomAttepts < 4; randomAttepts++){
                            if(this.urlsSeen.has(randomURL)){
                                random = Math.floor(Math.random() * (+max - +min))
                                randomURL = urls[random];
                            } else {
                                break;
                            }
                        }
                        const subURL = randomURL;
                        if (this.isValidURL(subURL ,depth)) {
                            const nextJob = new QueueJob(subURL, this.domain, depth + 1, `${url}`)
                            this.pagesToVisit.enqueue(nextJob);
                        }
                    }
                } else if(SUBURL_SCAN_MODE == SubURLScanMode.FIRST_N_PERCENT){
                    const subpagesToVisit = Math.floor(urls.length * SUBPAGE_PERCENTAGE_TO_VISIT);
                    const upperLimit =(urls.length < subpagesToVisit ? urls.length : subpagesToVisit);  
                    for (let i = 0; i < upperLimit; i++) {
                        const subURL = urls[i];
                        if (this.isValidURL(subURL ,depth)) {
                            const nextJob = new QueueJob(subURL, this.domain, depth + 1, `${url}`)
                            this.pagesToVisit.enqueue(nextJob);
                        }
                    }
                }
            }
        }
    }

    formatInstrumentationDetailsForDB(instrumentationDetails: WebAssemblyInstrumentation): DBInstrumentationRecord | null {
        
        let dbFormattedRecord: DBInstrumentationRecord | null =null;
        try{
            if(instrumentationDetails != null){
                dbFormattedRecord = { altered : instrumentationDetails.altered, WasmFiles: instrumentationDetails.WasmFiles };

            }
        }catch(formatInstrumentationError){
            console.error('Format instrumentation error', formatInstrumentationError);
        }
        return dbFormattedRecord;
    }

    async collectInstrumentationRecordsFromPage(page: Page){
        let windowWebAssemblyHandle: WebAssemblyInstrumentation| null = null;
        
        //Get window level instrumentation object
        let instrumentationRecords: InstrumentationRecords = {
            window: null,
            workers: [],
            altered: false
        };
        try {
            windowWebAssemblyHandle = await (await page.evaluateHandle(() => window.WebAssemblyCallsFound)).jsonValue() as WebAssemblyInstrumentation;
            if(windowWebAssemblyHandle){
                instrumentationRecords.altered = windowWebAssemblyHandle.altered;
                instrumentationRecords.window = this.formatInstrumentationDetailsForDB(windowWebAssemblyHandle);
            }
        } catch (windowInstrumentHandleError) {
            console.error('Window Instrumentation Handle Error', windowInstrumentHandleError)
        }

        //Get worker level instrumentation objects
        if (this.webAssemblyWorkers.length > 0) {
            for(const webWorkerHandle of this.webAssemblyWorkers){
                try{
                    let workerObject:WebAssemblyInstrumentation = await webWorkerHandle.jsonValue() as WebAssemblyInstrumentation;
                    if(workerObject != undefined){
                        instrumentationRecords.altered  = instrumentationRecords.altered  || workerObject.altered;
                        if(workerObject.altered){
                            const formattedInstrumentation = this.formatInstrumentationDetailsForDB(workerObject);
                            if(formattedInstrumentation != null){
                                instrumentationRecords.workers.push(formattedInstrumentation)
                            }
                        }
                    }
                }
                catch(workerHandlerError){
                    console.error(workerHandlerError)
                }
            }
        }

        return instrumentationRecords
    }

    async scrollToBottom (page: Page) {
        const distance = 100; // should be less than or equal to window.innerHeight
        const delay = 100;
        let currentScroll = 0;
        //  @ts-ignore
        while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
            //  @ts-ignore
            await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
            await page.waitForTimeout(delay);
            currentScroll += 1;
        }
    }

    async scrollToTop (page: Page) {
        const distance = -1 * 100; // should be less than or equal to window.innerHeight
        const delay = 100;
        let currentScroll = 0;
            //  @ts-ignore
        while (await page.evaluate(() => document.scrollingElement.scrollTop !== 0)) {
            //  @ts-ignore
            await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
            await page.waitForTimeout(delay);
            currentScroll += 1;

        }
    }

    scanPage(currentJob: QueueJob): Promise<CrawlResults>{
        let pageURL: string = `${currentJob.url}`;
        const currentDepth: number = currentJob.depth;
        this.webAssemblyWorkers = [];

        if (!pageURL.includes('http://') && !pageURL.includes('https://')) {
            pageURL = "http://" + pageURL;
        }
        console.log('Scanning ', pageURL, currentDepth)

        return new Promise(async (resolve, reject) => {
            let crawlResults: CrawlResults = {containsWebAssembly: false};
            let page: Page;
            let timeout: NodeJS.Timeout;
            try {
                page = await this.getPage();
            } catch (browserErr) {
                reject(browserErr)
                return;
            }
            //@ts-ignore
            page.on("crash", async (error: any) => {
                reject(error)
            });

            timeout = setTimeout(() => {
                console.log('EXECUTE TIMEOUT');
                resolve(crawlResults);
            }, (TIME_TO_WAIT * 5 ) * 1000)
            try {
                await page.goto(pageURL, {
                    waitUntil: 'load'
                });
                // await this.scrollToBottom(page);
                if(this.currentJob){
                    await this.handleSubURLScan(page, this.currentJob)
                }
                await page.waitForTimeout(TIME_TO_WAIT * 1000);
                // await this.scrollToTop(page);
                const instrumentationRecords = await this.collectInstrumentationRecordsFromPage(page);
                if(instrumentationRecords.altered){
                    console.log(`${'*'.repeat(10)} Found a WebAssembly module! ${'*'.repeat(10)}`)
                    const requestsForPage = this.capturedRequests.get(pageURL);
                    crawlResults = {
                        containsWebAssembly: true,
                        pageFound: pageURL,
                        domain: this.domain,
                        capturedRequests: requestsForPage,
                        intrumentationRecords: instrumentationRecords
                    };
                    try{

                        await this.takeScreenshot(page);
                        // await this.insertInstantiateIntoDatabase(`${pageURL}`, this.domain, instrumentationRecords, currentJob.parent);
                    }catch(takeScreenshotError){
                        console.log(takeScreenshotError);
                    }
                }

                await page.close();
            } catch (err) {
                console.error('Navigation Error:', err)
                reject(err)
                return;
            } finally{
                clearTimeout(timeout);
            }
            resolve(crawlResults);
        })
    }


    async screenshotPageOnly(url:string){
        try {
            let page = await this.getPage();
            await page.goto(url, {
                waitUntil: 'load'
            });
            // await this.scrollToBottom(page);
            await page.waitForTimeout(TIME_TO_WAIT * 1000);
            // await this.scrollToTop(page);
            await this.takeScreenshot(page);

            await page.close();

        } catch (browserErr) {
            throw browserErr
        }
    }

    async screenshotPagesWithWebAssemblyDisabled(browser: string){
        this.setLaunchOptions(browser,true);
        await this.startBrowser();
        const pagesToScreenshot: Set<string> = this.pagesWithWebAssembly;
        for(const url of pagesToScreenshot){
            try{
                await this.screenshotPageOnly(url);
            } catch(screenshotOnlyError){
                // console.error(`Screenshot only error for ${url}`, screenshotOnlyError);
            }
        }
        
        this.teardown();
    }

    async getBrowser() {
        if (this.browser == null) {
            await this.startBrowser();
        }
        if (this.browser == null) {
            // throw new Error('Cannot start browser');
            this.exit();
            throw new Error('Cannot start browser');
        }
        return this.browser;
    }

    async startBrowser() {
        try{
            if(this.useFirefox){
                this.browser = await firefox.launchPersistentContext(this.userDataDir,
                    {
                        // userPrefs: !this.WebAssemblyEnabled  ?  {
                        //     'javascript.options.wasm': 'false'
                        // } : undefined,
                        // devtools: true,
                        // dumpio: false,//!PROD,
                        headless: HEADLESS_BROWSER
                    }
                );
    
            } else {
                this.browser = await chromium.launchPersistentContext(this.userDataDir,
                    {
                        // userDataDir: ,
                        args: !this.WebAssemblyEnabled ? [ '--js-flags=--noexpose_wasm'] : undefined,
                          // args: ['--disable-setuid-sandbox', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--js-flags=--dump-wasm-module-path=${MODULE_DUMP_PATH}`],
                        // ignoreDefaultArgs: ['--disable-extensions'],
                        // devtools: true,
                        // dumpio: false,//!PROD,
                        headless: HEADLESS_BROWSER
                    }
                );
            }
        } catch(launchError){
            console.error('Launch Error', launchError);
        }
    }

    async closeBrowser() {
        const browser = await this.getBrowser();
        if(browser != null){
            try{
                await browser.close();
            }
            catch(err){
                this.exit();
            }
        }
    }

    async setup() {
        await this.makeOutputDirectories();
        await this.startBrowser();
    }

    async teardown() {
        await this.closeBrowser();
    }

    wait(seconds: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000)
        })
    }

}