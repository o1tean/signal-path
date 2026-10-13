import { useStore } from '@nanostores/react';
import { badges } from '@/data/course';
import { $learner, badgeEarned } from '@/lib/learner';

/** All 24 badges; earned ones are highlighted. Render with client:only. */
export default function BadgeGrid() {
  const state = useStore($learner);
  const earned = badges.filter((b) => badgeEarned(b.id, state)).length;
  return (
    <div>
      <p className="m-0 text-sm text-muted-foreground">
        {earned} of {badges.length} earned
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => {
          const has = badgeEarned(b.id, state);
          return (
            <li
              key={b.id}
              title={b.how}
              className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${has ? 'border-primary/40 bg-accent text-accent-foreground' : 'border-border text-muted-foreground'}`}
            >
              <span className={`text-lg ${has ? '' : 'opacity-40 grayscale'}`} aria-hidden="true">
                {b.ic}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{b.name}</span>
                <span className="block text-xs">{has ? 'Earned' : b.how}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
