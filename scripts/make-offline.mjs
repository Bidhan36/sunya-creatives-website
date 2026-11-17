// Builds ./offline: the same site, openable by double-clicking index.html (no server).
// Absolute links become relative, and module scripts are bundled into classic scripts,
// because browsers block ES modules on file:// pages.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'dist';
const OUT = 'offline';
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const htmls = walk(OUT).filter((f) => f.endsWith('.html'));
const bundled = new Map();
// Fonts are blocked on file:// pages, so the folder version carries them inline.
const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(SRC, 'fonts', f)).toString('base64')})`;
const FONTS = { 'is.woff2': font('is.woff2'), 'iserif-italic.woff2': font('iserif-italic.woff2') };

for (const file of htmls) {
  const rel = path.relative(OUT, file);
  const depth = rel.split(path.sep).length - 1;
  const up = depth ? '../'.repeat(depth) : './';
  let html = fs.readFileSync(file, 'utf8');

  // All module scripts of a page -> one classic bundle (shared code runs once)
  const mods = [...html.matchAll(/<script type="module" src="([^"]+)"><\/script>/g)];
  if (mods.length) {
    const key = mods.map((m) => m[1]).join('|');
    if (!bundled.has(key)) {
      const name = `page-${bundled.size + 1}.classic.js`;
      await build({
        stdin: { contents: mods.map((m) => `import ${JSON.stringify('./' + path.join(SRC, m[1]))};`).join('\n'), resolveDir: process.cwd() },
        bundle: true, format: 'iife', minify: true, target: 'es2019', outfile: path.join(OUT, '_astro', name), logLevel: 'silent',
      });
      bundled.set(key, `/_astro/${name}`);
    }
    mods.forEach(([tag], i) => (html = html.replace(tag, i === 0 ? `<script defer src="${bundled.get(key)}"></script>` : '')));
  }

  html = html.replace(/<link rel="preload"[^>]*fonts\/[^>]*>/g, '');
  html = html.replace(/url\((["']?)\/fonts\/([\w.-]+\.woff2)\1\)/g, (_m, _q, f) => FONTS[f] || _m);

  // Root-absolute paths -> relative, directories -> index.html
  html = html.replace(/(href|src|poster|data-src)=(["'])\/(?!\/)([^"']*)/g, (_m, a, q, p) => {
    const [pathPart, hash = ''] = p.split('#');
    const target = pathPart === '' || pathPart.endsWith('/') ? `${pathPart}index.html` : pathPart;
    return `${a}=${q}${up}${target}${hash ? '#' + hash : ''}`;
  });
  html = html.replace(/url\((["']?)\/(?!\/)/g, (_m, q) => `url(${q}${up}`);
  fs.writeFileSync(file, html);
}
for (const f of walk(path.join(OUT, '_astro'))) if (f.endsWith('.js') && !f.endsWith('.classic.js')) fs.rmSync(f);
console.log(`offline: ${htmls.length} pages, ${bundled.size} script bundles`);
