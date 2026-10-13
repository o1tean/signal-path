/* Lesson catalogue for server code (.astro frontmatter). Titles, weeks, minutes, access and stage come from the
   lesson frontmatter in src/content/lessons, so there is one source of truth. src/data/course.ts keeps only what the
   client store needs (ids, order, slugs, badges) and the stage descriptions. */
import { getCollection } from 'astro:content';
import { stages, type Stage } from '@/data/course';
import type { LessonFrontmatter } from '@/content.config';

export interface LessonSummary extends Pick<LessonFrontmatter, 'id' | 'slug' | 'title' | 'week' | 'minutes' | 'access' | 'stage' | 'outcome'> {
  n: number;
  href: string;
  free: boolean;
}

export async function getLessons(): Promise<LessonSummary[]> {
  const entries = await getCollection('lessons');
  return entries
    .map(({ data: d }) => ({
      id: d.id,
      n: d.number,
      slug: d.slug,
      href: `/learn/${d.slug}`,
      title: d.title,
      week: d.week,
      minutes: d.minutes,
      access: d.access,
      free: d.access === 'free',
      stage: d.stage,
      outcome: d.outcome,
    }))
    .sort((a, b) => a.n - b.n);
}

export type StageWithLessons = Stage & { lessons: LessonSummary[] };

/** The six stages in order, each with its lessons (grouped by the lesson's `stage` frontmatter). */
export async function getStages(): Promise<StageWithLessons[]> {
  const lessons = await getLessons();
  return stages.map((s) => ({ ...s, lessons: lessons.filter((l) => l.stage === s.id) }));
}

/** id → lesson title, for islands that label modules on the client. */
export async function lessonTitles(): Promise<Record<string, string>> {
  return Object.fromEntries((await getLessons()).map((l) => [l.id, l.title]));
}
