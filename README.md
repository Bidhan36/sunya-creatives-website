# Sunya Creatives website

The website of Sunya Creatives, a cinematic video production and social media studio in Pokhara, Nepal.

Built with Astro (static), GSAP and Lenis. Palette and structure follow auge-xp.com; type is Instrument Sans and Instrument Serif.

## Run it

```bash
npm install
npm run dev            # local preview at http://localhost:4321
npm run build          # production site in ./dist
npm run build:offline  # ./offline: open offline/index.html straight from a folder, no server
```

## Add or edit work

All projects live in `content/projects.json`. Each one points to a folder in `public/work/<name>/` holding:

- `loop.mp4` and `loop.webm`: a 6-second muted loop under 3 MB, cropped to the picture (no black bars)
- `poster.jpg`: the first frame
- `still-1.jpg`, `still-2.jpg`, ...: stills for the project page

Contact details, socials, numbers, clients and founder credits are in `content/site.json`.

To cut a loop from a master file (crop values from `ffmpeg -vf cropdetect`):

```bash
ffmpeg -ss 30 -i master.mp4 -t 6 -an -vf "crop=1920:804:0:138,scale=1280:-2,fps=25" -c:v libx264 -crf 27 -preset veryfast -movflags +faststart loop.mp4
ffmpeg -i loop.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 42 loop.webm
ffmpeg -i loop.mp4 -frames:v 1 -q:v 4 poster.jpg
```

## Enquiries

The Let's talk form needs no server. It opens a ready-written WhatsApp message to +977 976-6596534, or an email to sunyacreatives@gmail.com.

## Deploy on Cloudflare Pages

1. Cloudflare dashboard, Workers & Pages, Create, Pages, Connect to Git, pick this repository.
2. Framework preset: Astro. Build command: `npm run build`. Output directory: `dist`.
3. After the first deploy, open Custom domains and add the domain.
4. Set `url` in `content/site.json` to the final domain so canonical links, the sitemap and share previews point to it.
