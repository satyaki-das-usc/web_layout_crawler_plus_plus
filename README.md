# Web Layout Crawler #

This project uses the Playwright library to crawl a specified webpage with Chrome and Firefox with WebAssembly enabled and disabled. The downloaded webpage files are downloaded to the folder `JSOutput`. Screenshots are saved to the `Screenshots` folder. 

## How to set up ###

### Prequisites
* Node.js
* MySQL

### Installation
1. Run the `found_page_schema.sql` under the `Database` folder to set up the schema and table for metadata logging.
2. Run the command `npm install` in the root directory of this project (same as this README).
3. Run `npm run build` to rebuild the source TypeScript files in the `src` folder and output them to the `build` folder as JavaScript files.
4. Optionally, modify scripts under `src` or configure the scan parameters in the `config.json` under `src` and rebuild by running Step 3 again.
### Usage
1. Run the command `node ./build/index.js --url <url_to_san>` to scan the `<url_to_san>` and all of its first-level subpages. For example, try running the command `node ./build/index.js --url https://jkumara.github.io/pong-wasm/` as this site contains WebAssembly. 
2. To scan a list of urls with the crawler, run the command `node ./build/index.js --file <file_path>` to read in the file at `<file_path>`. For example, to use the included file `sites.txt`, run the command `node ./build/index.js --file sites.txt`
3. By default, both of these commands will now only download WebAssembly file found by default. If you want to download all files, add the flag `--full true` to the command. For example, if running the example in Usage 2, run the command `node ./build/index.js --file sites.txt --full true`.
4. To generate visual analysis report, run `python scripts/ScreenshotAnalysis.py`
