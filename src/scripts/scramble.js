// Letters start at zero, shuffle, and settle left to right.
const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function scramble(el, text, duration = 520) {
  if (!el) return;
  const final = text ?? el.dataset.text ?? el.textContent;
  el.dataset.text = final;
  cancelAnimationFrame(el._s || 0);
  if (reduced()) return void (el.textContent = final);
  const chars = [...final];
  const n = chars.length;
  const at = chars.map((_, i) => duration * (0.25 + 0.65 * (i / Math.max(1, n - 1))));
  const t0 = performance.now();
  let last = 0;
  const step = (now) => {
    const t = now - t0;
    if (now - last > 40) {
      last = now;
      let out = '';
      let done = true;
      for (let i = 0; i < n; i++) {
        const c = chars[i];
        if (/\s|[^\p{L}\p{N}]/u.test(c) || t >= at[i]) out += c;
        else {
          done = false;
          out += t < duration * 0.18 ? '0' : POOL[(Math.random() * POOL.length) | 0];
        }
      }
      el.textContent = out;
      if (done) return void (el.textContent = final);
    }
    el._s = requestAnimationFrame(step);
  };
  el._s = requestAnimationFrame(step);
}
