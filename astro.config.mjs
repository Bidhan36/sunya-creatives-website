import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './content/site.json' with { type: 'json' };

// Static output: `npm run build` writes ./dist, which is the folder to drag onto Netlify.
export default defineConfig({
  site: site.url,
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
