// Shared behaviour for every page: smooth scroll, menu, cursor, reveals,
// lazy video loops, page transitions, count-ups.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { scramble } from './scramble.js';

gsap.registerPlugin(ScrollTrigger);

export const env = {
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  fine: matchMedia('(hover: hover) and (pointer: fine)').matches,
};

/* ---------- Smooth scroll (wheel and trackpad; touch stays native) ---------- */
export let lenis = null;
if (!env.reduced) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
window.__lenis = lenis;

/* ---------- Light / dark mode ---------- */
const themeBtn = document.querySelector('[data-theme-toggle]');
const themeMeta = document.querySelector('meta[name=theme-color]');
const applyTheme = (t, save) => {
  const root = document.documentElement;
  root.dataset.theme = t;
  if (themeMeta) themeMeta.content = t === 'dark' ? '#141413' : '#edeee5';
  if (themeBtn) {
    const next = t === 'dark' ? 'Light' : 'Dark';
    themeBtn.querySelector('[data-theme-label]').textContent = next;
    themeBtn.setAttribute('aria-label', `Switch to ${next.toLowerCase()} mode`);
  }
  if (save) try { localStorage.setItem('sunya:theme', t); } catch {}
  dispatchEvent(new Event('scroll'));
};
applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light', false);
themeBtn?.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true));
// Follow the system setting live, until the visitor picks one themselves.
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
  let saved = null;
  try { saved = localStorage.getItem('sunya:theme'); } catch {}
  if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
});

/* ---------- Header colour follows the section under it ---------- */
const hd = document.querySelector('.hd');
if (hd) {
  const startDark = document.body.classList.contains('dark-top');
  const probe = () => {
    const r = hd.getBoundingClientRect();
    hd.style.visibility = 'hidden';
    const el = document.elementFromPoint(Math.max(8, innerWidth * 0.03), r.top + r.height / 2);
    hd.style.visibility = '';
    const dark = document.documentElement.dataset.theme === 'dark' || (el ? !!el.closest('.dark') : startDark);
    document.body.classList.toggle('dark-top', dark);
  };
  let lastY = scrollY;
  addEventListener('scroll', () => {
    probe();
    const y = scrollY;
    if (Math.abs(y - lastY) > 6) {
      // On the home page the header always shows once the hero has arrived.
      const rest = document.querySelector('[data-hero]');
      const atRest = rest && Math.abs(rest.getBoundingClientRect().top) < 90;
      hd.classList.toggle('is-away', !atRest && y > lastY && y > 120);
      lastY = y;
    }
  }, { passive: true });
  addEventListener('resize', probe);
  requestAnimationFrame(probe);
}

/* ---------- Menu square ---------- */
const mn = document.querySelector('.mn');
if (mn) {
  const btn = mn.querySelector('.mn__btn');
  const links = [...mn.querySelectorAll('.mn__links a')];
  const set = (open) => {
    mn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.forEach((a) => (a.tabIndex = open ? 0 : -1));
  };
  btn.addEventListener('click', () => set(!mn.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && mn.classList.contains('is-open') && (set(false), btn.focus()));
  document.addEventListener('click', (e) => !mn.contains(e.target) && set(false));
}

/* ---------- Reveals: masked lines and fades ---------- */
const io = new IntersectionObserver(
  (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))),
  { rootMargin: '0px 0px -8% 0px' },
);
export const watch = (root = document) => root.querySelectorAll('[data-reveal],[data-fade]').forEach((el) => io.observe(el));
watch();

/* ---------- Video loops: load and play only near the viewport ---------- */
const vio = new IntersectionObserver(
  (es) =>
    es.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.dataset.ready) {
          v.querySelectorAll('source[data-src]').forEach((s) => (s.src = s.dataset.src));
          v.load();
          v.dataset.ready = '1';
        }
        if (!env.reduced) v.play().catch(() => {});
      } else v.pause();
    }),
  { rootMargin: '200px' },
);
export const loops = (root = document) => root.querySelectorAll('video[data-loop]').forEach((v) => vio.observe(v));
loops();

