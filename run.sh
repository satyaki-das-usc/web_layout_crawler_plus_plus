#!/bin/bash

PYTHONPATH="." python3 recurrent_run.py --file $1

PYTHONPATH="." python3 scripts/ScreenshotAnalysis.py