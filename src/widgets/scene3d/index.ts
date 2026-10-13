/* <Scene3D> runtime: one WebGL renderer per host, loop paused offscreen, on hidden tabs and when
   motion is off (drag and arrow keys still rotate). Static fallback when WebGL or the model fails.
   The registry imports this module lazily, so three.js only loads on pages with a scene. */
import * as THREE from 'three';
import { $motion, animationAllowed } from '@/lib/learner';
import { lcd, LCD_H, LCD_W, type SpriteName } from '@/lib/pixel';
import type { WidgetMount } from '../types';
import { clamp, disposeTree, studioEnv } from './kit';
import { builders, type SceneApi, type SceneUpdate, type View } from './scenes';

export const SCENES = ['flipper', 'devboard', 'carrier', 'modulation', 'pulses', 'rolling', 'nearfield', 'infrared', 'gpio'] as const;
export type SceneName = (typeof SCENES)[number];

const DEFAULT_LABEL = 'Interactive 3D illustration. Drag or use arrow keys to rotate.';

/* static fallback: an illustration for the device scenes, a pixel LCD card for the concept scenes */
const FALLBACK_IMG: Partial<Record<string, string>> = { flipper: 'images/device.svg', devboard: 'images/wifi-board.svg' };
const FALLBACK_LCD: Record<string, [SpriteName, string, string]> = {
  carrier: ['antenna', 'CARRIER', '315 / 433.92 MHZ'],
  modulation: ['wave', 'MODULATION', 'OOK VS FSK'],
  pulses: ['pulses', 'PULSES', 'LONG / SHORT'],
  rolling: ['key', 'ROLLING CODE', 'COUNTER 0042'],
  nearfield: ['card', 'NEAR FIELD', '125 KHZ / 13.56'],
  infrared: ['ir', 'INFRARED', '38 KHZ  940 NM'],
  gpio: ['pins', 'GPIO', 'PA7 > LED > GND'],
};

function showFallback(host: HTMLElement, stage: HTMLElement, name: string, ariaLabel: string) {
  host.dataset.sceneState = 'fallback';
  const src = FALLBACK_IMG[name];
  let node: HTMLElement;
  if (src) {
    const img = document.createElement('img');
    img.src = import.meta.env.BASE_URL.replace(/\/?$/, '/') + src;
    img.alt = ariaLabel;
    node = img;
  } else {
    const c = document.createElement('canvas');
    c.width = LCD_W;
    c.height = LCD_H;
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', ariaLabel);
    c.style.imageRendering = 'pixelated';
    const [icon, title, line] = FALLBACK_LCD[name] ?? ['logo', name.toUpperCase(), ''];
    const ctx = c.getContext('2d');
    if (ctx) lcd(ctx, { title, icon, lines: [line], foot: 'STATIC VIEW', right: 'OK >' });
    node = c;
  }
  node.className = 'mx-auto block h-full max-h-full w-auto max-w-full object-contain p-4';
  stage.replaceChildren(node);
}

