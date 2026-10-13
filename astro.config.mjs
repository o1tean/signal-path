// @ts-check
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const site = env.PUBLIC_SITE_URL || 'https://signalpath.example';
// `astro build` and `astro check` pre-bundle dependencies in production mode. Sharing node_modules/.vite with the
// running dev server let them overwrite the dev copy of React (jsx-dev-runtime without jsxDEV), which broke every
// island in dev until the cache was cleared (observed 13 October 2026). Only `astro dev` uses the default cache.
const isDev = process.argv.includes('dev');

// Legacy module files keep their slug: /modules/NN-slug.html -> /learn/NN-slug
const lessonSlugs = [
  '00-setup', '01-frequency', '02-modulation', '03-protocols', '04-transmit',
  '05-raw-and-rolling', '06-rfid', '07-nfc', '08-momentum', '09-troubleshooting',
  '10-capstone', '11-infrared', '12-gpio', '13-usb-bluetooth',
  '14-contact-and-authentication', '15-app-development', '16-security-lab',
  '17-mastery', '18-wifi-devboard',
];

/** @type {Record<string, { status: 301; destination: string }>} */
const redirects = {};
const permanent = (/** @type {string} */ from, /** @type {string} */ to) => {
  redirects[from] = { status: 301, destination: to };
};
permanent('/roadmap.html', '/course');
permanent('/legal.html', '/romania-lab-guide');
permanent('/notebook.html', '/learn/notebook');
permanent('/quiz.html', '/learn/quiz');
permanent('/playground.html', '/tools');
permanent('/primer.html', '/primer');
permanent('/reference.html', '/reference');
permanent('/glossary.html', '/glossary');
permanent('/sources.html', '/sources');
permanent('/case-studies.html', '/case-studies');
for (const slug of lessonSlugs) permanent(`/modules/${slug}.html`, `/learn/${slug}`);

export default defineConfig({
  site,
  output: 'server',
  // 1 MB is far above any form or learner-state body (256 KB cap) and keeps oversized requests from being buffered.
  adapter: node({ mode: 'standalone', bodySizeLimit: 1024 * 1024 }),
  // Secrets are read from the host environment at runtime (astro:env/server), never inlined into the server build.
  env: {
    schema: {
      SUPABASE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      STRIPE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      STRIPE_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      STRIPE_PRICE_COMPLETE: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    react(),
    mdx(),
    // learner, account, checkout and dev pages are noindex (docs/v2/copy/meta.md), so they stay out of the sitemap
    sitemap({
      // on-demand pages are not discovered automatically
      customPages: [new URL('/pricing', site).href],
      filter: (page) =>
        !/\/(learn\/(notebook|quiz|atlas)|learn\/?$|account|login|checkout|auth|api|dev)(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  redirects,
  vite: {
    cacheDir: isDev ? 'node_modules/.vite' : 'node_modules/.vite-build',
    plugins: [tailwindcss()],
    // Pre-bundle every client dependency the islands, widgets and scenes import, so a newly discovered
    // import does not force a re-optimisation while several agents and specs share this dev server.
    optimizeDeps: {
      include: [
        "react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime",
        "nanostores", "@nanostores/react", "sonner", "lucide-react", "motion/react",
        "three", "three/addons/loaders/GLTFLoader.js",
      ],
    },
    server: {
      // the e2e credentials file is rewritten by tests; it must not restart the server
      watch: { ignored: ["**/.e2e-user.json"] },
    },
  },
});
