# Reference notes: auge-xp.com

Status: built from the live markup (fetched 13 Nov 2026) and award listings. NOT yet verified by watching the site in a browser: Claude in Chrome was not connected. Exact easing curves, durations, fonts and cursor behaviour still need a live pass.

## Confirmed from markup
- Home: hero block rendered twice; project list rendered 3× (7 projects → 21 entries) for the infinite strip. Each entry: cover image, h3 title, one category (Website / Installation).
- Scramble headings: e.g. "AUGE EXPERIENCE©RCCS YFZVYTYHHV©" in the raw HTML, i.e. random trailing letters settle client-side. Ornament glyphs ✽ ✦ ➵ © inside headlines.
- Nav: Works (/works), About (/about), Let's talk (/contacts). Logo is an SVG.
- Footer: logo, © year + VAT no., Privacy, Cookies, LinkedIn, Instagram, repeated nav, repeated "Experience" word ×5 (marquee).
- Works: 001–007, cover + title + one category. No filters, no years, no per-project links in markup.
- About: fragmented scramble hero with image/video tiles; 4 Vimeo progressive MP4 loops (3 at 540p, showreel at 1080p); "Play showreel" + Play control; one-sentence statement; 4 capability groups (5/4/5/4 items); awards count (19 now) with rows of year · project · body · award type; ecosystem block; CTAs "Get in Touch" / "View all Projects".
- Contacts: split headline around media, email link, three office blocks (address, phone, map link). No form.
- Stack hints: Next.js (meta-next-size-adjust), Prismic CMS images, Cookiebot, Vimeo video. No GSAP/Lenis/three.js visible in markup (could be bundled).
- Awards: Awwwards SOTD 12 Nov 2026 (score 7.33), FWA, CSSDA.

## To verify live (open items)
- Font families and type scale, easing curves and durations, loader sequence, cursor states, page transitions, sound, mobile layout.

## Sunya departures (deliberate)
- Dark canvas (#0a0a0a) instead of warm off-white, per brand.
- Ornament glyphs replaced by the zero (ring) and the Λ chevron from the Sunya logo.
- Loader: counter ring opens as an iris onto the strip; outlined zeros resolve into S U N Y Λ; counter flies into the nav and becomes the works count.
- Covers support muted video loops (AUGE uses stills on home/works).
- Contact page gets a Netlify form (AUGE has none).
