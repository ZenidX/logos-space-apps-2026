#!/usr/bin/env bash
# One command for the whole demo video: capture → overlays → captions → build.
# Usage: video/scripts/make.sh [output-name] [shot ...]
#   output-name   default terravista-demo (video/build/<name>.mp4 + .webm)
#   shot ...      re-capture only these shots (a b c1 c2); default all. SKIP_CAPTURE=1 reuses the frames already captured.
# Word timings (video/audio/word-timings.json) only need redoing if the voice changes: see video/scripts/align.py.
# Publish the result on /demo-video/ with video/scripts/publish-demo.sh <output-name>.
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=${1:-terravista-demo}; shift || true
export DUR=${DUR:-29.5}   # video length: the voice is 29.5 s (rules: 30 s or less)
t0=$(date +%s)
if [ "${SKIP_CAPTURE:-0}" != 1 ]; then node scripts/capture.cjs "$@"; fi
node scripts/overlays.cjs
node scripts/captions.cjs
scripts/build.sh "$NAME"
tools/node_modules/ffprobe-static/bin/linux/x64/ffprobe -v error -show_entries format=duration:stream=codec_name,width,height \
  -of compact=p=0 "build/$NAME.mp4"
echo "done in $(( $(date +%s) - t0 )) s"
