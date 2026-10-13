import { useStore } from '@nanostores/react';
import { ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { StageWithLessons } from '@/lib/lessons';
import { $done, $doneCount } from '@/lib/learner';

/** Lesson list in a sheet for small screens. */
export default function LearnNavSheet({ current, stages }: { current?: string; stages: StageWithLessons[] }) {
  const done = useStore($done);
  const count = useStore($doneCount);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Open lesson list">
          <ListTree className="size-4" /> Lessons
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(22rem,90vw)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Lessons</SheetTitle>
          <SheetDescription>
            {count} of {stages.reduce((n, s) => n + s.lessons.length, 0)} modules complete
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Learner pages" className="px-2 text-sm">
          <ul className="mb-4 grid grid-cols-3 gap-1 border-b border-border pb-4">
            {[
              ['/learn', 'My course'],
              ['/learn/notebook', 'Notebook'],
              ['/learn/quiz', 'Quiz'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="flex min-h-11 items-center justify-center rounded-md px-2 hover:bg-muted">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Lessons" className="px-2 pb-6 text-sm">
          {stages.map((stage) => (
            <div key={stage.id} className="mb-5">
              <p className="mb-1 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{stage.title}</p>
              <ol>
                {stage.lessons.map((m) => (
                  <li key={m.id}>
                    <a
                      href={m.href}
                      aria-current={m.id === current ? 'page' : undefined}
                      className="flex min-h-11 items-center gap-2.5 rounded-md px-3 hover:bg-muted aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
                    >
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${done[m.id] ? 'border-success bg-success text-background' : 'border-border'}`}
                      >
                        {m.n}
                      </span>
                      <span className="flex-1">{m.title}</span>
                      {m.free && <span className="pill grey">Free</span>}
                      {done[m.id] && <span className="sr-only">(complete)</span>}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
