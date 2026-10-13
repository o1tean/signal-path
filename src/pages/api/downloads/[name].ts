/* GET /api/downloads/:name streams a paid file from private/downloads after hasAccess(). */
import type { APIRoute } from 'astro';
import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { hasAccess, NO_STORE } from '@/lib/access';

// Resolved from the working directory, so the deployed server must run from the project root (see docs/v2/deploy.md).
const DIR = join(process.cwd(), 'private', 'downloads');
const TYPES: Record<string, string> = { md: 'text/markdown; charset=utf-8', pdf: 'application/pdf', zip: 'application/zip' };

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.user) return Response.json({ error: 'sign-in-required' }, { status: 401, headers: NO_STORE });
  if (!hasAccess(locals, 'paid')) return Response.json({ error: 'not-entitled' }, { status: 403, headers: NO_STORE });

  // Only names that exist in the folder are served, so "../" and friends never reach the filesystem.
  const name = params.name ?? '';
  const files = await readdir(DIR).catch(() => [] as string[]);
  if (name.startsWith('.') || name === 'README.md' || !files.includes(name)) return Response.json({ error: 'not-found' }, { status: 404, headers: NO_STORE });

  const ext = name.split('.').pop() ?? '';
  return new Response(Readable.toWeb(createReadStream(join(DIR, name))) as ReadableStream, {
    headers: {
      ...NO_STORE,
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${name}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
