import { useStore } from '@nanostores/react';
import { modules } from '@/data/course';
import { $doneCount } from '@/lib/learner';

/** Circular progress: modules marked complete out of every module in src/data/course.ts. Render with client:only (reads localStorage). */
export default function ProgressRing({ size = 56 }: { size?: number }) {
  const done = useStore($doneCount);
  const total = modules.length;
  const r = 15.5;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 36 36" role="img" aria-label={`${done} of ${total} modules complete`}>
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3" className="stroke-muted" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - done / total)}
          transform="rotate(-90 18 18)"
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
        />
        <text x="18" y="21" textAnchor="middle" className="fill-foreground font-mono text-[9px] font-semibold" aria-hidden="true">
          {done}
        </text>
      </svg>
      <p className="m-0 text-sm leading-tight">
        <span className="font-semibold">{done} / {total}</span>
        <span className="block text-muted-foreground">modules complete</span>
      </p>
    </div>
  );
}
