from datetime import datetime
from skimage.metrics import structural_similarity
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import glob, cv2, os

root = "../Screenshots/"
report_dir = "../Reports/"
browsers = ['Chrome','Firefox']
condition = ["WebAssembly_Enabled","WebAssembly_Disabled"]
suffix = ["En", "Dis"]
hist_bin = 32
urls = []
images = {}
hists = {}

def search_urls(root):
    # If search reaches .jpeg without finding chrome and firefox, return
    if not os.path.isdir(root):
        return
    for sub in os.listdir(root):
        if sub in browsers:
            if root not in urls:
                urls.append(root)
            continue
        search_urls(root+sub+"/")

def read_img_and_hist():
    # Read the images and convert them to the histograms
    # Store in a dict with the url being the first-level key and browsername+condition being the second-level key
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
                    hist = cv2.calcHist([img], [0, 1, 2], None, [hist_bin, hist_bin, hist_bin], [0, 256, 0, 256, 0, 256])
                    hists[url][b+suffix[i]] = cv2.normalize(hist, hist).flatten()
                except:
                    print(url+b+"/"+condition[i]+"/screenshot.jpeg")

def chi_sqr_similarity(hist1, hist2):
    if hist1 is None or hist2 is None:
        return None
    return cv2.compareHist(hist1, hist2, cv2.HISTCMP_CHISQR)

def structural_difference(img1, img2, url, pair_name):
    # Trim for cross browser size difference (unsolved)
    height = min(img1.shape[0],img2.shape[0])
    width = min(img1.shape[1],img2.shape[1])
    img1 = img1[:height,:width,:]
    img2 = img2[:height,:width,:]
    img1_grey = cv2.cvtColor(img1, cv2.COLOR_RGB2GRAY)
    img2_grey = cv2.cvtColor(img2, cv2.COLOR_RGB2GRAY)
    (score, diff) = structural_similarity(img1_grey,img2_grey, full=True)
    # print("Image Similarity: {:.4f}%".format(score * 100))

    diff = (diff * 255).astype("uint8")
    diff_box = cv2.merge([diff, diff, diff])

    # Threshold the difference image, followed by finding contours to
    # obtain the regions of the two input images that differ
    thresh = cv2.threshold(diff, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    contours = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = contours[0] if len(contours) == 2 else contours[1]

    mask = np.zeros(img1.shape, dtype='uint8')
    filled_img2 = img2.copy()

    for c in contours:
        area = cv2.contourArea(c)
        if area > 1000:
            x, y, w, h = cv2.boundingRect(c)
            cv2.rectangle(img1, (x, y), (x + w, y + h), (36, 255, 12), 2)
            cv2.rectangle(img2, (x, y), (x + w, y + h), (36, 255, 12), 2)
            cv2.rectangle(diff_box, (x, y), (x + w, y + h), (36, 255, 12), 2)
            cv2.drawContours(mask, [c], 0, (255, 255, 255), -1)
            cv2.drawContours(filled_img2, [c], 0, (0, 255, 0), -1)

    save_dir = report_dir+url+pair_name+"/"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    cv2.imwrite(save_dir+'img1.jpeg', cv2.cvtColor(img1, cv2.COLOR_RGB2BGR))
    cv2.imwrite(save_dir+'img2.jpeg', cv2.cvtColor(img2, cv2.COLOR_RGB2BGR))
    cv2.imwrite(save_dir+'diff.jpeg', diff)
    cv2.imwrite(save_dir+'diff_box.jpeg', diff_box)
    cv2.imwrite(save_dir+'mask.jpeg', mask)
    cv2.imwrite(save_dir+'filled_img2.jpeg', cv2.cvtColor(filled_img2, cv2.COLOR_RGB2BGR))

    return score

if __name__ == "__main__":
    # img1 = cv2.imread("../Screenshots/sfs___biz/jobs/Chrome/WebAssembly_Enabled/screenshot.jpeg")
    # img1 = cv2.cvtColor(img1,cv2.COLOR_BGR2RGB)
    # img2 = cv2.imread("../Screenshots/sfs___biz/jobs/Firefox/WebAssembly_Enabled/screenshot.jpeg")
    # img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)
    # structural_difference(img1,img2)

    search_urls(root)
    read_img_and_hist()

    # Generate Report in .csv
    # Prepare Calculation Pair
    col_names = ["path"]
    for b in browsers:
        col_names.append("chisqr_"+b+suffix[0]+"_"+b+suffix[1])
        col_names.append("ssim_" + b + suffix[0]+"_" + b + suffix[1])
    for i in range(0,len(browsers)):
        for j in range(i+1,len(browsers)):
            col_names.append("chisqr_"+browsers[i]+suffix[0]+"_"+browsers[j]+suffix[0])
            col_names.append("chisqr_"+browsers[i] +suffix[1]+"_" + browsers[j] + suffix[1])
            col_names.append("ssim_" + browsers[i] + suffix[0]+"_" + browsers[j] + suffix[0])
            col_names.append("ssim_" + browsers[i] + suffix[1]+"_" + browsers[j] + suffix[1])
    report = pd.DataFrame(columns=col_names)

    # A Subdirectory for current report
    report_dir += datetime.now().strftime("%Y%m%d_%H_%M_%S")+"/"
    if not os.path.exists(report_dir):
        os.makedirs((report_dir))

    # Calculate CHI-square Distance and SSIM similarity pairwise
    for url in urls:
        new_row = [url]
        for i in range(1,len(col_names)):
            [method, index1, index2] = col_names[i].split("_")
            if method == "chisqr":
                new_row.append(chi_sqr_similarity(hists[url][index1],hists[url][index2]))
            elif method == "ssim":
                new_row.append(structural_difference(images[url][index1],images[url][index2],url[15:],col_names[i]))
        report.loc[len(report.index)] = new_row

    # Output the report into a .csv

    report.to_csv(report_dir+"metrics.csv")
    print("Report "+report_dir+" generated!")