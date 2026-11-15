"""Word timings for the captions: aligns the script (docs/timestamps.txt) to the voice (video/audio/voice.wav) with Vosk.

Usage (Vosk and its model live outside the repo):
  python -I video/scripts/align.py <vosk-model-dir> [ffmpeg]
Writes video/audio/word-timings.json: [{phrase, start, end, text, words: [{w, start, end, aligned}]}]
"""
import difflib, json, re, subprocess, sys, wave, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
TS = ROOT / "docs/timestamps.txt"
WAV = ROOT / "video/audio/voice.wav"
OUT = ROOT / "video/audio/word-timings.json"
model_dir = sys.argv[1]
ffmpeg = sys.argv[2] if len(sys.argv) > 2 else str(ROOT / "video/tools/node_modules/ffmpeg-static/ffmpeg")

from vosk import Model, KaldiRecognizer, SetLogLevel  # noqa: E402

SetLogLevel(-1)

# 1. Script phrases and words (display text keeps punctuation)
phrases = []
for line in TS.read_text(encoding="utf-8").splitlines():
    m = re.match(r"^\[(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\]:\s*(.+)$", line)
    if m:
        phrases.append({"start": float(m[1]), "end": float(m[2]), "text": m[3].strip()})
script = []  # (phrase index, display word)
for i, p in enumerate(phrases):
    for w in p["text"].split():
        script.append((i, w))

norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower().replace("’", "'"))

# 2. Recognise with word times (16 kHz mono)
pcm = subprocess.run([ffmpeg, "-loglevel", "error", "-i", str(WAV), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
rec = KaldiRecognizer(Model(model_dir), 16000)
rec.SetWords(True)
heard = []
for k in range(0, len(pcm), 8000):
    if rec.AcceptWaveform(pcm[k:k + 8000]):
        heard += json.loads(rec.Result()).get("result", [])
heard += json.loads(rec.FinalResult()).get("result", [])
print("heard:", " ".join(h["word"] for h in heard))

# 3. Align script tokens to heard tokens
a = [norm(w) for _, w in script]
b = [h["word"] for h in heard]
times = [None] * len(script)
sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal":
        for d in range(i2 - i1):
            times[i1 + d] = (heard[j1 + d]["start"], heard[j1 + d]["end"], True)
    elif tag == "replace":
        # spread the heard span over the script words (e.g. "terra vista" -> "TerraVista.")
        s, e, n = heard[j1]["start"], heard[j2 - 1]["end"], i2 - i1
        for d in range(n):
            times[i1 + d] = (s + (e - s) * d / n, s + (e - s) * (d + 1) / n, False)

# 4. Interpolate anything still missing, inside its phrase slot
for i in range(len(script)):
    if times[i] is None:
        prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), phrases[script[i][0]]["start"])
        nxt_i = next((j for j in range(i + 1, len(script)) if times[j]), None)
        nxt = times[nxt_i][0] if nxt_i is not None else phrases[script[i][0]]["end"]
        gap = nxt_i - i if nxt_i is not None else 1
        t = prev + (nxt - prev) / (gap + 1)
        times[i] = (t, t + 0.2, False)

out = [dict(p, words=[]) for p in phrases]
for (pi, w), (s, e, ok) in zip(script, times):
    p = phrases[pi]
    s = min(max(s, p["start"]), p["end"] - 0.05)
    out[pi]["words"].append({"w": w, "start": round(s, 3), "end": round(min(e, p["end"]), 3), "aligned": ok})

for i, p in enumerate(out):
    ws = p["words"]
    miss = [x["w"] for x in ws if not x["aligned"]]
    print(f"[{p['start']}-{p['end']}] first {ws[0]['start']:.2f} last {ws[-1]['start']:.2f}  {'not aligned: ' + ' '.join(miss) if miss else 'all aligned'}")
OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
print("wrote", OUT.relative_to(ROOT))
