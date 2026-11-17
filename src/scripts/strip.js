// Infinite work slider. Drifts on its own; wheel, swipe and drag add speed.
// One transform per frame on one layer; never blocks page scrolling.
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function initStrip(root, { ticker, reduced, onActive }) {
  const track = root.querySelector('[data-track]');
  const sets = [...track.querySelectorAll('[data-set]')];
  const first = [...sets[0].children];
  const BASE = reduced ? 0 : 0.55;
  let setW = 1, viewW = 1, offs = [];
  let pos = 0, vel = 0, dir = 1, drag = null, block = false, visible = true, hold = false, active = -1, lastCheck = 0;

  const measure = () => {
    setW = sets[1].offsetLeft - sets[0].offsetLeft || 1;
    viewW = root.clientWidth;
    offs = first.map((t) => ({ l: t.offsetLeft, w: t.offsetWidth }));
  };
  const render = () => {
    const x = ((pos % setW) + setW) % setW;
    const skew = reduced ? 0 : clamp(-vel * 0.25, -5, 5);
    track.style.transform = `translate3d(${-x}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    return x;
  };
  const check = (x) => {
    const now = performance.now();
    if (now - lastCheck < 150) return;
    lastCheck = now;
    const c = (x + viewW / 2) % setW;
    let i = 0;
    offs.forEach((o, k) => c >= o.l && (i = k));
    if (i !== active) ((active = i), onActive?.(i, first[i]));
  };
  ticker.add((_t, dms) => {
    if (!visible) return;
    const dt = clamp((dms || 16.7) / 16.667, 0.2, 3);
    if (!drag) {
      pos += ((hold ? 0 : BASE * dir) + vel) * dt;
      vel *= Math.pow(0.93, dt);
      if (Math.abs(vel) < 0.02) vel = 0;
    }
    check(render());
  });

  addEventListener('wheel', (e) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!d || !visible) return;
    vel = clamp(vel + clamp(d, -120, 120) * 0.045, -60, 60);
    dir = Math.sign(d);
  }, { passive: true });

  root.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, v: 0, axis: null };
  });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.axis) {
      const ax = Math.abs(e.clientX - drag.x), ay = Math.abs(e.clientY - drag.y);
      if (ax + ay < 6) return;
      drag.axis = ax > ay ? 'x' : 'y';
    }
    if (drag.axis === 'y') return void (drag = null);
    const now = performance.now();
    pos -= dx;
    drag.moved += Math.abs(dx);
    drag.v = 0.7 * ((-dx / Math.max(1, now - drag.t)) * 16.667) + 0.3 * drag.v;
    drag.x = e.clientX;
    drag.t = now;
    root.classList.add('is-drag');
  }, { passive: true });
  const up = () => {
    if (!drag) return;
    vel = performance.now() - drag.t > 90 ? 0 : clamp(drag.v, -60, 60);
    if (Math.abs(vel) > 0.6) dir = Math.sign(vel);
    block = drag.moved > 6;
    drag = null;
    root.classList.remove('is-drag');
  };
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
  root.addEventListener('click', (e) => block && (e.preventDefault(), e.stopPropagation(), (block = false)), true);
  root.addEventListener('dragstart', (e) => e.preventDefault());

  root.addEventListener('focusin', (e) => {
    const t = e.target.closest('[data-i]');
    if (!t || !t.matches(':focus-visible')) return;
    const i = Number(t.dataset.i);
    hold = true; vel = 0;
    pos = offs[i].l - (viewW - offs[i].w) / 2;
    root.scrollLeft = 0;
  });
  root.addEventListener('focusout', () => (hold = false));
  if (matchMedia('(hover: hover)').matches) {
    root.addEventListener('pointerenter', () => (hold = true));
    root.addEventListener('pointerleave', () => (hold = false));
  }

  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(root);
  new ResizeObserver(() => (measure(), render())).observe(root);
  measure();
  render();
}
