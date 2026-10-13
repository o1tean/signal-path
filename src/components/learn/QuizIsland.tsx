import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { QuizQuestion } from '@/data/quiz/types';
import { $quizBests, recordQuiz } from '@/lib/learner';
import { cn } from '@/lib/utils';

interface Props {
  /** quiz id used for the best score: a module id, "primer" or "mixed" */
  id: string;
  questions: QuizQuestion[];
  shuffle?: boolean;
  limit?: number;
  title?: string;
}

function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}

/** Build one run: optional question shuffle and limit; options are always shuffled so the key letter carries no hint. */
function buildRun(questions: QuizQuestion[], shuffle: boolean, limit: number) {
  let qs = shuffle ? shuffled(questions) : questions.slice();
  if (limit > 0) qs = qs.slice(0, limit);
  return qs.map((q) => {
    const order = shuffled(q.options.map((_, i) => i));
    return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
  });
}

/** One attempt per question, explanation after each answer, best score and perfect-quiz badge via the learner store.
    Render with client:only="react". */
export default function QuizIsland({ id, questions, shuffle = false, limit = 0, title }: Props) {
  const [run, setRun] = useState(0);
  const qs = useMemo(() => buildRun(questions, shuffle, limit), [questions, shuffle, limit, run]);
  const [answers, setAnswers] = useState<(number | null)[]>(() => qs.map(() => null));
  const [result, setResult] = useState<{ perfect: boolean } | null>(null);
  const best = useStore($quizBests)[id];
  // Answering disables the option buttons, which would drop keyboard focus to <body>; move it to the feedback instead.
  const [focusFeedback, setFocusFeedback] = useState<number | null>(null);
  const feedbackRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  useEffect(() => {
    if (focusFeedback !== null) feedbackRefs.current[focusFeedback]?.focus();
  }, [focusFeedback]);

  const correct = answers.filter((a, i) => a !== null && a === qs[i]?.answer).length;
  const answered = answers.filter((a) => a !== null).length;

  function choose(qi: number, oi: number) {
    if (answers[qi] !== null) return;
    const next = answers.slice();
    next[qi] = oi;
    setAnswers(next);
    setFocusFeedback(qi);
    if (next.every((a) => a !== null)) {
      const score = next.filter((a, i) => a === qs[i].answer).length;
      setResult(recordQuiz(id, score, qs.length));
    }
  }

  function retry() {
    setRun((r) => r + 1);
    setAnswers(questions.slice(0, limit > 0 ? limit : undefined).map(() => null));
    setResult(null);
    setFocusFeedback(null);
  }

  if (!qs.length) return <p className="text-muted-foreground">Quiz coming soon.</p>;

  return (
    <section className="not-prose my-6 space-y-5" aria-label={title ?? 'Quiz'}>
      {qs.map((q, qi) => {
        const chosen = answers[qi];
        const qid = `quiz-${id}-${run}-${qi}`;
        return (
          <fieldset key={qid} className="rounded-card border border-border bg-card p-5">
            <legend className="text-xs font-medium text-muted-foreground">
              Question {qi + 1} of {qs.length}
            </legend>
            <p id={qid} className="mt-1 mb-4 font-medium">
              {q.q}
            </p>
            <div role="group" aria-labelledby={qid} className="grid gap-2">
              {q.options.map((opt, oi) => {
                const isRight = chosen !== null && oi === q.answer;
                const isWrong = chosen === oi && oi !== q.answer;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={chosen !== null}
                    aria-pressed={chosen === oi}
                    onClick={() => choose(qi, oi)}
                    className={cn(
                      'flex min-h-11 items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors enabled:hover:border-primary/50 enabled:hover:bg-accent disabled:cursor-default',
                      isRight && 'border-success/60 bg-success-soft',
                      isWrong && 'border-danger/60 bg-danger-soft',
                    )}
                  >
                    <span className="font-mono text-xs font-semibold text-muted-foreground">{String.fromCharCode(65 + oi)}</span>
                    <span className="flex-1">{opt}</span>
                    {isRight && <span className="sr-only">(correct answer)</span>}
                    {isWrong && <span className="sr-only">(your answer, incorrect)</span>}
                  </button>
                );
              })}
            </div>
            {/* read when focus lands here after answering; only the score below is a live region */}
            <p
              ref={(node) => {
                feedbackRefs.current[qi] = node;
              }}
              tabIndex={-1}
              className={cn('mt-3 mb-0 text-sm outline-none focus-visible:outline-2', chosen === null && 'sr-only')}
            >
              {chosen !== null && (
                <>
                  <b className={chosen === q.answer ? 'text-success' : 'text-danger'}>{chosen === q.answer ? 'Correct.' : 'Not quite.'}</b>{' '}
                  {q.why}
                </>
              )}
            </p>
          </fieldset>
        );
      })}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card border border-border bg-muted/50 px-5 py-4">
        <p className="m-0" aria-live="polite">
          {answered > 0 ? (
            <>
              Score: <b>{correct}</b> / {qs.length}
              {answered === qs.length && result && (result.perfect ? '. Perfect score.' : '. Quiz finished.')}
            </>
          ) : (
            <span className="text-muted-foreground">One attempt per question. Your score appears here.</span>
          )}
        </p>
        {best && (
          <p className="m-0 text-sm text-muted-foreground">
            Best: {best.score} / {best.total}
          </p>
        )}
        {answered > 0 && (
          <Button variant="outline" size="sm" className="ml-auto" onClick={retry}>
            Retry
          </Button>
        )}
      </div>
    </section>
  );
}
