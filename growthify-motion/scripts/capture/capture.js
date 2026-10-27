// Playwright is used from the container's preinstalled copy; on another machine use require('playwright').
// Final capture of broh.pk screens + element boxes for the video.
// Never submits an order. Phone numbers are masked by mask.js.
const { chromium, devices } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const [kind, out] = process.argv.slice(2);
const M = kind === 'mobile';
const CLEAN = `
  .fixed.bottom-4, [class*="whatsapp-logo-position"] { display: none !important; }
  .fixed.top-0.right-0.h-screen { display: none !important; }
  nav.sticky { position: relative !important; }
  ::-webkit-scrollbar { display: none; }
  button.fixed:not([aria-label="View cart"]) { display: none !important; }
`;
const boxes = {};
async function box(p, name, fn) {
  const r = await p.evaluate(fn);
  if (r) boxes[name] = r; else console.log('NO BOX', name);
}
const byText = (t, nth = 0) => new Function(`
  const els = [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.textContent.trim() === ${JSON.stringify(t)} && e.offsetWidth > 0);
  const e = els[${nth}]; if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, vy: r.y };
`);
const bySel = (s) => new Function(`
  const e = document.querySelector(${JSON.stringify(s)}); if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, vy: r.y };
`);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext(M
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(require('./mask.js'));
  const p = await ctx.newPage();
  const tryit = async (n, f) => { try { await f(); } catch (e) { console.log('FAIL', n, e.message.split('\n')[0]); } };
  const shot = async (n, o = {}) => { await p.screenshot({ path: `${out}/${kind}-${n}.png`, ...o }); console.log('shot', n); };
  const clean = () => p.addStyleTag({ content: CLEAN });
  await p.goto('https://broh.pk/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  await clean();
  // 1. order-type modal
  await shot('ordertype-delivery');
  await box(p, 'ordertype.pickup', byText('Pick-Up'));
  await box(p, 'ordertype.delivery', byText('Delivery'));
  await box(p, 'ordertype.select', byText('Select'));
  await box(p, 'ordertype.dropdown', bySel('[class*="-control"]'));
  await p.locator('[class*="-control"]').first().click({ force: true });
  await p.waitForTimeout(900);
  await shot('ordertype-dropdown');
  await p.getByText('Abbas Park', { exact: true }).first().click();
  await p.waitForTimeout(700);
  await shot('ordertype-selected');
  await p.getByRole('button', { name: 'Select' }).click();
  await p.waitForTimeout(3500);
  // lazy-load everything
  for (let i = 0; i < 30; i++) { await p.evaluate(() => scrollBy(0, 500)); await p.waitForTimeout(350); }
  await p.waitForTimeout(1500);
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(1500);
  await clean();
  // 2. hero slides at top
  for (const n of [1, 2]) {
    await p.locator(`[aria-label="Go to slide ${n}"]`).click().catch(() => {});
    await p.waitForTimeout(1300);
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(400);
    await shot(`top-slide${n}`);
  }
  await p.locator(`[aria-label="Go to slide 1"]`).click().catch(() => {});
  await p.waitForTimeout(1300);
  // 3. full page + boxes (page coords)
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  boxes.pageHeight = H;
  for (const t of ['SANDWICHES', 'BEEFY VIBES', 'Popular Items', 'Smash Divine', 'Original American', 'Famous Smash', 'Trending']) await box(p, 'full.' + t, byText(t));
  await box(p, 'full.SmashDivine.grid', byText('Smash Divine', 1));
  await box(p, 'full.10off', byText('10% OFF'));
  await box(p, 'full.flat10', byText('Flat'));
  await box(p, 'full.search', bySel('input'));
  await box(p, 'full.cart', bySel('[aria-label="View cart"]'));
  await shot('full', { fullPage: true });
  // 4. search
  const s = boxes['full.search'];
  await p.evaluate((y) => scrollTo(0, y), Math.max(0, s.y - (M ? 120 : 160)));
  await p.waitForTimeout(800);
  boxes.searchScroll = await p.evaluate(() => scrollY);
  await shot('search-empty');
  await tryit('search', async () => {
  await p.locator('input').first().click({ force: true, timeout: 5000 });
  await p.keyboard.type('smash', { delay: 110 });
  await p.waitForTimeout(2500);
  await shot('search-typed');
  await p.locator('input').first().fill('', { timeout: 5000 }); });
  await p.waitForTimeout(1500);
  // 5. product modal from popular row
  const card = boxes['full.Smash Divine'];
  const clickScroll = Math.max(0, card.y - (M ? 420 : 560));
  await p.evaluate((y) => scrollTo(0, y), clickScroll);
  await p.waitForTimeout(1000);
  boxes.clickScroll = await p.evaluate(() => scrollY);
  await shot('click-bg');
  await box(p, 'click.card', byText('Smash Divine'));
  const cb = boxes['click.card'];
  await p.mouse.click(cb.x + cb.w / 2, cb.vy + cb.h / 2);
  await p.waitForTimeout(2200);
  await shot('modal-single');
  await box(p, 'modal.double', byText('Double'));
  await box(p, 'modal.single', byText('Single'));
  await box(p, 'modal.addtocart', byText('Add to Cart'));
  await box(p, 'modal.cheese', byText('Cheese'));
  await p.getByText('Double', { exact: true }).first().click();
  await p.waitForTimeout(900);
  await shot('modal-double');
  await box(p, 'modal.addtocart2', byText('Add to Cart'));
  await p.getByRole('button', { name: /Add to Cart/i }).click();
  await p.waitForTimeout(900);
  await shot('added-toast');
  await p.waitForTimeout(4500);
  await shot('added-clean');
  await box(p, 'added.viewcart', byText('View Cart'));
  await box(p, 'added.cartbadge', bySel('[aria-label="View cart"]'));
  await p.getByText('View Cart', { exact: false }).first().click();
  await p.waitForTimeout(2500);
  await shot('cart');
  await box(p, 'cart.popular', byText('Popular with your order'));
  await box(p, 'cart.saved', byText('Yay! You saved Rs. 105'));
  await box(p, 'cart.grand', byText('Grand Total'));
  await box(p, 'cart.checkout', byText('Checkout'));
  await p.getByRole('button', { name: /Checkout/i }).first().click();
  await p.waitForTimeout(5000);
  await clean();
  await p.waitForTimeout(500);
  await shot('checkout');
  await box(p, 'checkout.place', byText('Place Order'));
  await box(p, 'checkout.cod', byText('Cash on Delivery'));
  await box(p, 'checkout.delivery', byText('Delivery Order'));
  boxes.checkoutHeight = await p.evaluate(() => document.documentElement.scrollHeight);
  await shot('checkout-full', { fullPage: true });
  fs.writeFileSync(`${out}/${kind}-boxes.json`, JSON.stringify(boxes, null, 1));
  console.log('PLACE ORDER NOT CLICKED. done');
  await b.close();
})();
