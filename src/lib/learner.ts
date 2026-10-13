/* Local-first learner store, ported from legacy site.js + learning.js.
   Same localStorage keys and the same JSON backup format (format "signal-path-backup", version 1),
   so learners from the old site keep their progress. Widgets and islands talk to it through these exports only. */
import { atom, computed } from 'nanostores';
import { badges, modules, type CourseModule } from '@/data/course';

export const STATE_KEY = 'signalpath.v2';
export const THEME_KEY = 'signalpath.theme';
export const MOTION_KEY = 'signalpath.motion';

export interface QuizBest {
  score: number;
  total: number;
}
export interface NoteEntry {
  setup: string;
  prediction: string;
  observation: string;
  explanation: string;
  /** YYYY-MM-DD or "" */
  review: string;
  /** YYYY-MM-DD or "" */
  retrieved: string;
  /** ISO 8601 */
  updated: string;
}
export interface AtlasRow {
  name: string;
  category: string;
  frequency: string;
  modulation: string;
  protocol: string;
  codeType: string;
  notes: string;
  sample?: true;
}
/** The persisted shape under signalpath.v2. flashIndex and tuneIn are widget extras (not in backups). */
export interface LearnerState {
  done: Record<string, boolean>;
  quiz: Record<string, QuizBest>;
  badges: Record<string, boolean>;
  atlas: AtlasRow[];
  notes: Record<string, NoteEntry>;
  flashIndex?: number;
  flashTerm?: string;
  tuneIn?: { best: number };
}
export type BackupState = Pick<LearnerState, 'done' | 'quiz' | 'badges' | 'atlas' | 'notes'>;
export interface BackupFile {
  format: 'signal-path-backup';
  version: 1;
  exportedAt: string;
  state: LearnerState;
}

export type LearnerEvent =
  | { type: 'badge'; badgeId: string; quiet: boolean }
  | { type: 'complete'; module: CourseModule }
  | { type: 'storage-error' };

const isObject = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === 'object' && !Array.isArray(x);

export const emptyState = (): LearnerState => ({ done: {}, quiz: {}, badges: {}, atlas: [], notes: {} });

/** Legacy load() normalisation: anything unparseable becomes an empty state. */
export function normalizeState(raw: unknown): LearnerState {
  const s: Record<string, unknown> = isObject(raw) ? { ...raw } : {};
  for (const key of ['done', 'quiz', 'badges', 'notes']) if (!isObject(s[key])) s[key] = {};
  s.atlas = Array.isArray(s.atlas) ? s.atlas.filter(isObject) : [];
  return s as unknown as LearnerState;
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function readState(): LearnerState {
  try {
    const raw = storage()?.getItem(STATE_KEY);
    return normalizeState(raw ? JSON.parse(raw) : {});
  } catch {
    return emptyState();
  }
}

/* ---------- events (toasts, confetti) ---------- */
const listeners = new Set<(e: LearnerEvent) => void>();
export function onLearnerEvent(fn: (e: LearnerEvent) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const emit = (e: LearnerEvent) => listeners.forEach((fn) => fn(e));

/* ---------- the store ---------- */
export const $learner = atom<LearnerState>(typeof window === 'undefined' ? emptyState() : readState());

export const $done = computed($learner, (s) => s.done);
export const $quizBests = computed($learner, (s) => s.quiz);
export const $badges = computed($learner, (s) => s.badges);
export const $atlas = computed($learner, (s) => s.atlas);
export const $notes = computed($learner, (s) => s.notes);
export const $doneCount = computed($learner, (s) => doneCount(s));
/** Resume target: first module in course order not marked done, or null when all are done. */
export const $nextModule = computed($learner, (s) => nextModule(s));

/** Replace the state and persist it. Returns false when browser storage failed (state stays in memory). */
export function commit(next: LearnerState): boolean {
  $learner.set(next);
  try {
    const store = storage();
    if (!store) throw new Error('no storage');
    store.setItem(STATE_KEY, JSON.stringify(next));
    noteLocalChange();
    return true;
  } catch {
    emit({ type: 'storage-error' });
    return false;
  }
}

/** Escape hatch for widgets: derive a new state from the current one and persist it. */
export const updateLearner = (fn: (s: LearnerState) => LearnerState) => commit(fn($learner.get()));

/** Re-read storage (used when another tab changes it). */
export const reloadLearner = () => $learner.set(readState());

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STATE_KEY) reloadLearner();
  });
}

