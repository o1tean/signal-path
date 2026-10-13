/* SERVER ONLY. Import only from .astro frontmatter or server code, after hasAccess().
   Never import from a React island, widget or client script. Barrel: every ./*.ts file is a quiz, keyed by file name. */
import type { QuizBank } from '../types';

const files = import.meta.glob<{ default: QuizBank[string] }>('./*.ts', { eager: true });

export const paidQuiz: QuizBank = Object.fromEntries(
  Object.entries(files)
    .filter(([path]) => !path.endsWith('/index.ts'))
    .map(([path, mod]) => [path.slice(2, -3), mod.default])
    .sort(([a], [b]) => String(a).localeCompare(String(b))),
);
