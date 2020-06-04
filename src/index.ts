import {MySQLConnector} from './MySQLConnector';
import {Crawler} from './WebCrawler';
import uuidv1 from 'uuidv1';
const userDataDir = uuidv1();
const argv = require('yargs')
    .option('url', {
        alias: 'u',
        type: 'string',
        description: 'URL to scan',
    })
    .argv;
const PROD = process.env.NODE_ENV === 'production' ? true : false;
const URL_TO_SCAN = process.env.URL_TO_SCAN;

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
    let domain = await getNextSite(db);

    while (domain != null) {
        console.log(`Crawling Site ${domain}`)
        try{
            const crawler = new Crawler(db, domain, userDataDir);
            await crawler.scanPages();
            domain = await getNextSite(db);
        } catch(mainScanError){
            console.error('Main scan error', mainScanError);
            break;
        }


    }

    db.close()

}

console.log(`                                                                                     
AAA               lllllll                                                       RRRRRRRRRRRRRRRRR                                                  d::::::d                                                                          444444444  
A:::A              l:::::l                                                       R::::::::::::::::R                                                 d::::::d                                                                         4::::::::4  
A:::::A             l:::::l                                                       R::::::RRRRRR:::::R                                                d::::::d                                                                        4:::::::::4  
A:::::::A            l:::::l                                                       RR:::::R     R:::::R                                               d:::::d                                                                        4::::44::::4  
A:::::::::A            l::::l     eeeeeeeeeeee  xxxxxxx      xxxxxxxaaaaaaaaaaaaa     R::::R     R:::::R    eeeeeeeeeeee    aaaaaaaaaaaaa      ddddddddd:::::d     eeeeeeeeeeee    rrrrr   rrrrrrrrr        vvvvvvv           vvvvvvv4::::4 4::::4  
A:::::A:::::A           l::::l   ee::::::::::::ee x:::::x    x:::::x a::::::::::::a    R::::R     R:::::R  ee::::::::::::ee  a::::::::::::a   dd::::::::::::::d   ee::::::::::::ee  r::::rrr:::::::::r        v:::::v         v:::::v4::::4  4::::4  
A:::::A A:::::A          l::::l  e::::::eeeee:::::eex:::::x  x:::::x  aaaaaaaaa:::::a   R::::RRRRRR:::::R  e::::::eeeee:::::eeaaaaaaaaa:::::a d::::::::::::::::d  e::::::eeeee:::::eer:::::::::::::::::r        v:::::v       v:::::v4::::4   4::::4  
A:::::A   A:::::A         l::::l e::::::e     e:::::e x:::::xx:::::x            a::::a   R:::::::::::::RR  e::::::e     e:::::e         a::::ad:::::::ddddd:::::d e::::::e     e:::::err::::::rrrrr::::::r        v:::::v     v:::::v4::::444444::::444
A:::::A     A:::::A        l::::l e:::::::eeeee::::::e  x::::::::::x      aaaaaaa:::::a   R::::RRRRRR:::::R e:::::::eeeee::::::e  aaaaaaa:::::ad::::::d    d:::::d e:::::::eeeee::::::e r:::::r     r:::::r         v:::::v   v:::::v 4::::::::::::::::4
A:::::AAAAAAAAA:::::A       l::::l e:::::::::::::::::e    x::::::::x     aa::::::::::::a   R::::R     R:::::Re:::::::::::::::::e aa::::::::::::ad:::::d     d:::::d e:::::::::::::::::e  r:::::r     rrrrrrr          v:::::v v:::::v  4444444444:::::444
A:::::::::::::::::::::A      l::::l e::::::eeeeeeeeeee     x::::::::x    a::::aaaa::::::a   R::::R     R:::::Re::::::eeeeeeeeeee a::::aaaa::::::ad:::::d     d:::::d e::::::eeeeeeeeeee   r:::::r                       v:::::v:::::v             4::::4  
A:::::AAAAAAAAAAAAA:::::A     l::::l e:::::::e             x::::::::::x  a::::a    a:::::a   R::::R     R:::::Re:::::::e         a::::a    a:::::ad:::::d     d:::::d e:::::::e            r:::::r                        v:::::::::v              4::::4  
A:::::A             A:::::A   l::::::le::::::::e           x:::::xx:::::x a::::a    a:::::a RR:::::R     R:::::Re::::::::e        a::::a    a:::::ad::::::ddddd::::::dde::::::::e           r:::::r                         v:::::::v               4::::4  
A:::::A               A:::::A  l::::::l e::::::::eeeeeeee  x:::::x  x:::::xa:::::aaaa::::::a R::::::R     R:::::R e::::::::eeeeeeeea:::::aaaa::::::a d:::::::::::::::::d e::::::::eeeeeeee   r:::::r                          v:::::v              44::::::44
A:::::A                 A:::::A l::::::l  ee:::::::::::::e x:::::x    x:::::xa::::::::::aa:::aR::::::R     R:::::R  ee:::::::::::::e a::::::::::aa:::a d:::::::::ddd::::d  ee:::::::::::::e   r:::::r                           v:::v               4::::::::4
AAAAAAA                   AAAAAAAllllllll    eeeeeeeeeeeeeexxxxxxx      xxxxxxxaaaaaaaaaa  aaaaRRRRRRRR     RRRRRRR    eeeeeeeeeeeeee  aaaaaaaaaa  aaaa  ddddddddd   ddddd    eeeeeeeeeeeeee   rrrrrrr                            vvv                4444444444
    
    
    

`);

if(argv.url != null || URL_TO_SCAN != null){

    (async function(){
        const urlToScan:string = URL_TO_SCAN ?? argv.url ?? ''; 
        if(urlToScan !== ''){
            const db = new MySQLConnector();
            const crawler = new Crawler(db, urlToScan, userDataDir);
            await crawler.scanPages();
            console.log('Scan for screenshots only')
            // await crawler.screenshotPagesWithWebAssemblyDisabled();
            db.close()
        }
        
    })()
} else {
    main()
}  
