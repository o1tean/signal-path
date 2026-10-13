import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { NavLink } from '@/data/nav';

interface Props {
  links: readonly NavLink[];
  current: string;
  cta: NavLink;
}

/** Small-screen site menu. */
export default function MobileNav({ links, current, cta }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(20rem,85vw)]">
        <SheetHeader>
          <SheetTitle>Signal Path</SheetTitle>
          <SheetDescription>Flipper Zero signals course</SheetDescription>
        </SheetHeader>
        <nav aria-label="Site" className="grid gap-1 px-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={current.startsWith(l.href) ? 'page' : undefined}
              className="flex min-h-11 items-center rounded-md px-3 text-base hover:bg-muted aria-[current=page]:font-semibold aria-[current=page]:text-primary"
            >
              {l.label}
            </a>
          ))}
          <Button asChild className="mt-4">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
