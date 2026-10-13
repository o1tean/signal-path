/* schema.org Course structured data for the home and course pages (https://schema.org/Course,
   Google "Course info" fields: name, description, provider, offers, hasCourseInstance). */
import { tiers } from '@/data/offer';
import { facts } from './site';

export function courseJsonLd(site: URL | undefined, syllabus: { n: number; title: string; href: string }[] = []) {
  const url = new URL('/course', site).href;
  const complete = tiers.find((t) => t.key === 'complete')!;
  const provider = { '@type': 'Organization', name: 'Signal Path', url: new URL('/', site).href };
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Signal Path: the 12-week Flipper Zero course',
    description: `A ${facts.weeks}-week Flipper Zero course: ${facts.lessons} lessons in ${facts.stages} stages, ${facts.tools} browser tools and ${facts.questions} quiz questions, with labs on equipment you own. Modules 0 and 1 are free.`,
    url,
    inLanguage: 'en',
    provider,
    isAccessibleForFree: false,
    educationalLevel: 'Beginner',
    teaches: ['radio frequency', 'modulation', 'Sub-GHz protocols', 'RFID and NFC', 'Flipper Zero app development'],
    offers: [
      { '@type': 'Offer', category: 'Free', price: 0, priceCurrency: complete.currency, url: new URL('/learn/00-setup', site).href },
      { '@type': 'Offer', category: 'Paid', price: complete.price, priceCurrency: complete.currency, url: new URL('/pricing', site).href },
    ],
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: 'PT2H',
      courseSchedule: { '@type': 'Schedule', repeatFrequency: 'P1W', repeatCount: facts.weeks },
    },
    ...(syllabus.length > 0 && {
      syllabusSections: syllabus.map((m) => ({ '@type': 'Syllabus', name: `Module ${m.n}: ${m.title}`, url: new URL(m.href, site).href })),
    }),
  };
}