/* ---------- progress and badges ---------- */
export const isDone = (id: string, s: LearnerState = $learner.get()) => !!s.done[id];
export const doneCount = (s: LearnerState = $learner.get()) => modules.filter((m) => s.done[m.id]).length;
export const nextModule = (s: LearnerState = $learner.get()) => modules.find((m) => !s.done[m.id]) ?? null;

/** Earned for display. All Clear only shows while every module is still marked done (legacy rule). */
export const badgeEarned = (id: string, s: LearnerState = $learner.get()) =>
  !!s.badges[id] && (id !== 'all-clear' || doneCount(s) === modules.length);

/** Award once. Returns false when already earned or unknown. */
export function award(badgeId: string, quiet = false): boolean {
  const s = $learner.get();
  if (s.badges[badgeId] || !badges.some((b) => b.id === badgeId)) return false;
  commit({ ...s, badges: { ...s.badges, [badgeId]: true } });
  emit({ type: 'badge', badgeId, quiet });
  return true;
}

/** Mark a module done or not. Completing awards its badge, and All Clear when every module is done (both quiet).
    Un-marking keeps badges. */
export function markDone(id: string, done: boolean): boolean {
  const s = $learner.get();
  const was = !!s.done[id];
  const stored = commit({ ...s, done: { ...s.done, [id]: done } });
  const mod = modules.find((m) => m.id === id);
  if (done && !was && mod) {
    award(mod.badge, true);
    if (doneCount() === modules.length) award('all-clear', true);
    emit({ type: 'complete', module: mod });
  }
  return stored;
}

/** Record a finished quiz. Keeps the best ratio (ties go to the longer quiz). A perfect run awards perfect-quiz. */
export function recordQuiz(id: string, score: number, total: number): { best: QuizBest; perfect: boolean } {
  const s = $learner.get();
  const prev = s.quiz[id];
  const better =
    !prev ||
    score / total > prev.score / prev.total ||
    (score / total === prev.score / prev.total && total >= prev.total);
  const best = better ? { score, total } : prev;
  commit({ ...s, quiz: { ...s.quiz, [id]: best } });
  const perfect = total > 0 && score === total;
  if (perfect) award('perfect-quiz');
  return { best, perfect };
}

/** Reset completion, quiz scores and badges. Atlas and notebook are kept (legacy resetAll). */
export const resetProgress = () => {
  const s = $learner.get();
  return commit({ done: {}, quiz: {}, badges: {}, atlas: s.atlas, notes: s.notes });
};

/* ---------- notebook ---------- */
export const today = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export type NoteFields = Pick<NoteEntry, 'setup' | 'prediction' | 'observation' | 'explanation' | 'review'>;

/** Save a notebook entry. retrieved=true records today's date as "explained without notes". */
export function saveNote(moduleId: string, fields: NoteFields, retrieved = false, now = new Date()): boolean {
  const s = $learner.get();
  const note: NoteEntry = {
    setup: fields.setup.trim(),
    prediction: fields.prediction.trim(),
    observation: fields.observation.trim(),
    explanation: fields.explanation.trim(),
    review: fields.review.trim(),
    updated: now.toISOString(),
    retrieved: retrieved ? today(now) : (s.notes[moduleId]?.retrieved ?? ''),
  };
  return commit({ ...s, notes: { ...s.notes, [moduleId]: note } });
}

export const setAtlas = (rows: AtlasRow[]) => commit({ ...$learner.get(), atlas: rows });

/* ---------- backup and restore ---------- */
export const backupFilename = (d: Date = new Date()) => `signal-path-${today(d)}.json`;

export const createBackup = (s: LearnerState = $learner.get(), now = new Date()): BackupFile => ({
  format: 'signal-path-backup',
  version: 1,
  exportedAt: now.toISOString(),
  state: s,
});

