import {MySQLConnector} from './MySQLConnector';
import {Crawler} from './WebCrawler';
import uuidv1 from 'uuidv1';
import fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);
const appendFile = util.promisify(fs.appendFile);

const argv = require('yargs')
    .option('url', {
        alias: 'u',
        type: 'string',
        description: 'URL to scan',
        // demandOption: true 
    })
    .option('file', {
        alias: 'f',
        type: 'string',
        description: 'File path of text file (CSV) containing list of websites to scan',
        // demandOption: true 
    })
    .option('full', {
        alias: 'l',
        type: 'boolean',
        default: false,
        description: 'Set true to download all of the files on a web page when visited with the crawler',
        // demandOption: true 
    })
    .argv;
const PROD = process.env.NODE_ENV === 'production' ? true : false;
const URL_TO_SCAN = process.env.URL_TO_SCAN;

async function readUrlList(filepath: string) {
    const fileContents = await readFile(filepath, {encoding: 'utf8'}); 
    const sitesList = fileContents.split('\n')
                        .map(line => line.trim());
    return sitesList;
}

async function waitFor(seconds: number){
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, seconds)
    });
}

async function crawlSite(urlToScan: string, database: MySQLConnector){
    let pageURL = urlToScan;
    if (!pageURL.includes('http://') && !pageURL.includes('https://')) {
        pageURL = "http://" + pageURL;
    }
    for(const browser of ['chrome','firefox']){
        const crawler = new Crawler(database, pageURL, argv);
        console.log(`Scanning with ${browser}: WebAssembly Enabled`)
        await crawler.scanPages(browser);
        crawler.setAlwaysScreenshot();
        console.log(`Scanning with ${browser}: WebAssembly Disabled`)
        await crawler.screenshotPagesWithWebAssemblyDisabled(browser);
    }
}

async function main() {
    const doneContents = await readFile('done.txt', {encoding: 'utf8'}); 
    let doneList = doneContents.split('\n')
                        .map(line => line.trim());
    const ignoreContents = await readFile('ignorelist.txt', {encoding: 'utf8'}); 
    let ignoreList = ignoreContents.split('\n')
                        .map(line => line.trim());
    const db = new MySQLConnector();
    if(argv.file != null ){
        const sitesToScan = await readUrlList(argv.file);
        for(const urlToScan of sitesToScan){
            if(doneList.indexOf(urlToScan) > -1) {
                console.log(`Already crawled ${urlToScan}. Skipping.`);
                continue;
            }
            if(ignoreList.indexOf(urlToScan) > -1) {
                console.log(`Ignoring ${urlToScan}.`);
                continue;
            }
            appendFile('attempt.txt', `\n${urlToScan}`);
            console.log(`${urlToScan}`);
            await crawlSite(urlToScan, db);
            let length = doneList.push(urlToScan);
            appendFile('done.txt', `\n${urlToScan}`);
        }
        db.close();
    }
    else if(argv.url != null || URL_TO_SCAN != null){
        const urlToScan:string = URL_TO_SCAN ?? argv.url ?? ''; 
        if(urlToScan !== ''){
            await crawlSite(urlToScan, db);
            db.close()
        }
    } 
}
main();



