export interface QuizQuestion {
  /** stable id, e.g. "m02-q01" */
  id: string;
  q: string;
  options: string[];
  /** index of the correct option, 0-3 */
  answer: number;
  why: string;
}

/** Keyed by quiz id: a module id (m00..m18) or "primer". */
export type QuizBank = Record<string, QuizQuestion[]>;
