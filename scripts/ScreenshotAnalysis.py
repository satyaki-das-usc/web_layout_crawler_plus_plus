from datetime import datetime
import matplotlib.pyplot as plt
import pandas as pd
import glob, cv2, os

root = "../Screenshots/"
report_dir = "../Reports/"
browsers = ['Chrome','Firefox']
condition = ["WebAssembly_Enabled","WebAssembly_Disabled"]
suffix = ["_en", "_dis"]
urls = []
images = {}
hists = {}

def search_urls(root):
    # If search reaches .jpeg without finding chrome and firefox, return
    if not os.path.isdir(root):
        return
    for sub in os.listdir(root):
        if sub in browsers:
            urls.append(root)
            continue
        search_urls(root+sub+"/")


def chi_sqr_similarity(hist1, hist2):
    if hist1 is None or hist2 is None:
        return None
    return cv2.compareHist(hist1, hist2, cv2.HISTCMP_CHISQR)

if __name__ == "__main__":
    # Read the images and convert them to the histograms
    # Store in a dict with the url being the first-level key and browsername+condition being the second-level key
    # for url in os.listdir(root):
    search_urls(root)
    for url in urls:
        images[url] = {}
        hists[url] = {}
        for b in browsers:
            for i in range(0,len(condition)):
                try:
                    # urls that don't have .wasm, thus no WebAssembly_Disabled directory
                    if i == 1 and (not os.path.exists(root+url+"/"+b+"/"+condition[i])):
                        images[url][b+suffix[i]] = None
                        hists[url][b+suffix[i]] = None
                        continue
                    img = cv2.imread(url+b+"/"+condition[i]+"/screenshot.jpeg")
                    images[url][b+suffix[i]] = cv2.cvtColor(img,cv2.COLOR_BGR2RGB)
                    hist = cv2.calcHist([img], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
                    hists[url][b+suffix[i]] = cv2.normalize(hist, hist).flatten()
                except:
                    print(url+b+"/"+condition[i]+"/screenshot.jpeg")

    # Generate Report in .csv
    # Prepare Calculation Pair
    col_names = ["path"]
    for b in browsers:
        col_names.append(b+"_en|"+b+"_dis")
    for i in range(0,len(browsers)):
        for j in range(i+1,len(browsers)):
            col_names.append(browsers[i]+"_en|"+browsers[j]+"_en")
            col_names.append(browsers[i] + "_dis|" + browsers[j] + "_dis")
    report = pd.DataFrame(columns=col_names)

    # Calculate CHI-square similarity pairwise
    # for url in os.listdir(root):
    for url in urls:
        new_row = [url]
        for i in range(1,len(col_names)):
            [index1, index2] = col_names[i].split("|")
            new_row.append(chi_sqr_similarity(hists[url][index1],hists[url][index2]))
        report.loc[len(report.index)] = new_row

    # Output the report into a .csv
    if not os.path.exists(report_dir):
        os.makedirs((report_dir))
    name = report_dir+datetime.now().strftime("%Y%m%d_%H_%M_%S")+".csv"
    report.to_csv(name)
    print("Report "+name+" generated!")