import os
import subprocess
import json
import collections

from argparse import ArgumentParser

from os.path import join, isfile, isdir

def main(filepath: str):
    code = subprocess.call('npm run build', shell=True)
    print(f"Exit Code: {code}")

    while True:
        code = subprocess.call(f"node ./build/index.js --file {filepath}", shell=True)
        if code == 0:
            break
        with open("attempt.txt", "r") as f:
            new_ignore = f.readlines()[-1].strip()
        with open("ignorelist.txt", "a") as f:
            f.write(f"\n{new_ignore}")

def configure_arg_parser() -> ArgumentParser:
	arg_parser = ArgumentParser()
	arg_parser.add_argument("--file", type=str, default=None)
	return arg_parser

if __name__ == "__main__":
    __arg_parser = configure_arg_parser()
    __args = __arg_parser.parse_args()
    main(__args.file)