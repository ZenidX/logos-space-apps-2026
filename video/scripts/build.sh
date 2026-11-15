#!/usr/bin/env bash
# Assembles the 30 s test cut (1080x1920, 30 fps, silent) from video/build/frames and video/build/overlays.
# Usage: video/scripts/build.sh [output-name]     Optional audio: video/audio/voice.mp3 (muxed if present)
set -euo pipefail
cd "$(dirname "$0")/.."
FF=tools/node_modules/ffmpeg-static/ffmpeg
B=build; O=$B/overlays; F=$B/frames
OUT=$B/${1:-terravista-test-v1}.mp4
N="scale=1080:1920,setsar=1,fps=30,format=yuv420p"

# Timeline (docs/timestamps.txt): s1 0–6 · s2 6–13 · black 13–18 · s4 18–22 · black 22–27 · end card 27–30
in=(
  -framerate 30 -i $F/s1/%04d.jpg
  -framerate 30 -i $F/s2/%04d.jpg
  -loop 1 -framerate 30 -t 5 -i $O/black.png
  -framerate 30 -i $F/s4/%04d.jpg
  -loop 1 -framerate 30 -t 5 -i $O/black.png
  -loop 1 -framerate 30 -t 3 -i $O/end.png
  -i $O/watermark.png
)
fc="[0:v]$N[a];[1:v]$N[b];[2:v]$N[c];[3:v]$N[d];[4:v]$N[e];[5:v]$N,fade=in:st=0:d=0.4[f];"
fc+="[a][b][c][d][e][f]concat=n=6:v=1:a=0[v0];[v0][6:v]overlay=0:0[w0];"

# Captions: one PNG per cue, shown only during its interval
n=$(node -e "console.log(require('./$O/cues.json').length)")
for i in $(seq 0 $((n - 1))); do
  in+=(-i $O/cap$i.png)
  read -r s e < <(node -e "const c=require('./$O/cues.json')[$i];console.log(c.start,c.end)")
  fc+="[w$i][$((7 + i)):v]overlay=0:0:enable='between(t,$s,$e-0.001)'[w$((i + 1))];"
done
fc+="[w$n]null[v]"

audio=(); [ -f audio/voice.mp3 ] && { in+=(-i audio/voice.mp3); audio=(-map "$((7 + n)):a" -c:a aac -b:a 192k); }

$FF -hide_banner -loglevel error -y "${in[@]}" -filter_complex "$fc" -map "[v]" "${audio[@]}" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -t 30 -movflags +faststart "$OUT"
echo "$OUT"
