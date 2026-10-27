// Render many frames from one bundle: node scripts/stills.mjs <compositionId> <outDir> <frame,frame,...> [scale]
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [id, outDir, framesArg, scaleArg] = process.argv.slice(2);
const frames = framesArg.split(',').map(Number);
const scale = Number(scaleArg || 1);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browser = await openBrowser('chrome');
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
for (const frame of frames) {
  const output = path.join(outDir, `${id}-${String(frame).padStart(5, '0')}.png`);
  await renderStill({ composition, serveUrl, output, frame, scale, puppeteerInstance: browser, overwrite: true });
  console.log('still', output);
}
await browser.close({ silent: true });
