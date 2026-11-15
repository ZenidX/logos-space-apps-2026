#!/usr/bin/env bash
# Assembles the demo video (1920x1080, 30 fps, $DUR s) from video/build/frames, video/build/overlays and video/build/captions.
# Order: capture.cjs → overlays.cjs → captions.cjs → build.sh
# Usage: video/scripts/build.sh [output-name]     Optional audio: video/audio/voice.wav or voice.mp3 (muxed if present)
set -euo pipefail
cd "$(dirname "$0")/.."
FF=tools/node_modules/ffmpeg-static/ffmpeg
B=build; O=$B/overlays; F=$B/frames
NAME=${1:-terravista-demo}
DUR=${DUR:-28.85}  # the male voice is 28.85 s; the rules say 30 s or less
CAP_Y=905         # vertical centre of the captions
N="scale=1920:1080,setsar=1,fps=30,format=yuv420p"

# Timeline (docs/timestamps.txt), all real screens of the team's app (capture.cjs):
# a 0–18 (story) · b 18–21.6 (where it breaks, first 108 of 120 frames) · c1 21.6–24.0 (permit) · c2 24.0–25.6 (access High) · end card 25.6–$DUR
END=$(node -e "console.log(($DUR-25.6).toFixed(2))")
in=(
  -framerate 30 -i $F/a/%04d.jpg
  -framerate 30 -i $F/b/%04d.jpg
  -framerate 30 -i $F/c1/%04d.jpg
  -framerate 30 -i $F/c2/%04d.jpg
  -loop 1 -framerate 30 -t $END -i $O/end.png
  -i $O/watermark.png
)
fc="[0:v]$N[a];[1:v]trim=end_frame=108,setpts=PTS-STARTPTS,$N[b];[2:v]$N[c];[3:v]$N[d];[4:v]$N,fade=in:st=0:d=0.4[e];"
fc+="[a][b][c][d][e]concat=n=5:v=1:a=0[v0];[v0][5:v]overlay=0:0[w0];"

# Captions, word by word: one transparent PNG sequence rendered by captions.cjs (1920x240 strip), centred on CAP_Y
in+=(-framerate 30 -i $B/captions/%04d.png)
fc+="[w0][6:v]overlay=0:$((CAP_Y - 120)):eof_action=pass[v]"
n=1

# Voice: starts at 0, cut at $DUR with a 0.1 s fade so the cut doesn't click
VOICE=${VOICE:-$(ls audio/voice.wav audio/voice.mp3 2>/dev/null | head -1 || true)}  # VOICE=/abs/path.wav picks another take
audio=()
if [ -n "$VOICE" ]; then
  in+=(-i "$VOICE")
  fc+=";[$((6 + n)):a]atrim=0:$DUR,afade=out:st=$(node -e "console.log($DUR-0.1)"):d=0.1,aresample=48000[aout]"
  audio=(-map "[aout]" -c:a aac -b:a 192k)
fi

$FF -hide_banner -loglevel error -y "${in[@]}" -filter_complex "$fc" -map "[v]" "${audio[@]}" \
  -threads 4 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -t $DUR -movflags +faststart "$B/$NAME.mp4"
# VP9 copy for reviewing on machines without an H.264 decoder
$FF -hide_banner -loglevel error -y -i "$B/$NAME.mp4" -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 -cpu-used 4 -c:a libopus "$B/$NAME.webm"
echo "$B/$NAME.mp4"; echo "$B/$NAME.webm"
