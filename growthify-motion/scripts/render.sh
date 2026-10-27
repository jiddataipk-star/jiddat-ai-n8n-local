#!/usr/bin/env bash
# Render one cut end to end: video → synthesized SFX → loudness → mux.
#   bash scripts/render.sh BrohReel  src/projects/broh/timeline-reel.json out/broh-reel-9x16.mp4
#   bash scripts/render.sh BrohYouTube src/projects/broh/timeline-yt.json out/broh-youtube-16x9.mp4
set -euo pipefail
ID=$1; TIMELINE=$2; OUT=$3
TMP=out/tmp-$ID; mkdir -p "$TMP"
npx remotion render src/index.ts "$ID" "$TMP/video.mp4" --log=error
python3 scripts/sfx.py "$TIMELINE" "$TMP/sfx.f32"
ffmpeg -v error -y -f f32le -ar 48000 -ac 2 -i "$TMP/sfx.f32" "$TMP/sfx.wav"
# Two-pass EBU R128 loudness normalisation: -14 LUFS integrated, true peak <= -1 dBTP.
M=$(ffmpeg -hide_banner -i "$TMP/sfx.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$TMP/sfx.wav" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,alimiter=limit=0.84:level=false,aresample=48000" "$TMP/sfx-norm.wav"
ffmpeg -v error -y -i "$TMP/video.mp4" -i "$TMP/sfx-norm.wav" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"
echo "done: $OUT"
ffmpeg -hide_banner -i "$OUT" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
