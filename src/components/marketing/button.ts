/* Button look shared by <LinkButton>, <BuyButton> and plain <button> elements on the auth, account and checkout
   pages. Heights 44px (md) and 48px (lg) meet the touch-target minimum. */
export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'inverse';

export function buttonClass(variant: ButtonVariant = 'primary', size: 'md' | 'lg' = 'lg') {
  return [
    'group inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-60',
    size === 'lg' ? 'h-12 text-[0.975rem]' : 'h-11 text-sm',
    variant === 'quiet' ? 'px-2' : size === 'lg' ? 'px-6' : 'px-5',
    variant === 'primary' &&
      'bg-primary text-primary-foreground shadow-[0_1px_2px_oklch(0_0_0/0.12)] hover:bg-primary/90',
    variant === 'secondary' && 'border border-border bg-card text-foreground hover:border-foreground/25 hover:bg-muted',
    variant === 'inverse' && 'border border-white/25 text-white hover:border-white/50 hover:bg-white/10',
    variant === 'quiet' && 'text-foreground underline decoration-border underline-offset-[6px] hover:decoration-primary',
  ]
    .filter(Boolean)
    .join(' ');
}