/* ---------- Count-up numbers ---------- */
document.querySelectorAll('[data-count]').forEach((el) => {
  const to = Number(el.dataset.count);
  const o = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    if (env.reduced) return;
    const s = { v: 0 };
    gsap.to(s, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(s.v)) });
  });
  el.textContent = env.reduced ? to : '0';
  o.observe(el);
});

/* ---------- Cursor + hover tag (mouse only) ---------- */
export const cursor = (() => {
  if (!env.fine) return null;
  const c = document.querySelector('.cur');
  const label = c.querySelector('[data-cur-label]');
  const tag = document.querySelector('.tag');
  document.documentElement.classList.add('has-cursor');
  let x = -100, y = -100, cx = x, cy = y, tx = x, ty = y;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX;
    y = e.clientY;
    const t = e.target instanceof Element ? e.target.closest('[data-cursor]') : null;
    if (t) label.textContent = t.dataset.cursor;
    c.classList.toggle('is-on', !!t);
    c.style.opacity = '';
  }, { passive: true });
  // Leaving the window or moving onto an embedded player: hide the custom cursor and its label.
  document.addEventListener('pointerout', (e) => {
    if (e.relatedTarget && !(e.relatedTarget instanceof HTMLIFrameElement)) return;
    c.classList.remove('is-on');
    c.style.opacity = '0';
  });
  gsap.ticker.add(() => {
    const k = env.reduced ? 1 : 0.2;
    cx += (x - cx) * k; cy += (y - cy) * k;
    tx += (x - tx) * (env.reduced ? 1 : 0.12); ty += (y - ty) * (env.reduced ? 1 : 0.12);
    c.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    tag.style.transform = `translate3d(${tx + 52}px,${ty + 28}px,0)`;
  });
  return {
    tag(d) {
      if (!d) return tag.classList.remove('is-on');
      tag.querySelector('[data-tag-i]').textContent = d.index;
      tag.querySelector('[data-tag-c]').textContent = d.cat;
      scramble(tag.querySelector('[data-tag-t]'), d.title, 380);
      tag.classList.add('is-on');
    },
  };
})();
document.querySelectorAll('[data-tag-title]').forEach((el) => {
  if (!cursor) return;
  el.addEventListener('pointerenter', () => cursor.tag({ index: el.dataset.tagIndex, title: el.dataset.tagTitle, cat: el.dataset.tagCat }));
  el.addEventListener('pointerleave', () => cursor.tag(null));
});

/* ---------- Magnetic links + scramble on hover ---------- */
if (env.fine && !env.reduced) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => (xTo(0), yTo(0)));
    const s = el.querySelector('[data-scramble]');
    if (s) el.addEventListener('pointerenter', () => scramble(s));
  });
}

/* ---------- Page transitions: a black wipe ---------- */
const wipe = document.querySelector('.wipe');
if (wipe && !env.reduced) {
  // GSAP reads the CSS translateY(100%) as y:<px>; zero it so only yPercent moves the curtain.
  gsap.set(wipe, { y: 0, yPercent: document.documentElement.classList.contains('is-wiping') ? 0 : 100 });
  document.documentElement.classList.remove('is-wiping');
  try {
    if (sessionStorage.getItem('sunya:wipe') === '1') {
      sessionStorage.removeItem('sunya:wipe');
      gsap.fromTo(wipe, { y: 0, yPercent: 0 }, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.05, onComplete: () => gsap.set(wipe, { yPercent: 100 }) });
    }
  } catch {}
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || a.hasAttribute('download')) return;
    e.preventDefault();
    try { sessionStorage.setItem('sunya:wipe', '1'); } catch {}
    gsap.fromTo(wipe, { y: 0, yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.in', onComplete: () => (location.href = url.href) });
  });
  addEventListener('pageshow', (e) => e.persisted && gsap.set(wipe, { y: 0, yPercent: 100 }));
}

export { gsap, ScrollTrigger, scramble };
