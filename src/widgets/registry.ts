/* Client-side mounting for <Widget> and <Scene3D> hosts. Imported by the processed <script> in those
   components, so Astro bundles it once per page however many widgets the page has. */
import type { WidgetCleanup, WidgetModule, WidgetOpts } from './types';

const widgetLoaders = import.meta.glob<WidgetModule>(['./*.ts', '!./registry.ts', '!./types.ts']);
const sceneLoader = () => import('./scene3d/index') as Promise<WidgetModule>;

const cleanups = new Map<HTMLElement, WidgetCleanup>();

/** Widget ids that have a module (file name without .ts). */
export const widgetNames = Object.keys(widgetLoaders).map((p) => p.replace(/^\.\/|\.ts$/g, ''));

function parseOpts(host: HTMLElement): WidgetOpts {
  try {
    const parsed: unknown = JSON.parse(host.dataset.opts || '{}');
    return parsed && typeof parsed === 'object' ? (parsed as WidgetOpts) : {};
  } catch {
    return {};
  }
}

function showError(host: HTMLElement, message: string) {
  host.replaceChildren();
  const box = document.createElement('div');
  box.className = 'callout warn';
  box.setAttribute('role', 'status');
  const ic = document.createElement('span');
  ic.className = 'ic';
  ic.setAttribute('aria-hidden', 'true');
  ic.textContent = '!';
  const body = document.createElement('div');
  const title = document.createElement('span');
  title.className = 'callout-title';
  title.textContent = 'This interactive could not load.';
  body.append(title, message);
  box.append(ic, body);
  host.append(box);
}

async function mountOne(host: HTMLElement, load: (() => Promise<WidgetModule>) | undefined, name: string) {
  if (host.dataset.mounted) return;
  host.dataset.mounted = '1';
  // scripts/check-content.ts rejects unknown widget ids, so this only shows up on a hand-written page
  if (!load) return showError(host, `There is no tool called "${name}".`);
  try {
    const mod = await load();
    cleanups.set(host, mod.mount(host, parseOpts(host)));
    host.dataset.mounted = 'ready';
  } catch (e) {
    console.error(`widget ${name}`, e);
    showError(host, e instanceof Error ? e.message : '');
  }
}

/** Mount every unmounted host when it comes near the viewport. Safe to call repeatedly. */
export function mountAll(root: ParentNode = document) {
  const hosts = [...root.querySelectorAll<HTMLElement>('[data-widget]:not([data-mounted]), [data-scene3d]:not([data-mounted])')];
  if (!hosts.length) return;
  const start = (host: HTMLElement) => {
    const scene = host.dataset.scene3d;
    // The home hero shows a static device drawing until three.js (~140 KB compressed) and the GLB arrive, so it
    // waits for an idle moment instead of competing with the first paint.
    if (scene && parseOpts(host).hero === true) {
      const go = () => void mountOne(host, sceneLoader, `scene ${scene}`);
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1500 });
      else setTimeout(go, 1500);
    } else if (scene) void mountOne(host, sceneLoader, `scene ${scene}`);
    else {
      const name = host.dataset.widget ?? '';
      void mountOne(host, widgetLoaders[`./${name}.ts`], name);
    }
  };
  if (!('IntersectionObserver' in window)) return hosts.forEach(start);
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        start(entry.target as HTMLElement);
      }
    },
    { rootMargin: '200px 0px' },
  );
  hosts.forEach((h) => io.observe(h));
}

/** Run every stored cleanup (timers, observers, listeners) and forget the hosts. */
export function unmountAll() {
  for (const [host, cleanup] of cleanups) {
    try {
      cleanup();
    } catch (e) {
      console.error('widget cleanup', e);
    }
    delete host.dataset.mounted;
  }
  cleanups.clear();
}