export const mount: WidgetMount = (host, opts) => {
  const name = host.dataset.scene3d ?? '';
  const ariaLabel = host.dataset.label || DEFAULT_LABEL;
  const stage = host.querySelector<HTMLElement>('[data-scene-stage]') ?? host;
  const build = builders[name];
  if (!build) throw new Error(`Unknown scene "${name}".`);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    showFallback(host, stage, name, ariaLabel);
    return () => stage.replaceChildren();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', ariaLabel);
  canvas.className = 'absolute inset-0 block size-full cursor-grab touch-pan-y focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:cursor-grabbing';
  stage.replaceChildren(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60);
  const rig = new THREE.Group();
  scene.add(rig);
  const env = studioEnv(renderer);
  scene.environment = env;
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x38414f, 0.7));
  const light = (color: number, i: number, x: number, y: number, z: number) => {
    const l = new THREE.DirectionalLight(color, i);
    l.position.set(x, y, z);
    scene.add(l);
  };
  light(0xffffff, 1.8, 3, 5, 6);
  light(0xff8a34, 0.9, -5, 2, -4);
  light(0xbfd7ff, 0.7, -4, -2, 5);

  const cleanups: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(target: HTMLElement, ev: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    target.addEventListener(ev, fn);
    cleanups.push(() => target.removeEventListener(ev, fn));
  };
  let alive = true;
  let raf = 0;
  let last = 0;
  let t = 0;
  let visible = false;
  const ctl = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0 };
  const view: View = { fitWidth: 6, elev: 0.6, tilt: 0, sway: 0.22 };

  const setLoop = (running: boolean) => {
    const v = running ? 'on' : 'off';
    if (host.dataset.sceneLoop !== v) host.dataset.sceneLoop = v;
  };
  const resize = () => {
    const w = stage.clientWidth || 320;
    const h = stage.clientHeight || 180;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const d = view.fitWidth / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / camera.aspect;
    camera.position.set(0, view.elev, Math.max(d, 2.5));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  let update: SceneUpdate = () => {};
  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const animate = animationAllowed();
    if (animate) t += dt;
    ctl.yaw += (ctl.tYaw - ctl.yaw) * 0.15;
    ctl.pitch += (ctl.tPitch - ctl.pitch) * 0.15;
    rig.rotation.set(ctl.pitch + view.tilt, ctl.yaw + (animate ? Math.sin(t * 0.45) * view.sway : 0), 0);
    update(t, animate);
    renderer.render(scene, camera);
    const easing = Math.abs(ctl.tYaw - ctl.yaw) > 1e-3 || Math.abs(ctl.tPitch - ctl.pitch) > 1e-3;
    if (alive && visible && !document.hidden && (animate || easing)) raf = requestAnimationFrame(frame);
    else last = 0;
    setLoop(raf !== 0);
  };
  const kick = () => {
    if (alive && !raf) raf = requestAnimationFrame(frame);
    setLoop(raf !== 0); // "on" from the moment a frame is scheduled: the first SwiftShader frame can take seconds
  };

  let pending: Promise<unknown> | null = null;
  const api: SceneApi = {
    rig,
    host,
    opts,
    view,
    kick,
    resize: () => {
      resize();
      kick();
    },
    wait: (p) => {
      pending = p;
    },
    alive: () => alive,
    onCleanup: (fn) => cleanups.push(fn),
  };
  update = build(api);

  /* input: horizontal drag and arrow keys rotate; vertical touch scroll passes through (touch-action: pan-y) */
  let px = 0;
  let py = 0;
  let down = false;
  on(canvas, 'pointerdown', (e) => {
    down = true;
    px = e.clientX;
    py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  on(canvas, 'pointermove', (e) => {
    if (!down) return;
    ctl.tYaw += (e.clientX - px) * 0.008;
    ctl.tPitch = clamp(ctl.tPitch + (e.clientY - py) * 0.006, -0.7, 0.7);
    px = e.clientX;
    py = e.clientY;
    kick();
  });
  const release = () => {
    down = false;
  };
  on(canvas, 'pointerup', release);
  on(canvas, 'pointercancel', release);
  on(canvas, 'lostpointercapture', release);
  const KEYS: Record<string, [number, number]> = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.2], ArrowDown: [0, 0.2] };
  on(canvas, 'keydown', (e) => {
    const k = KEYS[e.key];
    if (!k) return;
    e.preventDefault();
    ctl.tYaw += k[0];
    ctl.tPitch = clamp(ctl.tPitch + k[1], -0.7, 0.7);
    kick();
  });

  /* pause offscreen, on hidden tabs, and follow the site motion toggle and the OS setting */
  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting; // a batch can hold stale entries for this host
    kick();
  }, { rootMargin: '120px' });
  io.observe(host);
  const ro = new ResizeObserver(() => {
    resize();
    kick();
  });
  ro.observe(stage);
  document.addEventListener('visibilitychange', kick);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  reduced.addEventListener('change', kick);
  const unsubMotion = $motion.listen(kick);
  cleanups.push(() => {
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', kick);
    reduced.removeEventListener('change', kick);
    unsubMotion();
  });

  resize();
  host.dataset.sceneState = 'loading';
  void Promise.resolve(pending).then(
    () => {
      if (!alive) return;
      host.dataset.sceneState = 'ready';
      host.parentElement?.classList.add('has-scene3d');
      kick();
    },
    (e: unknown) => {
      if (!alive) return;
      console.warn(`scene ${name}: showing the static view`, e);
      teardown();
      showFallback(host, stage, name, ariaLabel);
    },
  );
  kick();

  function teardown() {
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    setLoop(false);
    for (const fn of cleanups.splice(0)) fn();
    disposeTree(scene);
    env.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }
  return () => {
    if (alive) teardown();
    stage.replaceChildren();
    delete host.dataset.sceneState;
    delete host.dataset.sceneLoop;
    host.parentElement?.classList.remove('has-scene3d');
  };
};
