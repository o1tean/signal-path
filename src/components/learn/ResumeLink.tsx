import { useStore } from '@nanostores/react';
import { ArrowRight } from 'lucide-react';
import { $nextModule } from '@/lib/learner';

/** "Continue" link to the first module not marked complete. Render with client:only. */
export default function ResumeLink({ titles, className = '' }: { titles: Record<string, string>; className?: string }) {
  const next = useStore($nextModule);
  const href = next ? next.href : '/learn/notebook#review';
  return (
    <a
      href={href}
      className={`group inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${className}`}
    >
      {next ? `Continue: ${next.n} · ${titles[next.id] ?? `Module ${next.n}`}` : 'All modules marked complete. Review your evidence'}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}
