"""Synthesize the sound-effect track for a cut from its timeline JSON.

    python3 scripts/sfx.py src/projects/broh/timeline-reel.json out/sfx-reel.f32

Writes raw float32 stereo at 48 kHz (ffmpeg: -f f32le -ar 48000 -ac 2).
Every sound is generated here (no samples, no music), so the track is free to use.
Cue frames come from the same JSON the Remotion scenes read, so sound and motion stay in sync.
"""
import json
import sys

import numpy as np

SR = 48000
FPS = 30
rng = np.random.default_rng(7)


def env(n, attack, release, curve=3.0):
    """Attack/decay envelope over n samples (attack/release as fractions of n)."""
    t = np.linspace(0, 1, n, endpoint=False)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    r = np.clip((1 - t) / max(release, 1e-4), 0, 1) ** curve
    return a * r


def biquad_bp(x, f0, q):
    """Band-pass with a per-sample centre frequency (RBJ cookbook), coefficients updated every 32 samples."""
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    f0 = np.broadcast_to(np.asarray(f0, dtype=float), x.shape)
    for start in range(0, len(x), 32):
        w0 = 2 * np.pi * min(f0[start], SR * 0.45) / SR
        alpha = np.sin(w0) / (2 * q)
        b0, b2 = alpha, -alpha
        a0, a1, a2 = 1 + alpha, -2 * np.cos(w0), 1 - alpha
        b0, b2, a1, a2 = b0 / a0, b2 / a0, a1 / a0, a2 / a0
        for i in range(start, min(start + 32, len(x))):
            xi = x[i]
            yi = b0 * xi + b2 * x2 - a1 * y1 - a2 * y2
            x2, x1 = x1, xi
            y2, y1 = y1, yi
            y[i] = yi
    return y


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def stereo(m, pan=0.0):
    """Mono → stereo with constant-power pan (-1 left … 1 right); pan may be an array."""
    p = (np.asarray(pan) + 1) * np.pi / 4
    return np.stack([m * np.cos(p), m * np.sin(p)], axis=1)


def db(g):
    return 10 ** (g / 20)


def tick():
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 3100 * t) * np.exp(-t / 0.006) + 0.4 * rng.standard_normal(n) * np.exp(-t / 0.002)
    return stereo(norm(s) * db(-16))


def type_tick(i):
    n = int(0.022 * SR)
    t = np.arange(n) / SR
    f = 2600 + 500 * ((i * 37) % 7) / 7
    s = 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004) + rng.standard_normal(n) * np.exp(-t / 0.0015)
    return stereo(norm(s) * db(-22), pan=0.15 * np.sin(i))


def click():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    tr = rng.standard_normal(n) * np.exp(-t / 0.0012)
    tr = tr - onepole_lp(tr, 1500)
    body = np.sin(2 * np.pi * 1900 * t) * np.exp(-t / 0.007) + 0.5 * np.sin(2 * np.pi * 950 * t) * np.exp(-t / 0.012)
    return stereo(norm(tr * 0.7 + body) * db(-12))


def pop():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = 420 + 520 * np.exp(-t / 0.025)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.03, 0.97, 2.2) + 0.15 * rng.standard_normal(n) * np.exp(-t / 0.003)
    return stereo(norm(s) * db(-11))


def swish(length=0.2, gain=-13):
    n = int(length * SR)
    noise = rng.standard_normal(n)
    f = np.linspace(1200, 6000, n)
    s = biquad_bp(noise, f, 1.4) * env(n, 0.35, 0.65, 2.0)
    return stereo(norm(s) * db(gain), pan=np.linspace(-0.4, 0.4, n))


def whoosh(length=0.5, gain=-9):
    n = int(length * SR)
    noise = rng.standard_normal(n)
    t = np.linspace(0, 1, n)
    f = 300 + 2600 * np.sin(np.pi * t) ** 1.5
    s = biquad_bp(noise, f, 0.9) * env(n, 0.55, 0.45, 2.0)
    low = onepole_lp(noise, 180) * env(n, 0.5, 0.5, 2.0) * 0.6
    return stereo(norm(s + low) * db(gain), pan=np.linspace(-0.7, 0.7, n))


def thud():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 42 + 50 * np.exp(-t / 0.05)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.12) + 0.3 * onepole_lp(rng.standard_normal(n), 400) * np.exp(-t / 0.03)
    return stereo(norm(s) * db(-7))


def ding():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for start, f in ((0.0, 1567.98), (0.11, 2093.0)):
        m = t >= start
        tt = t[m] - start
        s[m] += (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * f * 2.01 * tt)) * np.exp(-tt / 0.28) * np.clip(tt / 0.004, 0, 1)
    return stereo(norm(s) * db(-10))


def riser(length=0.75):
    n = int(length * SR)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    s = biquad_bp(noise, 500 + 5000 * t ** 2, 2.0) * t ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * t ** 2) / SR) * 0.25 * t ** 2
    return stereo(norm(s + tone) * db(-12))


BANK = {
    'tick': tick(),
    'click': click(),
    'pop': pop(),
    'swish': swish(),
    'whoosh': whoosh(),
    'whoosh-soft': whoosh(0.38, -17),
    'thud': thud(),
    'ding': ding(),
    'riser': riser(),
}


def type_step(i, seed):
    # Mirrors typeStep() in src/kit/type.tsx.
    return 1 + ((i * 7 + len(seed) * 3) % 3)


def main(timeline_path, out_path):
    tl = json.load(open(timeline_path))
    total = int(tl['frames'] / FPS * SR) + SR
    mix = np.zeros((total, 2))

    def place(sound, frame, gain_db=0.0):
        start = int(frame / FPS * SR)
        if start < 0:
            sound, start = sound[-start:], 0
        end = min(total, start + len(sound))
        mix[start:end] += sound[: end - start] * db(gain_db)

    for sc in tl['scenes'].values():
        ev = sc.get('ev', {})
        at = lambda k: sc['from'] + (ev[k] if isinstance(k, str) else k)
        for cue in sc.get('sfx', []):
            name, kind = cue[0], cue[1]
            gain = cue[2] if len(cue) > 2 else 0.0
            # Every sound starts on its cue frame (whoosh cues sit at the start of the move).
            place(BANK[kind], at(name), gain)
        for start_key, text, seed in sc.get('typing', []):
            f = at(start_key)
            for i, ch in enumerate(text):
                if ch != ' ':
                    place(type_tick(i), f)
                f += type_step(i, seed)

    mix = mix[: int(tl['frames'] / FPS * SR)]
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix = mix / peak * db(-3)
    mix.astype('<f4').tofile(out_path)
    print(f'{out_path}: {len(mix) / SR:.2f}s, cues ok')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
