import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const moduleId = z.string().regex(/^m(0\d|1[0-8])$/, 'module ids run m00 to m18');

export const lessonSchema = z.object({
  id: moduleId,
  number: z.number().int().min(0).max(18),
  slug: z.string().regex(/^\d{2}-[a-z0-9-]+$/),
  title: z.string().min(3),
  /** meta description, 150 to 160 characters */
  description: z.string().min(150).max(160),
  stage: z.enum(['starter', 'signals', 'atlas', 'build', 'research', 'wifi']),
  week: z.string(),
  access: z.enum(['free', 'paid']),
  minutes: z.number().int().positive(),
  gear: z.array(z.string()).min(1),
  transmits: z.enum(['none', 'own-device', 'lab-only']),
  outcome: z.string().min(10),
  prerequisites: z.array(moduleId),
  tools: z.array(z.string()),
  scenes: z.array(z.string()),
  evidence: z.string().min(10),
  sources: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
  reviewed: z.iso.date(),
  badge: z.string(),
});

export type LessonFrontmatter = z.infer<typeof lessonSchema>;

const lessons = defineCollection({
  loader: glob({ base: './src/content/lessons', pattern: '*.mdx' }),
  schema: lessonSchema,
});

export const collections = { lessons };