export class BackupError extends Error {}
export const BACKUP_MAX_BYTES = 1024 * 1024;
const INVALID = 'This file is not a valid Signal Path backup. Your data was not changed.';

/** Validate a backup file (legacy v1 format) and return only the known, clean fields. Throws BackupError. */
export function migrateLegacyBackup(payload: unknown): BackupState {
  const fail = (): never => {
    throw new BackupError(INVALID);
  };
  const str = (x: unknown, max: number): x is string => typeof x === 'string' && x.length <= max;
  const date = (x: unknown) =>
    x === '' || (str(x, 10) && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x)));

  if (!isObject(payload) || payload.format !== 'signal-path-backup' || payload.version !== 1 || !isObject(payload.state))
    fail();
  const input = (payload as { state: Record<string, unknown> }).state;
  if (
    !isObject(input.done) ||
    !isObject(input.quiz) ||
    !isObject(input.badges) ||
    !isObject(input.notes) ||
    !Array.isArray(input.atlas) ||
    input.atlas.length > 500
  )
    fail();
  const done = input.done as Record<string, unknown>;
  const notes = input.notes as Record<string, unknown>;
  const quiz = input.quiz as Record<string, unknown>;
  const badgeIn = input.badges as Record<string, unknown>;
  const out: BackupState = { done: {}, quiz: {}, badges: {}, atlas: [], notes: {} };
  const ids = modules.map((m) => m.id);

  for (const id of ids) {
    if (id in done) {
      if (typeof done[id] !== 'boolean') fail();
      out.done[id] = done[id] as boolean;
    }
    if (id in notes) {
      const note = notes[id];
      if (!isObject(note)) return fail();
      for (const key of ['setup', 'prediction', 'observation', 'explanation']) if (!str(note[key], 6000)) fail();
      if (!date(note.review) || !date(note.retrieved)) fail();
      if (!str(note.updated, 40) || Number.isNaN(Date.parse(note.updated))) fail();
      out.notes[id] = {
        setup: note.setup as string,
        prediction: note.prediction as string,
        observation: note.observation as string,
        explanation: note.explanation as string,
        review: note.review as string,
        retrieved: note.retrieved as string,
        updated: note.updated as string,
      };
    }
  }
  for (const id of [...ids, 'primer', 'mixed']) {
    if (!(id in quiz)) continue;
    const q = quiz[id];
    if (!isObject(q)) return fail();
    if (
      !Number.isInteger(q.score) ||
      !Number.isInteger(q.total) ||
      (q.total as number) < 1 ||
      (q.total as number) > 1000 ||
      (q.score as number) < 0 ||
      (q.score as number) > (q.total as number)
    )
      fail();
    out.quiz[id] = { score: q.score as number, total: q.total as number };
  }
  for (const b of badges) {
    if (b.id in badgeIn) {
      if (typeof badgeIn[b.id] !== 'boolean') fail();
      out.badges[b.id] = badgeIn[b.id] as boolean;
    }
  }
  out.atlas = (input.atlas as unknown[]).map((row) => {
    if (!isObject(row)) return fail();
    const clean = {} as AtlasRow;
    for (const key of ['name', 'category', 'frequency', 'modulation', 'protocol', 'codeType', 'notes'] as const) {
      if (!str(row[key], 10000)) fail();
      clean[key] = row[key] as string;
    }
    if (row.sample === true) clean.sample = true;
    return clean;
  });
  return out;
}

/** Parse and validate backup text. Throws BackupError with a learner-facing message. */
export function parseBackup(text: string, byteSize = text.length): BackupState {
  if (byteSize > BACKUP_MAX_BYTES) throw new BackupError('Backup is larger than 1 MB. Your data was not changed.');
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new BackupError('Invalid JSON. Your data was not changed.');
  }
  return migrateLegacyBackup(payload);
}

/** Replace progress, atlas and notebook wholesale (no merge). Widget extras are kept. */
export const applyBackup = (restored: BackupState) => commit({ ...$learner.get(), ...restored });

/* ---------- theme and motion ---------- */
export type Theme = 'light' | 'dark';
export type Motion = 'paused' | 'playing';

