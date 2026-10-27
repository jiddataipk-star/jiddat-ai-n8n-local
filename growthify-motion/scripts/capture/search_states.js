// Playwright is used from the container's preinstalled copy; on another machine use require('playwright').
// Desktop search typing states: one screenshot per typed character.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const out = process.argv[2];
const CLEAN = `.fixed.bottom-4, [class*="whatsapp-logo-position"] { display: none !important; }
  .fixed.top-0.right-0.h-screen { display: none !important; } nav.sticky { position: relative !important; }
  ::-webkit-scrollbar { display: none; } button.fixed:not([aria-label="View cart"]) { display: none !important; }`;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(require('./mask.js'));
  const p = await ctx.newPage();
  await p.goto('https://broh.pk/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.locator('[class*="-control"]').first().click({ force: true });
  await p.waitForTimeout(600);
  await p.getByText('Abbas Park', { exact: true }).first().click();
  await p.getByRole('button', { name: 'Select' }).click();
  await p.waitForTimeout(3500);
  await p.addStyleTag({ content: CLEAN });
  for (let i = 0; i < 30; i++) { await p.evaluate(() => scrollBy(0, 500)); await p.waitForTimeout(300); }
  await p.evaluate(() => scrollTo(0, 616)); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/desktop-search-0.png` });
  await p.locator('input').first().click({ force: true });
  await p.waitForTimeout(500);
  const word = 'smash';
  for (let i = 1; i <= word.length; i++) {
    await p.keyboard.type(word[i - 1]);
    await p.waitForTimeout(1600);
    await p.evaluate(() => scrollTo(0, 616)); await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/desktop-search-${i}.png` });
    console.log('state', i, await p.evaluate(() => scrollY));
  }
  await b.close();
})();
