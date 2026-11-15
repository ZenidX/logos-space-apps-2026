#!/usr/bin/env bash
# Copies a built video into the web app's hidden page /demo-video/ (public/demo/), with a poster from the end card.
# Usage: video/scripts/publish-demo.sh [output-name]    then commit public/demo on main and run `npm run deploy`.
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=${1:-terravista-demo}
D=../public/demo
mkdir -p $D
cp "build/$NAME.mp4" $D/terravista-demo.mp4
cp "build/$NAME.webm" $D/terravista-demo.webm
tools/node_modules/ffmpeg-static/ffmpeg -loglevel error -y -sseof -1.5 -i "build/$NAME.mp4" -frames:v 1 -q:v 3 $D/terravista-demo-poster.jpg
ls -la $D
