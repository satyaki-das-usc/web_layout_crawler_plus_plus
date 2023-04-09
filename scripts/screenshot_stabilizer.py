import os
import collections
import logging

import pandas as pd

from argparse import ArgumentParser
from os.path import join, isfile, isdir

def configure_arg_parser():
    arg_parser = ArgumentParser()
    arg_parser.add_argument("-s",
                            "--src_dir",
                            help="Path to source screenshot directory",
                            default="Screenshots",
                            type=str)
    arg_parser.add_argument("-d",
                            "--dst_dir",
                            help="Path to destination screenshot directory",
                            default="Stabilized_Screenshots",
                            type=str)
    arg_parser.add_argument("-l",
                            "--log_dir",
                            help="Path to logging directory",
                            default="logs",
                            type=str)
    args, unknown = arg_parser.parse_known_args()

    return args

def init_log(LOG_DIR):
    if not isdir(LOG_DIR):
        os.makedirs(LOG_DIR)
    
    logging.basicConfig(
        handlers=[
            logging.FileHandler(join(LOG_DIR, "stabilize.log")),
            logging.StreamHandler()
        ],
        format='%(asctime)s %(levelname)-8s %(message)s',
        level=logging.INFO,
        datefmt='%Y-%m-%d %H:%M:%S')
    logging.info("=========New session=========")
    logging.info(f"Logging dir: {LOG_DIR}")

def get_valid_screenshot_dirs(SRC_DIR):
    browser_dirnames = ["Chrome", "Firefox"]

    valid_dirs = []
    for root, dirs, files in os.walk(SRC_DIR, topdown=True):
        if len(files) < 1:
            continue

        for dirname in browser_dirnames:
            if dirname in root:
                url_dir = root.split(dirname)[0]
        valid_dirs.append(url_dir)

    freq = collections.Counter(valid_dirs)

    return [x for x in valid_dirs if freq[x] >= 4]

def stabilize_screenshots(DST_DIR, src_dirs):
    if not isdir(DST_DIR):
        os.makedirs(DST_DIR)
    
    browser_dirnames = ["Chrome", "Firefox"]
    condition_dirnames = ["WebAssembly_Enabled", "WebAssembly_Disabled"]

    for src_dir in src_dirs:
        for br_dir in browser_dirnames:
            for cond_dir in condition_dirnames:
                SRC_ROOT = join(src_dir, br_dir, cond_dir)
                DST_ROOT = join(DST_DIR, join(*src_dir.split("/")[1:]), cond_dir, br_dir)
                logging.info(f"from {SRC_ROOT} to {DST_ROOT}")
                if not isdir(DST_ROOT):
                    os.makedirs(DST_ROOT)
                for filename in os.listdir(SRC_ROOT):
                    SRC_PATH = join(SRC_ROOT, filename)
                    DST_PATH = join(DST_ROOT, filename)
                    os.system(f"mv {SRC_PATH} {DST_PATH}")

if __name__ == "__main__":
    args = configure_arg_parser()
    init_log(args.log_dir)
    
    valid_dirs = get_valid_screenshot_dirs(args.src_dir)
    stabilize_screenshots(args.dst_dir, valid_dirs)