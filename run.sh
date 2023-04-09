#!/bin/bash

PYTHONPATH="." python3 recurrent_run.py --file $1

PYTHONPATH="." python3 scripts/ScreenshotAnalysis.py

PYTHONPATH="." python scripts/screenshot_stabilizer.py

PYTHONPATH="." python scripts/ScreenshotAnalysis.py -s Stabilized_Screenshots