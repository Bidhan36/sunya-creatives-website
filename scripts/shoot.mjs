// Dev helper: screenshots of the built site at several widths and moments.
import puppeteer from 'puppeteer-core';
const url = process.env.URL || 'http://localhost:4321/';
const out = process.env.OUT || '/tmp/shots';
const sizes = (process.env.SIZES || '1440x900,768x1024,360x740').split(',').map((s) => s.split('x').map(Number));
const times = (process.env.TIMES || '900,2300,3500,6500').split(',').map(Number);
const mouse = '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4';
for (const [w, h] of sizes) {
  const mobile = w < 800;
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', ...(mobile ? [] : [mouse])] });
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  page.on('pageerror', (e) => console.log('PAGEERROR', w, e.message));
  page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', w, m.text()));
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  for (const t of times) {
    const d = t - (Date.now() - t0);
    if (d > 0) await new Promise((r) => setTimeout(r, d));
    await page.screenshot({ path: `${out}/${w}-${t}.png` });
  }
  if (process.env.FOOT) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: `${out}/${w}-foot.png` });
  }
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight, loading: document.body.classList.contains('is-loading') }));
  console.log(w, h, JSON.stringify(m));
  await browser.close();
}