const readKey = (key: string) => {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
const writeKey = (key: string, value: string) => {
  try {
    storage()?.setItem(key, value);
  } catch {
    /* preference stays for this page view */
  }
};

/** Stored choice; null = follow the OS. */
export const $theme = atom<Theme | null>(null);
export const $motion = atom<Motion>('playing');

if (typeof window !== 'undefined') {
  const t = readKey(THEME_KEY);
  $theme.set(t === 'light' || t === 'dark' ? t : null);
  $motion.set(readKey(MOTION_KEY) === 'paused' ? 'paused' : 'playing');
}

export function effectiveTheme(): Theme {
  const set = $theme.get();
  if (set) return set;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  $theme.set(theme);
  document.documentElement.setAttribute('data-theme', theme);
  writeKey(THEME_KEY, theme);
}
export const toggleTheme = () => setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Decorative animation allowed: not paused by the site toggle and not reduced by the OS. */
export const animationAllowed = () => $motion.get() === 'playing' && !prefersReducedMotion();

export function setMotion(motion: Motion) {
  $motion.set(motion);
  document.documentElement.classList.toggle('motion-off', motion === 'paused' || prefersReducedMotion());
  writeKey(MOTION_KEY, motion);
}

/* ---------- account sync (signed in only) ----------
   Local storage stays the source the UI reads. When <html data-signed-in="true">, each change is stamped and pushed
   to /api/learner-state after a quiet period; on page load the newer side wins (last write wins by updatedAt).
   A change made just before leaving the page is not lost: its stamp is newer, so the next load pushes it.
   (No `keepalive`: it caps bodies at 64 KB and the state may be up to 256 KB.) */
export const SYNC_STAMP_KEY = 'signalpath.v2.updatedAt';
const SYNC_DELAY_MS = 2000;
let syncTimer: ReturnType<typeof setTimeout> | undefined;
let applyingRemote = false;

const signedIn = () => typeof document !== 'undefined' && document.documentElement.dataset.signedIn === 'true';
const readStamp = () => {
  try {
    return storage()?.getItem(SYNC_STAMP_KEY) ?? null;
  } catch {
    return null;
  }
};
const writeStamp = (iso: string) => {
  try {
    storage()?.setItem(SYNC_STAMP_KEY, iso);
  } catch {
    /* sync just retries next load */
  }
};

function noteLocalChange() {
  if (applyingRemote) return;
  writeStamp(new Date().toISOString());
  if (!signedIn()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => void pushLearner(), SYNC_DELAY_MS);
}

function applyRemote(remote: { state: unknown; updatedAt: string }) {
  applyingRemote = true;
  try {
    commit(normalizeState(remote.state));
  } finally {
    applyingRemote = false;
  }
  writeStamp(new Date(remote.updatedAt).toISOString());
}

async function pushLearner(): Promise<void> {
  const updatedAt = readStamp() ?? new Date().toISOString();
  writeStamp(updatedAt);
  const res = await fetch('/api/learner-state', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state: $learner.get(), updatedAt }),
  }).catch(() => null);
  if (res?.status === 409) applyRemote(await res.json());
}

/** Reconcile with the account once: pull when the server copy is newer, push when this browser is. */
export async function syncLearner(): Promise<'off' | 'pulled' | 'pushed' | 'same'> {
  if (!signedIn()) return 'off';
  const res = await fetch('/api/learner-state', { headers: { accept: 'application/json' } }).catch(() => null);
  if (!res?.ok) return 'off';
  const remote = (await res.json()) as { state: unknown; updatedAt: string | null };
  const stamp = readStamp();
  const remoteT = remote.updatedAt ? Date.parse(remote.updatedAt) : -1;
  const localT = stamp ? Date.parse(stamp) : 0;
  if (remote.updatedAt && remoteT > localT) {
    applyRemote(remote as { state: unknown; updatedAt: string });
    return 'pulled';
  }
  if (localT > remoteT) {
    await pushLearner();
    return 'pushed';
  }
  return 'same';
}

if (typeof window !== 'undefined') void syncLearner();
