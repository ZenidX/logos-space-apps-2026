#!/usr/bin/env bash
# Assembles the test cut (1920x1080, 30 fps, 29.9 s) from video/build/frames and video/build/overlays.
# Usage: video/scripts/build.sh [output-name]     Optional audio: video/audio/voice.wav or voice.mp3 (muxed if present)
set -euo pipefail
cd "$(dirname "$0")/.."
FF=tools/node_modules/ffmpeg-static/ffmpeg
B=build; O=$B/overlays; F=$B/frames
NAME=${1:-terravista-test-v2}
DUR=29.9          # hard cap: the rules say 30 s or less, so keep a margin
CAP_Y=905         # vertical centre of the captions
N="scale=1920:1080,setsar=1,fps=30,format=yuv420p"

# Timeline (docs/timestamps.txt): s1 0–6 · s2 6–13 · black 13–18 · s4 18–22 · black 22–27 · end card 27–29.9
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

# Captions: one strip per cue, shown during its interval, popping in (90 % → 100 % in 0.2 s, with a short fade)
n=$(node -e "console.log(require('./$O/cues.json').length)")
for i in $(seq 0 $((n - 1))); do
  in+=(-loop 1 -framerate 30 -t $DUR -i $O/cap$i.png)
  read -r s e < <(node -e "const c=require('./$O/cues.json')[$i];console.log(c.start,c.end)")
  k="(0.9+0.1*min(1,max(0,(t-$s)/0.2)))"
  fc+="[$((7 + i)):v]format=rgba,scale=w='trunc(iw*$k/2)*2':h='trunc(ih*$k/2)*2':eval=frame,fade=in:st=$s:d=0.15:alpha=1[k$i];"
  fc+="[w$i][k$i]overlay=x='(W-w)/2':y='$CAP_Y-h/2':enable='between(t,$s,$e-0.001)'[w$((i + 1))];"
done
fc+="[w$n]null[v]"

# Voice: starts at 0, cut at $DUR with a 0.1 s fade so the cut doesn't click
VOICE=$(ls audio/voice.wav audio/voice.mp3 2>/dev/null | head -1 || true)
audio=()
if [ -n "$VOICE" ]; then
  in+=(-i "$VOICE")
  fc+=";[$((7 + n)):a]atrim=0:$DUR,afade=out:st=$(node -e "console.log($DUR-0.1)"):d=0.1,aresample=48000[aout]"
  audio=(-map "[aout]" -c:a aac -b:a 192k)
fi

$FF -hide_banner -loglevel error -y "${in[@]}" -filter_complex "$fc" -map "[v]" "${audio[@]}" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -t $DUR -movflags +faststart "$B/$NAME.mp4"
# VP9 copy for reviewing on machines without an H.264 decoder
$FF -hide_banner -loglevel error -y -i "$B/$NAME.mp4" -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 -cpu-used 4 -c:a libopus "$B/$NAME.webm"
echo "$B/$NAME.mp4"; echo "$B/$NAME.webm"
