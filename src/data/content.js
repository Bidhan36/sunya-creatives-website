import file from '../../content/projects.json';
import site from '../../content/site.json';

const RATIO = { '2.39': 2.39, '2': 2, '1.85': 1.85, '16:9': 16 / 9, '9:16': 9 / 16, '4:5': 4 / 5, '1:1': 1 };
const W = (p) => `/work/${p}`;

export const media = (folder, aspect = '16:9') =>
  folder
    ? { mp4: W(`${folder}/loop.mp4`), webm: W(`${folder}/loop.webm`), poster: W(`${folder}/poster.jpg`), ratio: RATIO[aspect] ?? 16 / 9 }
    : null;

export const projects = file.projects.map((p, i) => ({
  ...p,
  index: String(i + 1).padStart(3, '0'),
  href: `/works/${p.slug}/`,
  ratio: RATIO[p.aspect] ?? 16 / 9,
  vertical: (RATIO[p.aspect] ?? 1) < 1,
  cover: p.media ? media(p.media, p.aspect) : { poster: W(p.poster), ratio: RATIO[p.aspect] ?? 1 },
  ytPoster: p.ytPoster ? W(p.ytPoster) : null,
  gallery: (p.gallery || []).map(W),
  films: (p.films || []).map((f) => ({ ...f, ...media(f.media, f.aspect) })),
}));

export { site };
