/* Barrel: every ./*.ts file (except this one) is a quiz, keyed by file name. Add a file, not an import. */
import type { QuizBank } from '../types';

const files = import.meta.glob<{ default: QuizBank[string] }>('./*.ts', { eager: true });

export const freeQuiz: QuizBank = Object.fromEntries(
  Object.entries(files)
    .filter(([path]) => !path.endsWith('/index.ts'))
    .map(([path, mod]) => [path.slice(2, -3), mod.default])
    .sort(([a], [b]) => String(a).localeCompare(String(b))),
);
