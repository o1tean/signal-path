/* /robots.txt, built from `site` so the sitemap URL follows PUBLIC_SITE_URL. Learner, account and API routes are
   on-demand and noindex already; they are listed here too so crawlers skip them. */
import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      'User-agent: *',
      'Disallow: /learn/',
      'Disallow: /account',
      'Disallow: /checkout/',
      'Disallow: /api/',
      'Disallow: /auth/',
      'Allow: /learn/00-setup',
      'Allow: /learn/01-frequency',
      '',
      `Sitemap: ${new URL('/sitemap-index.xml', site)}`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
