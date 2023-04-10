#!/bin/bash

PYTHONPATH="." python3 recurrent_run.py --file $1

PYTHONPATH="." python3 scripts/ScreenshotAnalysis.py

PYTHONPATH="." python scripts/screenshot_stabilizer.py

PYTHONPATH="." python scripts/ScreenshotAnalysis.py -s Stabilized_Screenshots

PYTHONPATH="." python scripts/extract_critical_metrics.py -s Reports/20230409_16_57_38/metrics.csv -d Reports/20230409_16_57_38/critical_metrics.csv