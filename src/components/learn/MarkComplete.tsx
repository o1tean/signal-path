import { useStore } from '@nanostores/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { $done, markDone } from '@/lib/learner';

/** Self-reported completion for one module. Render with client:only (reads localStorage). */
export default function MarkComplete({ moduleId }: { moduleId: string }) {
  const done = !!useStore($done)[moduleId];
  return (
    <div
      className={`my-10 flex flex-col gap-4 rounded-card border p-5 sm:flex-row sm:items-center ${done ? 'border-success/40 bg-success-soft' : 'border-border bg-card'}`}
    >
      <p className="m-0 flex-1" aria-live="polite">
        {done ? (
          <>
            <b>Marked complete.</b> The badge is in your dashboard.
          </>
        ) : (
          <>
            <b>Can you explain the result and repeat it?</b> Write the evidence in your notebook, then mark the module
            complete. Completion is self-reported.
          </>
        )}
      </p>
      <Button
        variant={done ? 'outline' : 'default'}
        aria-pressed={done}
        onClick={() => markDone(moduleId, !done)}
      >
        {done && <Check className="size-4" aria-hidden="true" />}
        {done ? 'Mark incomplete' : 'Mark module complete'}
      </Button>
    </div>
  );
}
