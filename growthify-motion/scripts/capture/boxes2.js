// Playwright is used from the container's preinstalled copy; on another machine use require('playwright').
// Re-measure buttons whose label is not a leaf text node, replaying the same flow as capture.js.
const { chromium, devices } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const [kind, out] = process.argv.slice(2);
const M = kind === 'mobile';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext(M
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(require('./mask.js'));
  const p = await ctx.newPage();
  const boxes = JSON.parse(fs.readFileSync(`${out}/${kind}-boxes.json`));
  const btn = async (name, re) => {
    const r = await p.evaluate((src) => {
      const re = new RegExp(src, 'i');
      const els = [...document.querySelectorAll('button, a, div, p, span')].filter(e => e.offsetWidth > 0 && re.test(e.innerText || '') && (e.innerText || '').length < 60);
      els.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height);
      const e = els.find(e => e.tagName === 'BUTTON') || els[0]; if (!e) return null;
      const bb = e.getBoundingClientRect(); return { x: bb.x, y: bb.y + scrollY, w: bb.width, h: bb.height, vy: bb.y };
    }, re.source);
    if (r) boxes[name] = r; else console.log('NO', name);
  };
  await p.goto('https://broh.pk/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.locator('[class*="-control"]').first().click({ force: true });
  await p.waitForTimeout(600);
  await p.getByText('Abbas Park', { exact: true }).first().click();
  await p.getByRole('button', { name: 'Select' }).click();
  await p.waitForTimeout(3500);
  for (let i = 0; i < 30; i++) { await p.evaluate(() => scrollBy(0, 500)); await p.waitForTimeout(300); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1500);
  await btn('full.flat10', /^Flat\s*10\s*% Off$/);
  await p.evaluate((y) => scrollTo(0, y), boxes.clickScroll); await p.waitForTimeout(1000);
  const cb = boxes['click.card'];
  await p.mouse.click(cb.x + cb.w / 2, cb.vy + cb.h / 2); await p.waitForTimeout(2200);
  await btn('modal.addtocart', /Add to Cart/);
  await btn('modal.doubleCard', /^Double\s*Rs/);
  await p.getByText('Double', { exact: true }).first().click(); await p.waitForTimeout(900);
  await btn('modal.addtocart2', /Add to Cart/);
  await p.getByRole('button', { name: /Add to Cart/i }).click(); await p.waitForTimeout(5000);
  await btn('added.viewcartBar', /View Cart/);
  await p.getByText('View Cart', { exact: false }).first().click(); await p.waitForTimeout(2500);
  await btn('cart.checkout', /^Checkout/);
  await btn('cart.saved', /You saved/);
  await btn('cart.popularRow', /Popular with your order/);
  boxes.scrollAtCart = await p.evaluate(() => scrollY);
  fs.writeFileSync(`${out}/${kind}-boxes.json`, JSON.stringify(boxes, null, 1));
  console.log(kind, JSON.stringify({ a: boxes['modal.addtocart'], d: boxes['modal.doubleCard'], c: boxes['cart.checkout'], s: boxes['cart.saved'], f: boxes['full.flat10'], v: boxes['added.viewcartBar'] }));
  await b.close();
})();
