import puppeteer from 'puppeteer-core';
const root = 'file:///home/claude/sunya-site/offline/';
const mouse = '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', mouse] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
p.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text().slice(0, 160)));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [name, url, y] of [['home-intro', 'index.html', 1500], ['home', 'index.html', 2800], ['works', 'works/index.html', 1300], ['honda', 'works/honda/index.html', 0], ['contact', 'contact/index.html', 0]]) {
  await p.goto(root + url, { waitUntil: 'load' });
  await p.evaluate(() => sessionStorage.clear());
  await wait(700);
  await p.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)), y);
  await wait(1800);
  const st = await p.evaluate(() => ({ lenis: !!window.__lenis, cursor: document.documentElement.classList.contains('has-cursor'), vids: [...document.querySelectorAll('video')].filter((v) => v.readyState > 1).length, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family) }));
  console.log(name, JSON.stringify(st));
  await p.screenshot({ path: `/tmp/off-${name}.png` });
}
await b.close();
