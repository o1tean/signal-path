import { beforeEach, describe, expect, it } from 'vitest';
import { modules } from '@/data/course';
import {
  $learner,
  STATE_KEY,
  applyBackup,
  badgeEarned,
  createBackup,
  markDone,
  nextModule,
  normalizeState,
  onLearnerEvent,
  parseBackup,
  recordQuiz,
  reloadLearner,
  resetProgress,
  type LearnerEvent,
} from '@/lib/learner';

beforeEach(() => {
  localStorage.clear();
  reloadLearner();
});

describe('completion and badges', () => {
  it('completing a module awards its badge quietly and persists under the legacy key', () => {
    const events: LearnerEvent[] = [];
    const off = onLearnerEvent((e) => events.push(e));
    markDone('m02', true);
    off();
    expect($learner.get().badges['modulation-master']).toBe(true);
    expect(events).toContainEqual({ type: 'badge', badgeId: 'modulation-master', quiet: true });
    expect(events.some((e) => e.type === 'complete')).toBe(true);
    expect(JSON.parse(localStorage.getItem(STATE_KEY)!).done.m02).toBe(true);
  });

  it('un-marking keeps the badge, and resume points at the first incomplete module', () => {
    markDone('m00', true);
    expect(nextModule()?.id).toBe('m01');
    markDone('m00', false);
    expect($learner.get().badges['signal-seeker']).toBe(true);
    expect(nextModule()?.id).toBe('m00');
  });

  it('a perfect quiz awards perfect-quiz; best score keeps the better ratio', () => {
    recordQuiz('m01', 3, 8);
    expect($learner.get().badges['perfect-quiz']).toBeUndefined();
    recordQuiz('m01', 2, 8);
    expect($learner.get().quiz.m01).toEqual({ score: 3, total: 8 });
    const { perfect } = recordQuiz('m01', 8, 8);
    expect(perfect).toBe(true);
    expect($learner.get().badges['perfect-quiz']).toBe(true);
  });

  it('all-clear is awarded when every module is done and only shows while all stay done', () => {
    for (const m of modules) markDone(m.id, true);
    expect($learner.get().badges['all-clear']).toBe(true);
    expect(badgeEarned('all-clear')).toBe(true);
    markDone('m18', false);
    expect(badgeEarned('all-clear')).toBe(false);
  });

  it('reset clears progress but keeps atlas and notes', () => {
    applyBackup({
      done: { m00: true },
      quiz: {},
      badges: {},
      atlas: [{ name: 'Bell', category: 'c', frequency: '433.92', modulation: 'AM', protocol: 'p', codeType: 'fixed', notes: '' }],
      notes: {},
    });
    resetProgress();
    expect($learner.get().done).toEqual({});
    expect($learner.get().atlas).toHaveLength(1);
  });
});

describe('backup and restore', () => {
  it('round-trips through the backup format', () => {
    markDone('m00', true);
    recordQuiz('m00', 6, 6);
    const text = JSON.stringify(createBackup($learner.get(), new Date('2026-10-12T10:00:00Z')));
    localStorage.clear();
    reloadLearner();
    applyBackup(parseBackup(text));
    expect($learner.get().done.m00).toBe(true);
    expect($learner.get().quiz.m00).toEqual({ score: 6, total: 6 });
    expect($learner.get().badges['perfect-quiz']).toBe(true);
  });

  it('imports a legacy v1 backup file and drops unknown keys', () => {
    const legacy = {
      format: 'signal-path-backup',
      version: 1,
      exportedAt: '2026-09-01T08:00:00.000Z',
      state: {
        done: { m00: true, m01: false, m99: true },
        quiz: { m00: { score: 5, total: 6 }, mixed: { score: 10, total: 12 } },
        badges: { 'signal-seeker': true, 'made-up': true },
        atlas: [{ name: 'Doorbell', category: 'Chime', frequency: '433.92', modulation: 'AM', protocol: 'Princeton', codeType: 'fixed', notes: 'own device', sample: true }],
        notes: {
          m00: { setup: 'Official fw', prediction: 'jump', observation: 'jumped', explanation: 'carrier', review: '2026-09-02', retrieved: '', updated: '2026-09-01T08:00:00.000Z' },
        },
        flashIndex: 4,
      },
    };
    const restored = parseBackup(JSON.stringify(legacy));
    expect(restored.done).toEqual({ m00: true, m01: false });
    expect(restored.quiz.mixed).toEqual({ score: 10, total: 12 });
    expect(restored.badges).toEqual({ 'signal-seeker': true });
    expect(restored.atlas[0].sample).toBe(true);
    expect(restored.notes.m00.review).toBe('2026-09-02');
    expect('flashIndex' in restored).toBe(false);
  });

  it('rejects bad files with the legacy messages', () => {
    expect(() => parseBackup('{nope')).toThrow('Invalid JSON. Your data was not changed.');
    expect(() => parseBackup(JSON.stringify({ format: 'x', version: 1, state: {} }))).toThrow(/not a valid Signal Path backup/);
    expect(() => parseBackup('{}', 2 * 1024 * 1024)).toThrow(/larger than 1 MB/);
  });

  it('normalises corrupt stored state like the legacy loader', () => {
    expect(normalizeState([1, 2])).toEqual({ done: {}, quiz: {}, badges: {}, atlas: [], notes: {} });
    expect(normalizeState({ done: 'x', atlas: [null, { name: 'a' }] }).atlas).toEqual([{ name: 'a' }]);
  });
});
