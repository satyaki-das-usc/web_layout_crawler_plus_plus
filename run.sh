#!/bin/bash

PYTHONPATH="." python recurrent_run.py --file $1

PYTHONPATH="." python scripts/ScreenshotAnalysis.py