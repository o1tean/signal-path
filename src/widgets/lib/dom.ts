/* Shared helpers for vanilla widgets: element builder, widget shell, hi-DPI canvas, theme tokens. */
import type { WidgetCleanup } from '../types';

type Attrs = Record<string, string | number | boolean | undefined | ((e: Event) => void)>;

/** Tiny element builder. `class` and `text` are special; `on<event>` functions become listeners. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: (Node | string | null | undefined | false)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === 'class') node.className = String(v);
    else if (k === 'text') node.textContent = String(v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) if (c) node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return node;
}

export interface Shell {
  body: HTMLElement;
  foot: (content: Node | string) => HTMLElement;
}

/** Card frame with a title row, body and optional foot. Clears the host. */
export function widgetShell(host: HTMLElement, title: string, sub?: string): Shell {
  host.replaceChildren();
  host.classList.add('sp-widget');
  const head = el('div', { class: 'flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-4 py-3 sm:px-5' }, [
    el('h3', { class: 'm-0 flex items-center gap-2 text-base font-semibold' }, [
      el('span', { class: 'size-2 rounded-full bg-primary', 'aria-hidden': 'true' }),
      title,
    ]),
    sub ? el('p', { class: 'm-0 text-sm text-muted-foreground', text: sub }) : null,
  ]);
  const body = el('div', { class: 'space-y-3 p-4 sm:p-5' });
  host.append(head, body);
  return {
    body,
    foot(content) {
      const f = el('div', { class: 'border-t border-border px-4 py-3 text-sm text-muted-foreground sm:px-5' }, [content]);
      host.append(f);
      return f;
    },
  };
}

/** Read a CSS custom property from <html> (tokens are defined there). */
export const cssVar = (name: string, fallback = '') =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

/** Keep a canvas sharp on hi-DPI screens and redraw on resize. Returns the context and a cleanup. */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): { ctx: CanvasRenderingContext2D; redraw: () => void; cleanup: WidgetCleanup } {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  const redraw = () => {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 200;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, w, h);
  };
  const ro = new ResizeObserver(redraw);
  ro.observe(canvas);
  redraw();
  return { ctx, redraw, cleanup: () => ro.disconnect() };
}

/** Call fn when the site theme (data-theme) or the OS colour scheme changes. */
export function onThemeChange(fn: () => void): WidgetCleanup {
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', fn);
  return () => {
    mo.disconnect();
    mq.removeEventListener('change', fn);
  };
}

/** Segmented control button classes (aria-pressed drives the selected look). */
export const segButton =
  'min-h-11 rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm focus-visible:outline-2 focus-visible:outline-ring';
export const segGroup = 'inline-flex rounded-full border border-border bg-muted p-1';
