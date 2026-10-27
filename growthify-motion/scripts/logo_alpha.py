"""Turn logo-on-dark.png (artwork on solid #06140E) into a transparent PNG.
The artwork has two inks (white wordmark, #B6E36B lime). Each pixel is unmixed as
c = a*ink + (1-a)*bg, picking the ink that best explains the pixel. Pixels are not redrawn."""
import sys
import numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
bg = im[2, 2].copy()
inks = [np.array([255, 255, 255], np.float32), np.array([0xB6, 0xE3, 0x6B], np.float32)]
best_a, best_err, best_ink = None, None, None
for ink in inks:
    d = ink - bg
    a = ((im - bg) * d).sum(-1) / (d * d).sum()
    a = np.clip(a, 0, 1)
    err = ((im - (bg + a[..., None] * d)) ** 2).sum(-1)
    if best_a is None:
        best_a, best_err, best_ink = a, err, np.broadcast_to(ink, im.shape).copy()
    else:
        m = err < best_err
        best_a[m], best_err[m], best_ink[m] = a[m], err[m], ink
out = np.dstack([best_ink, best_a * 255]).astype(np.uint8)
img = Image.fromarray(out, 'RGBA')
img = img.crop(img.getbbox())
img.save(dst)
print(img.size, 'max residual', float(np.sqrt(best_err.max())))
