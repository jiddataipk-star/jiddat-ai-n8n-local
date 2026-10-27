"""QA contact sheets: a frame every 0.25 s, labelled with its timestamp.
python3 scripts/qa_sheets.py <video.mp4> <out_dir> [tile_width] [per_sheet]
For 9:16 the Reels safe zone (top 220, bottom 420, right 140) and the 4:5 grid crop are outlined."""
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

video, out = sys.argv[1], sys.argv[2]
tw = int(sys.argv[3]) if len(sys.argv) > 3 else 216
per = int(sys.argv[4]) if len(sys.argv) > 4 else 40
os.makedirs(f'{out}/frames', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-vf', 'fps=4', f'{out}/frames/%04d.png'], check=True)
files = sorted(os.listdir(f'{out}/frames'))
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
first = Image.open(f'{out}/frames/{files[0]}')
W, H = first.size
portrait = H > W
th = round(H * tw / W)
s = tw / W
cols = 10 if portrait else 5
for si in range(0, len(files), per):
    chunk = files[si:si + per]
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 4), rows * (th + 4)), (60, 60, 60))
    for i, f in enumerate(chunk):
        im = Image.open(f'{out}/frames/{f}').convert('RGB').resize((tw, th), Image.LANCZOS)
        d = ImageDraw.Draw(im)
        if portrait:
            d.rectangle((0, 220 * s, (W - 140) * s, (H - 420) * s), outline=(255, 0, 255))
            d.rectangle((0, 285 * s, tw - 1, 1635 * s), outline=(0, 200, 255))
        t = (si + i) * 0.25
        d.rectangle((0, 0, 58, 18), fill=(0, 0, 0))
        d.text((3, 1), f'{t:5.2f}s', font=F, fill=(255, 255, 0))
        sheet.paste(im, ((i % cols) * (tw + 4), (i // cols) * (th + 4)))
    p = f'{out}/sheet-{si // per + 1:02d}.png'
    sheet.save(p)
    print(p, sheet.size)
