import { useState } from 'react';
import { Label } from '@/components/ui/label';
import type { QuizBank } from '@/data/quiz/types';
import QuizIsland from './QuizIsland';

interface Props {
  /** banks the visitor may practise, keyed by quiz id */
  banks: QuizBank;
  labels: Record<string, string>;
}

/** Scope picker for the practice page. "mixed" shuffles every available question (legacy quiz.html). */
export default function QuizPractice({ banks, labels }: Props) {
  const ids = Object.keys(banks);
  const [scope, setScope] = useState(ids[0] ?? 'mixed');
  const [count, setCount] = useState(10);
  const all = Object.values(banks).flat();
  const questions = scope === 'mixed' ? all : (banks[scope] ?? []);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 rounded-card border border-border bg-card p-5">
        <div className="grid gap-1.5">
          <Label htmlFor="quiz-scope">Questions from</Label>
          <select id="quiz-scope" value={scope} onChange={(e) => setScope(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3">
            {ids.map((id) => (
              <option key={id} value={id}>
                {labels[id] ?? id}
              </option>
            ))}
            <option value="mixed">All available, shuffled</option>
          </select>
        </div>
        {scope === 'mixed' && (
          <div className="grid gap-1.5">
            <Label htmlFor="quiz-count">How many</Label>
            <select id="quiz-count" value={count} onChange={(e) => setCount(Number(e.target.value))} className="h-11 rounded-md border border-input bg-background px-3">
              {[5, 10, 15, all.length].map((n) => (
                <option key={n} value={n}>
                  {n === all.length ? `All ${n}` : n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <QuizIsland
        key={`${scope}-${count}`}
        id={scope}
        questions={questions}
        shuffle={scope === 'mixed'}
        limit={scope === 'mixed' ? count : 0}
        title="Practice quiz"
      />
    </div>
  );
}
