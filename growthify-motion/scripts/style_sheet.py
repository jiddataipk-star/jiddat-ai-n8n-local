"""Style-frame review sheet: 6 key frames on top, reference posts below.
python3 scripts/style_sheet.py <out.png> <ref_dir> frame1.png ... frame6.png"""
import sys
from PIL import Image, ImageDraw, ImageFont
out, ref_dir, frames = sys.argv[1], sys.argv[2], sys.argv[3:]
names = ['1 HOOK', '2 CLIENT INTRO', '3 BUILD', '4 FEATURE CALLOUT', '5 RESULT', '6 END CARD']
refs = ['2-what-we-build.jpg', '10-3-steps.jpg', '13-ad-to-whatsapp.jpg']
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
tw, th, gap = 540, 960, 24
W = gap + 6 * (tw + gap)
rh = 675
H = 80 + th + 110 + rh + gap
sheet = Image.new('RGB', (W, H), (7, 21, 15))
d = ImageDraw.Draw(sheet)
for i, (f, n) in enumerate(zip(frames, names)):
    x = gap + i * (tw + gap)
    sheet.paste(Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS), (x, 80))
    d.text((x, 30), n, font=F, fill=(200, 255, 64))
y = 80 + th + 110
d.text((gap, y - 50), 'REFERENCE POSTS (LIVE FEED)', font=F, fill=(200, 255, 64))
for i, r in enumerate(refs):
    sheet.paste(Image.open(f'{ref_dir}/{r}').convert('RGB').resize((540, rh), Image.LANCZOS), (gap + i * (540 + gap), y))
sheet.save(out)
print(sheet.size)
