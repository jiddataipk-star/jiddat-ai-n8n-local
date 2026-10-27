# Growthify Motion Kit

Case-study videos for Growthify client projects, built with Remotion (React + TypeScript).
Each video ships as a 9:16 Reel and a 16:9 YouTube cut, with SFX synthesized in code and no music.
Series name: **Growthify Builds: [Client]**.

## Render

```bash
npm install
npx remotion browser ensure          # or uncomment setBrowserExecutable in remotion.config.ts
bash scripts/render.sh BrohReel    src/projects/broh/timeline-reel.json out/broh-reel-9x16.mp4
bash scripts/render.sh BrohYouTube src/projects/broh/timeline-yt.json   out/broh-youtube-16x9.mp4
node scripts/stills.mjs BrohCover out/stills 0          # Reel cover 1080×1920
node scripts/stills.mjs BrohThumbnail out/stills 0      # YouTube thumbnail 1280×720
python3 scripts/qa_sheets.py out/broh-reel-9x16.mp4 out/qa-reel   # frame every 0.25 s + safe zones
npx remotion studio                  # live preview
```

`render.sh` renders the video (H.264 High, yuv420p, CRF 16) and synthesizes the SFX track from the timeline JSON (`scripts/sfx.py`).
It then normalizes the sound to −14 LUFS with true peak ≤ −1 dBTP and muxes it as AAC 320k with `+faststart`.

## Layout

| Path | What |
|---|---|
| `src/kit/` | The Motion Kit (reuse for every client) |
| `src/projects/<client>/` | One folder per client: scenes, build walkthrough, timelines, stills |
| `src/projects/<client>/timeline-*.json` | Scene timings + event frames + SFX cues (one source for motion and sound) |
| `public/brand/` | Growthify logo (transparent matte of the official artwork) and symbol |
| `public/clients/<client>/` | Captured screens (phone numbers masked) and measured element boxes |
| `scripts/capture/` | Playwright capture scripts used for broh.pk (masking, element boxes, search states) |
| `docs/` | Storyboard and publishing copy per client |

## Motion Kit parts

These are in `src/kit`:

- **Brand:** `Background` (grid), `Logo`, `LogoWatermark`, `CategoryPill`, `Header`
- **Type:** `KineticHeadline`, with markup `[lime box]`, `{red box}`, `<lime text>` and `|` for a line break; `TypingText`, `Label`, `SubLine`
- **Devices:** `BrowserFrame`, `PhoneFrame`, `LaptopFrame`, `ScreenLayer` / `ScrollingScreenshot`
- **Interaction:** `Cursor` (pointer or touch, curved paths, press and ripple), `CalloutTag`, `CalloutZoom`, `SearchBar`, `Dropdown`, `NotificationToast`, `ChatBubbleFlow`
- **Blocks and transitions:** `FeatureChip`, `ProblemCard`, `StatCounter`, `ContactPill`, `ContactRow`, `EndCard`, `ColourWipe`, `WhipTransition`

## Next client

1. Copy `src/projects/broh` to `src/projects/<client>` and register the compositions in `src/Root.tsx`.
2. Capture the screens with `scripts/capture/` (adapt the selectors). The mask script hides phone numbers.
3. Edit the timelines, captions and `data.ts`.
4. Render the style frames with `scripts/stills.mjs`, then the full cuts, then run the QA sheets.

## Rules

These rules apply to every video:

- Show only real results the client confirmed.
- Blur or mask private data.
- Never show ChatsBuddy.
- Make no "Meta partner" or guaranteed-results claims.
- Use client names and logos only with permission.
