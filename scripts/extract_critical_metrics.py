import logging
import os
import pandas as pd

from math import fabs
from argparse import ArgumentParser

def configure_arg_parser():
    arg_parser = ArgumentParser()
    arg_parser.add_argument("-s",
                            "--src_csv_path",
                            help="Path to source CSV path",
                            required=True,
                            default=None,
                            type=str)
    arg_parser.add_argument("-d",
                            "--dst_csv_path",
                            help="Path to destination CSV path",
                            required=True,
                            default=None,
                            type=str)
    arg_parser.add_argument("-l",
                            "--log_dir",
                            help="Path to logging directory",
                            default="logs",
                            type=str)
    args, unknown = arg_parser.parse_known_args()

    return args

def init_log(LOG_DIR):
    if not os.path.isdir(LOG_DIR):
        os.makedirs(LOG_DIR)
    
    logging.basicConfig(
        handlers=[
            logging.FileHandler(os.path.join(LOG_DIR, "critical_metrics_extraction.log")),
            logging.StreamHandler()
        ],
        format='%(asctime)s %(levelname)-8s %(message)s',
        level=logging.INFO,
        datefmt='%Y-%m-%d %H:%M:%S')
    logging.info("=========New session=========")
    logging.info(f"Logging dir: {LOG_DIR}")

if __name__ == "__main__":
    args = configure_arg_parser()
    init_log(args.log_dir)

    logging.info(f"Reading from {args.src_csv_path}")
    relevant_columns = ["path", "chisqr_ChromeEn_FirefoxEn", "chisqr_ChromeDis_FirefoxDis", "ssim_ChromeEn_FirefoxEn", "ssim_ChromeDis_FirefoxDis"]
    metrics_df = pd.read_csv(args.src_csv_path, usecols=relevant_columns)
    logging.info(f"Reading from completed")

    threshold = 0.5

    # metrics_df["inspect"] = np.where((fabs(metrics_df["chisqr_ChromeEn_FirefoxEn"] - metrics_df["chisqr_ChromeDis_FirefoxDis"]) > threshold | fabs(metrics_df["ssim_ChromeEn_FirefoxEn"] - metrics_df["ssim_ChromeDis_FirefoxDis"]) > threshold), "YES", "NO")

    critical_paths = []
    critical_chisqr_ChromeEn_FirefoxEns = []
    critical_chisqr_ChromeDis_FirefoxDiss = []
    critical_ssim_ChromeEn_FirefoxEns = []
    critical_ssim_ChromeDis_FirefoxDiss = []

    for row in metrics_df.iterrows():
        if not (fabs(row[1]["chisqr_ChromeEn_FirefoxEn"] - row[1]["chisqr_ChromeDis_FirefoxDis"]) > threshold or fabs(row[1]["ssim_ChromeEn_FirefoxEn"] - row[1]["ssim_ChromeDis_FirefoxDis"]) > threshold):
            continue
        
        critical_paths.append(row[1]["path"])
        critical_chisqr_ChromeEn_FirefoxEns.append(row[1]["chisqr_ChromeEn_FirefoxEn"])
        critical_chisqr_ChromeDis_FirefoxDiss.append(row[1]["chisqr_ChromeDis_FirefoxDis"])
        critical_ssim_ChromeEn_FirefoxEns.append(row[1]["ssim_ChromeEn_FirefoxEn"])
        critical_ssim_ChromeDis_FirefoxDiss.append(row[1]["ssim_ChromeDis_FirefoxDis"])

    logging.info(f"Writing to {args.dst_csv_path}")
    pd.DataFrame({
        "path": critical_paths,
        "chisqr_ChromeEn_FirefoxEn": critical_chisqr_ChromeEn_FirefoxEns,
        "chisqr_ChromeDis_FirefoxDis": critical_chisqr_ChromeDis_FirefoxDiss,
        "ssim_ChromeEn_FirefoxEn": critical_ssim_ChromeEn_FirefoxEns,
        "ssim_ChromeDis_FirefoxDis": critical_ssim_ChromeDis_FirefoxDiss
    }).to_csv(args.dst_csv_path, index=False)
    logging.info(f"Writing completed")