"""Tile PNG frames into one sheet: python3 scripts/sheet.py out.png cols tile_w img1 img2 ..."""
import sys
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
tiles = []
for f in files:
    im = Image.open(f).convert('RGB')
    t = im.resize((tw, round(im.height * tw / im.width)), Image.LANCZOS)
    d = ImageDraw.Draw(t)
    label = f.rsplit('/', 1)[-1].rsplit('.', 1)[0].split('-')[-1]
    d.rectangle((0, 0, 8 + 7 * len(label), 16), fill='black')
    d.text((4, 2), label, fill='white')
    tiles.append(t)
rows = (len(tiles) + cols - 1) // cols
th = max(t.height for t in tiles)
sheet = Image.new('RGB', (cols * tw + (cols - 1) * 6, rows * th + (rows - 1) * 6), (40, 40, 40))
for i, t in enumerate(tiles):
    sheet.paste(t, ((i % cols) * (tw + 6), (i // cols) * (th + 6)))
sheet.save(out)
print(sheet.size)
