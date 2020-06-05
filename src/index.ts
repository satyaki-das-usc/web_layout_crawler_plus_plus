import {MySQLConnector} from './MySQLConnector';
import {Crawler} from './WebCrawler';
import uuidv1 from 'uuidv1';
const userDataDir = uuidv1();
const argv = require('yargs')
    .option('url', {
        alias: 'u',
        type: 'string',
        description: 'URL to scan',
        demandOption: true //Disable if implementing getNextSite() function
    })
    .argv;
const PROD = process.env.NODE_ENV === 'production' ? true : false;
const URL_TO_SCAN = process.env.URL_TO_SCAN;

//Not implemented in DB, Can be replaced manually
async function getNextSite(db: MySQLConnector) {
    const sqlString = `CALL getNextSite();`;
    try {
        const siteResult = await db.query(sqlString, []);

        return siteResult[1][0].Domain; // Indexes caused by stored procedure rows
    } catch (e){
        console.error(e);
        return null;
    }
}

async function waitFor(seconds: number){
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, seconds)
    })
}
async function main() {
    const randomNumber = Math.floor(Math.random() * 10);
    await waitFor(randomNumber * 1000)
    const db = new MySQLConnector();
    if(argv.url != null || URL_TO_SCAN != null){
        const urlToScan:string = URL_TO_SCAN ?? argv.url ?? ''; 
        if(urlToScan !== ''){
            const db = new MySQLConnector();
            const crawler = new Crawler(db, urlToScan);
            for(const browser of ['chrome','firefox']){
                console.log(`Scanning with ${browser}: WebAssembly Enabled`)
                await crawler.scanPages(browser);
                console.log(`Scanning with ${browser}: WebAssembly Disabled`)
                await crawler.screenshotPagesWithWebAssemblyDisabled(browser);
            }
            db.close()
        }
    } 
    db.close()
}
main();



