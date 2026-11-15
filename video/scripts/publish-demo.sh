#!/usr/bin/env bash
# Copies a built video into the web app's hidden page /demo-video/ (public/demo/), with a poster from the end card.
# Files are named after the output (e.g. terravista-demo-v6.mp4) so each version gets fresh URLs (no stale browser cache);
# then set V in src/app/(team)/demo-video/page.tsx to the same name.
# Usage: video/scripts/publish-demo.sh [output-name]    then commit public/demo and push to main (GitHub Actions deploys it).
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=${1:-terravista-demo}
D=../public/demo
mkdir -p $D
cp "build/$NAME.mp4" "$D/$NAME.mp4"
cp "build/$NAME.webm" "$D/$NAME.webm"
tools/node_modules/ffmpeg-static/ffmpeg -loglevel error -y -sseof -1.5 -i "build/$NAME.mp4" -frames:v 1 -q:v 3 "$D/$NAME-poster.jpg"
ls -la $D
