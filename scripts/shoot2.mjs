import puppeteer from 'puppeteer-core';
const base = 'http://localhost:4321';
const out = '/tmp/s2';
const [w, h] = (process.env.SIZE || '1440x900').split('x').map(Number);
const mobile = w < 800;
const mouse = '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', ...(mobile ? [] : [mouse])] });
const page = await browser.newPage();
await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shotAt = async (name, y, settle = 1600) => {
  await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)), y);
  await wait(settle);
  await page.screenshot({ path: `${out}/${w}-${name}.png` });
};
const pages = (process.env.PAGES || 'home,works,project,about,contact').split(',');
for (const p of pages) {
  if (p === 'home') {
    await page.goto(base + '/#intro', { waitUntil: 'networkidle2' });
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(base + '/', { waitUntil: 'networkidle2' });
    await wait(800);
    await page.screenshot({ path: `${out}/${w}-home-0.png` });
    await shotAt('home-1', h * 0.5);
    await shotAt('home-2', h * 1.05);
    await shotAt('home-3', h * 1.7);
    await shotAt('home-4', h * 2.5);
    await shotAt('home-5', h * 3 + 50, 2600);
  }
  if (p === 'works') {
    await page.goto(base + '/works/', { waitUntil: 'networkidle2' });
    await wait(1500);
    await page.screenshot({ path: `${out}/${w}-works-0.png` });
    await shotAt('works-1', h * 1.4);
    if (mobile) await shotAt('works-2', h * 3);
  }
  if (p === 'project') {
    for (const s of (process.env.PROJ || 'honda,hulaki-band').split(',')) {
      await page.goto(base + `/works/${s}/`, { waitUntil: 'networkidle2' });
      await wait(1500);
      await page.screenshot({ path: `${out}/${w}-p-${s}-0.png` });
      await shotAt(`p-${s}-1`, h);
      await shotAt(`p-${s}-2`, h * 2);
    }
  }
  if (p === 'about') {
    await page.goto(base + '/about/', { waitUntil: 'networkidle2' });
    await wait(1600);
    await page.screenshot({ path: `${out}/${w}-about-0.png` });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let i = 1; i <= 5; i++) await shotAt(`about-${i}`, (H - h) * (i / 5));
  }
  if (p === 'contact') {
    await page.goto(base + '/contact/', { waitUntil: 'networkidle2' });
    await wait(1200);
    await page.screenshot({ path: `${out}/${w}-contact-0.png` });
    await shotAt('contact-1', h);
  }
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  if (m.sw > m.cw) console.log('OVERFLOW', p, JSON.stringify(m));
}
await browser.close();
