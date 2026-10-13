import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { badgeById } from '@/data/course';
import { onLearnerEvent } from '@/lib/learner';

/** Global toaster. Turns learner-store events into short, polite notices. */
export default function SiteToaster() {
  useEffect(
    () =>
      onLearnerEvent((e) => {
        if (e.type === 'complete') {
          const badge = badgeById(e.module.badge);
          toast.success(`Module ${e.module.n} complete`, {
            description: badge ? `Badge earned: ${badge.ic} ${badge.name}` : undefined,
          });
        } else if (e.type === 'badge' && !e.quiet) {
          const badge = badgeById(e.badgeId);
          if (badge) toast(`Badge earned: ${badge.ic} ${badge.name}`, { description: badge.how });
        } else if (e.type === 'storage-error')
          toast.error('Browser storage is unavailable or full. Export a backup from the notebook before you leave.');
      }),
    [],
  );
  return <Toaster position="bottom-center" />;
}
