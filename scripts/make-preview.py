# Dev helper: copy dist to a relative-path preview for the private artifact page.
import os, re, glob, shutil, json, sys
src, dst = 'dist', '/home/claude/preview2'
shutil.rmtree(dst, ignore_errors=True); shutil.copytree(src, dst); os.chdir(dst)
os.rename('_astro', 'assets')
for f in glob.glob('**/*.html', recursive=True):
    up = '../' * f.count('/') or './'
    s = open(f).read().replace('/_astro/', '/assets/')
    def fix(m):
        attr, q, path = m.groups()
        if path.startswith('//'): return m.group(0)
        p = path.lstrip('/')
        if p == '' or p.endswith('/'): p += 'index.html'
        return f'{attr}={q}{up}{p}'
    s = re.sub(r'(href|src|poster|data-src|action)=(["\'])(/[^"\']*)', fix, s)
    s = re.sub(r'url\((["\']?)/(?!/)', lambda m: f'url({m.group(1)}{up}', s)
    open(f, 'w').write(s)
for f in glob.glob('assets/*.js'):
    s = open(f).read().replace('/_astro/', './'); open(f, 'w').write(s)
L = []
for d, _, fs in os.walk('.'):
    for x in fs:
        p = os.path.join(d, x)[2:]
        if not p.endswith(('.xml', 'robots.txt')): L.append({'as': p, 'path': f'{dst}/{p}'})
json.dump(L, open('/tmp/files.json', 'w'))
print(len(L))
