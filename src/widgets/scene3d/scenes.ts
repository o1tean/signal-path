/* The nine concept scenes. Each builder adds objects to api.rig and returns update(t, animate).
   Options for each scene are documented in ./README.md. */
import * as THREE from 'three';
import { MODES, type LcdSpec } from '@/lib/pixel';
import type { WidgetOpts } from '../types';
import {
  CYAN, DIM, GREEN, MM, ORANGE, RED, attachBoard, black, box, clamp, cyl, devboard, flipperLcd, flipperModel, glow, gold,
  label, loadFlipper, rings, shadow, silver, std, tube, type Pt,
} from './kit';

export interface View {
  /** scene width (scene units) the camera frames */
  fitWidth: number;
  /** camera height */
  elev: number;
  /** resting pitch of the rig */
  tilt: number;
  /** ambient yaw sway amplitude (radians) while animating */
  sway: number;
}
export interface SceneApi {
  rig: THREE.Group;
  host: HTMLElement;
  opts: WidgetOpts;
  view: View;
  /** request a frame (needed after async changes while motion is off) */
  kick(): void;
  /** re-frame the camera after changing view */
  resize(): void;
  /** the scene shows its static fallback if this rejects; ready state waits for it */
  wait(p: Promise<unknown>): void;
  /** false once the scene has been unmounted (guards async loads) */
  alive(): boolean;
  onCleanup(fn: () => void): void;
}
export type SceneUpdate = (t: number, animate: boolean) => void;

type ModeName = keyof typeof MODES;
const modeSpec = (m: unknown): LcdSpec => ({ ...(MODES[m as ModeName] ?? MODES.subghz) });

function flipper(api: SceneApi): SceneUpdate {
  const { rig, opts, host, view } = api;
  const hero = opts.hero === true;
  Object.assign(view, { fitWidth: hero ? 8 : 6.4, elev: 0.9, tilt: 0.12 });
  const g = new THREE.Group();
  rig.add(g);
  const sh = shadow(7, 4.2);
  sh.position.y = -1.25;
  g.add(sh);
  const spec = modeSpec(opts.mode);
  const screen = flipperLcd(spec);
  const sig = rings(3, { color: ORANGE, max: 3.4, period: 3, thick: 0.01 });
  sig.group.position.set(-1.9, 0.2, 0.75);
  g.add(sig.group);
  let board: ReturnType<typeof devboard> | null = null;
  let dy = 0;
  /* hero: follow data-mode on the closest [data-signal-stage] (the home page mode buttons) */
  const stage = hero ? host.closest<HTMLElement>('[data-signal-stage]') : null;
  const setMode = (m: string) => {
    Object.assign(spec, modeSpec(m));
    screen.tick(0, true);
    if (board) board.group.visible = m === 'wifi';
    sig.group.visible = m !== 'wifi';
    if (hero) {
      view.fitWidth = m === 'wifi' ? 8.8 : 8;
      dy = m === 'wifi' ? -0.55 : 0;
      api.resize();
    }
    api.kick();
  };
  api.wait(
    loadFlipper().then((src) => {
      if (!api.alive()) return;
      const wrap = flipperModel(src);
      wrap.add(screen.mesh);
      g.add(wrap);
      if (hero) {
        board = devboard();
        attachBoard(wrap, board.group);
        setMode(stage?.dataset.mode ?? String(opts.mode ?? 'subghz'));
      }
      api.kick();
    }),
  );
  if (stage) {
    const mo = new MutationObserver(() => setMode(stage.dataset.mode ?? 'subghz'));
    mo.observe(stage, { attributes: true, attributeFilter: ['data-mode'] });
    api.onCleanup(() => mo.disconnect());
  }
  return (t, animate) => {
    g.position.y = dy + (animate ? Math.sin(t * 0.8) * 0.06 : 0);
    sig.tick(t);
    screen.tick(t);
    if (board?.group.visible) board.tick(t);
  };
}

function devboardScene(api: SceneApi): SceneUpdate {
  const { rig, opts, view } = api;
  const attach = opts.attach === true;
  const g = new THREE.Group();
  rig.add(g);
  const b = devboard();
  if (attach) {
    Object.assign(view, { fitWidth: 7.8, elev: 1.6, tilt: 0.3 });
    api.wait(
      loadFlipper().then((src) => {
        if (!api.alive()) return;
        const wrap = flipperModel(src);
        wrap.add(flipperLcd(modeSpec('wifi')).mesh);
        attachBoard(wrap, b.group);
        g.add(wrap);
        api.kick();
      }),
    );
    const l = label('STANDS ON THE 18-PIN GPIO EDGE · PINS GO 6 MM IN', { size: 0.22 });
    l.position.set(0, -1.65, 0.5);
    g.add(l);
  } else {
    Object.assign(view, { fitWidth: 4.9, elev: 0.7, tilt: 0.15, sway: 0.35 });
    const w = new THREE.Group();
    w.scale.setScalar(MM);
    b.group.position.set(-33.67, -7.4, 0);
    w.add(b.group);
    g.add(w);
    const sh = shadow(4.4, 2.2);
    sh.position.y = -0.95;
    g.add(sh);
    const tags: [string, number, number][] = [['ESP32-S2 · 2.4 GHZ', -0.55, 1.0], ['USB-C', 1.5, 0.72], ['8 + 10 PINS · 2.54 MM', 0.2, -0.85]];
    for (const [s, x, y] of tags) {
      const l = label(s);
      l.position.set(x, y, 0.4);
      g.add(l);
    }
  }
  return (t, animate) => {
    g.position.y = animate && !attach ? Math.sin(t * 0.9) * 0.05 : 0;
    b.tick(t);
  };
}

function isBands(v: unknown): v is [number, string][] {
  return Array.isArray(v) && v.length > 0 && v.every((b) => Array.isArray(b) && typeof b[0] === 'number' && b[0] > 0 && typeof b[1] === 'string');
}

function carrier(api: SceneApi): SceneUpdate {
  const { rig, opts, view } = api;
  Object.assign(view, { fitWidth: 8.6, elev: 1.1, tilt: 0.1 });
  const g = new THREE.Group();
  rig.add(g);
  const bands: [number, string][] = isBands(opts.bands)
    ? opts.bands
    : [[315, '315 MHZ  ·  λ ≈ 95 CM'], [433.92, '433.92 MHZ  ·  λ ≈ 69 CM']];
  const rows = bands.map(([f, text], i) => {
    const y = ((bands.length - 1) / 2 - i) * 1.7;
    const color = i % 2 ? ORANGE : CYAN;
    const mast = cyl(0.025, 1.1, silver());
    mast.position.set(-3.7, y, 0);
    g.add(mast);
    const base = box(0.5, 0.08, 0.5, black());
    base.position.set(-3.7, y - 0.55, 0);
    g.add(base);
    const tb = tube(220, 0.035, color);
    g.add(tb.mesh);
    const l = label(text.replace('λ', 'WAVELENGTH').replace('≈', '='));
    l.position.set(-1.9, y + 0.78, 0);
    g.add(l);
    const L = (300 / f) * 2.2;
    const bar = box(L, 0.03, 0.03, std(color));
    bar.position.set(-3.4 + L / 2, y - 0.62, 0);
    g.add(bar);
    const rr = rings(2, { color, max: 1.1, period: 2, thick: 0.02 });
    rr.group.position.set(-3.7, y, 0);
    g.add(rr.group);
    return { y, f, tb, rr, L };
  });
  const pts: Pt[] = [];
  return (t) => {
    for (const r of rows) {
      const k = (2 * Math.PI) / r.L;
      const w = 2 * Math.PI * 0.9 * (r.f / 433.92);
      for (let i = 0; i <= r.tb.n; i++) {
        const u = i / r.tb.n;
        const x = -3.5 + u * 7;
        pts[i] = [x, r.y + 0.42 * Math.min(1, u * 8) * Math.sin(k * (x + 3.5) - w * t), 0];
      }
      r.tb.set(pts);
      r.rr.tick(t);
    }
  };
}

/** Bit blocks that ride above a waveform: lit orange for 1, dark for 0. */
function bitBlocks(g: THREE.Group, count: number, size: number) {
  return [...Array(count)].map(() => {
    const m = box(size, size, size, std(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.4 }));
    g.add(m);
    return m;
  });
}
const setBit = (m: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>, b: number, lit: number) => {
  m.material.emissiveIntensity = b ? lit : 0;
  m.material.color.setHex(b ? ORANGE : 0x2a3446);
};
const wrapIndex = (i: number, n: number) => ((i % n) + n) % n;

function modulation(api: SceneApi): SceneUpdate {
  const { rig, view } = api;
  Object.assign(view, { fitWidth: 9.4, elev: 1.0, tilt: 0.1 });
  const g = new THREE.Group();
  rig.add(g);
  const bits = [1, 0, 1, 1, 0, 0, 1, 0];
  const BL = 0.85;
  const V = 0.9;
  const rowSpec: [string, number, number][] = [
    ['OOK (AM): 1 = CARRIER ON, 0 = OFF', 0.95, ORANGE],
    ['FSK (FM): THE BIT SHIFTS THE FREQUENCY', -1.45, CYAN],
  ];
  const rows = rowSpec.map(([s, y, c]) => {
    const l = label(s, { size: 0.22 });
    l.position.set(-1.2, y + 0.68, 0);
    g.add(l);
    const tb = tube(260, 0.035, c);
    g.add(tb.mesh);
    return { y, tb };
  });
  const blocks = bitBlocks(g, 10, 0.34);
  const pts: Pt[] = [];
  return (t) => {
    const off = t * V;
    const bit = (x: number) => bits[wrapIndex(Math.floor((x + 3.5 + off) / BL), 8)];
    blocks.forEach((m, j) => {
      const x = -3.5 + j * BL - (off % BL) + BL / 2;
      m.position.set(x, 2.15, 0);
      m.visible = x < 3.5 && x > -3.5;
      setBit(m, bits[wrapIndex(j + Math.floor(off / BL), 8)], 0.6);
    });
    rows.forEach((r, i) => {
      let ph = 0;
      let px = -3.5;
      for (let k = 0; k <= r.tb.n; k++) {
        const x = -3.5 + (k / r.tb.n) * 7;
        const b = bit(x);
        const freq = i === 0 ? (2 * Math.PI) / 0.5 : b ? (2 * Math.PI) / 0.3 : (2 * Math.PI) / 0.62;
        ph += freq * (x - px);
        px = x;
        pts[k] = [x, r.y + (i === 0 ? (b ? 0.42 : 0.03) : 0.42) * Math.sin(ph - t * 6), 0];
      }
      r.tb.set(pts);
    });
  };
}

function pulses(api: SceneApi): SceneUpdate {
  const { rig, view } = api;
  Object.assign(view, { fitWidth: 8.6, elev: 1.0, tilt: 0.1 });
  const g = new THREE.Group();
  rig.add(g);
  const bits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1];
  const TE = 0.22;
  const SYM = TE * 4;
  const TOTAL = SYM * bits.length;
  const V = 0.8;
  const tb = tube(320, 0.04, ORANGE);
  g.add(tb.mesh);
  const texts: [string, number, number][] = [
    ['HIGH  (CARRIER ON)', -2.9, 1.15],
    ['LOW  (SILENCE)', -3.05, -0.75],
    ['1 = LONG-SHORT   0 = SHORT-LONG   TE = 400 US', 0, 1.75],
  ];
  for (const [s, x, y] of texts) {
    const l = label(s);
    l.position.set(x, y, 0);
    g.add(l);
  }
  const blocks = bitBlocks(g, bits.length, 0.3);
  let t0 = 0;
  const level = (x: number) => {
    const p = wrapIndex(x + 3.5 + t0, TOTAL);
    const i = Math.floor(p / SYM);
    const f = (p - i * SYM) / TE;
    return bits[i] ? f < 3 : f < 1;
  };
  const pts: Pt[] = [];
  return (t) => {
    t0 = t * V;
    for (let k = 0; k <= tb.n; k++) {
      const x = -3.5 + (k / tb.n) * 7;
      pts[k] = [x, level(x) ? 0.55 : -0.25, 0];
    }
    tb.set(pts);
    blocks.forEach((m, i) => {
      let p = i * SYM + SYM / 2 - (t0 % TOTAL);
      if (p < 0) p += TOTAL;
      const x = -3.5 + p;
      m.position.set(x, -1.35, 0);
      m.visible = x < 3.5;
      setBit(m, bits[i], 0.5);
    });
  };
}

function rolling(api: SceneApi): SceneUpdate {
  const { rig, view } = api;
  Object.assign(view, { fitWidth: 8.4, elev: 1.0, tilt: 0.1 });
  const g = new THREE.Group();
  rig.add(g);
  const remote = box(0.7, 1.2, 0.3, std(0x2d3340));
  remote.position.set(-2.5, 0, 0);
  g.add(remote);
  const btn = cyl(0.14, 0.12, std(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.3 }));
  btn.rotation.x = Math.PI / 2;
  btn.position.set(-2.5, 0.25, 0.2);
  g.add(btn);
  const rx = box(1.3, 1.5, 0.5, std(0x2d3340));
  rx.position.set(2.4, 0, 0);
  g.add(rx);
  const ledM = glow(DIM);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), ledM);
  led.position.set(2.4, 0.5, 0.3);
  g.add(led);
  /* labels are re-rendered only when their text changes */
  const slot = (x: number, y: number, size: number) => {
    let sp: THREE.Sprite | null = null;
    let cur = '';
    return (text: string, o: { bg?: string; color?: string; scale?: number } = {}) => {
      const key = text + (o.bg ?? '');
      if (key === cur && sp) return sp;
      cur = key;
      if (sp) {
        g.remove(sp);
        sp.material.map?.dispose();
        sp.material.dispose();
      }
      sp = label(text, { size, ...o });
      sp.position.set(x, y, 0);
      g.add(sp);
      return sp;
    };
  };
  const rxLabel = slot(2.1, 1.3, 0.2);
  const txLabel = slot(-2.2, 1.2, 0.2);
  const msg = slot(0, -1.3, 0.22);
  const packet = slot(0, 0, 0.26);
  rxLabel('RECEIVER · NEXT 0042');
  txLabel('REMOTE · COUNTER 0041');
  msg('A NEW CODE EVERY PRESS');
  packet('0042', { scale: 3, color: '#0b0f1a', bg: '#ff8a34' }).visible = false;
  const events = [
    { t0: 0.5, code: '0042', ok: true, rx: 'NEXT 0043', tx: 'COUNTER 0042', say: 'FRESH COUNTER 0042 · ACCEPTED' },
    { t0: 3, code: '0043', ok: true, rx: 'NEXT 0044', tx: 'COUNTER 0043', say: 'FRESH COUNTER 0043 · ACCEPTED' },
    { t0: 5.5, code: '0042', ok: false, rx: 'NEXT 0044', tx: 'REPLAY OF 0042', say: 'STALE COUNTER 0042 · REJECTED' },
  ];
  return (t) => {
    const T = t % 8;
    const ev = events.find((e) => T >= e.t0 && T < e.t0 + 2.4);
    if (!ev) {
      if (T < 0.5) {
        msg('A NEW CODE EVERY PRESS');
        rxLabel('RECEIVER · NEXT 0042');
      }
      packet('0042', { scale: 3, color: '#0b0f1a', bg: '#ff8a34' }).visible = false;
      ledM.color.setHex(DIM);
      btn.position.z = 0.2;
      return;
    }
    msg(ev.say);
    txLabel('REMOTE · ' + ev.tx);
    const u = (T - ev.t0) / 2.4;
    const fly = clamp(u / 0.5, 0, 1);
    btn.position.z = u < 0.08 ? 0.12 : 0.2;
    const back = !ev.ok && u > 0.5 ? clamp((u - 0.5) / 0.3, 0, 1) : 0;
    const p = packet(ev.code, { scale: 3, color: '#0b0f1a', bg: ev.ok ? '#ff8a34' : '#ff6a86' });
    p.visible = true;
    p.position.set(-2.1 + fly * 3.9 - back * 1.2, 0.2 + Math.sin(fly * Math.PI) * 0.5 + back * 0.4, 0.4);
    ledM.color.setHex(u > 0.5 ? (ev.ok ? GREEN : RED) : DIM);
    if (u > 0.5 && ev.ok) rxLabel('RECEIVER · ' + ev.rx);
  };
}

function nearfield(api: SceneApi): SceneUpdate {
  const { rig, opts, view } = api;
  Object.assign(view, { fitWidth: 7.6, elev: 1.4, tilt: 0.25 });
  const g = new THREE.Group();
  rig.add(g);
  const nfc = opts.kind === 'card';
  const coilMat = () => std(0xc97b3a, { metalness: 0.7, roughness: 0.35 });
  const reader = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 10, 64), coilMat());
  reader.rotation.y = Math.PI / 2;
  reader.position.set(-1.6, 0, 0);
  g.add(reader);
  const base = box(0.3, 2, 2, std(0x2d3340));
  base.position.set(-1.95, 0, 0);
  g.add(base);
  const rl = label(nfc ? 'READER COIL  ·  13.56 MHZ' : 'READER COIL  ·  125 KHZ');
  rl.position.set(-1.6, 1.45, 0);
  g.add(rl);
  const tag = new THREE.Group();
  g.add(tag);
  if (nfc) {
    tag.add(box(0.04, 1.1, 1.7, std(0xf2f1ec)));
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 8, 4), coilMat());
    coil.rotation.set(Math.PI / 4, Math.PI / 2, 0);
    coil.position.x = 0.03;
    tag.add(coil);
    const chip = box(0.05, 0.25, 0.3, gold());
    chip.position.set(0.03, 0.25, -0.45);
    tag.add(chip);
  } else {
    tag.add(box(0.12, 0.9, 0.65, std(0x22262e)));
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 8, 40), coilMat());
    coil.rotation.y = Math.PI / 2;
    coil.position.x = 0.07;
    tag.add(coil);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 24), silver());
    ring.position.set(0, 0.55, 0);
    tag.add(ring);
  }
  const tl = label(nfc ? 'CARD  ·  ISO 14443' : 'KEY FOB  ·  EM4100');
  tl.position.set(1.4, 1.2, 0);
  g.add(tl);
  const lines: THREE.Line<THREE.BufferGeometry, THREE.LineDashedMaterial>[] = [];
  for (let i = 0; i < 6; i++) {
    const r = 0.35 + i * 0.22;
    const pts = new THREE.EllipseCurve(0, 0, 1.6 + i * 0.2, r, 0, Math.PI * 2, false, 0).getPoints(90).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const mat = new THREE.LineDashedMaterial({ color: CYAN, dashSize: 0.12, gapSize: 0.1, transparent: true, opacity: 0.7, toneMapped: false });
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    l.computeLineDistances();
    l.rotation.x = (i % 3) * (Math.PI / 3);
    g.add(l);
    lines.push(l);
  }
  const st = label('FIELD POWERS THE TAG · TAG ANSWERS BY LOADING THE FIELD');
  st.position.set(0, -1.35, 0);
  g.add(st);
  const far = label('OUT OF RANGE · NO POWER, NO ID');
  far.position.set(0, -1.35, 0);
  far.visible = false;
  g.add(far);
  return (t) => {
    const x = 1.4 + Math.max(0, Math.sin(t * 0.45)) * 1.6;
    const near = x < 2.2;
    tag.position.set(x, 0, 0);
    tag.rotation.z = Math.sin(t * 0.7) * 0.08;
    lines.forEach((l, i) => (l.material.opacity = near ? 0.75 - i * 0.07 : 0.12));
    st.visible = near;
    far.visible = !near;
  };
}

function infrared(api: SceneApi): SceneUpdate {
  const { rig, view } = api;
  Object.assign(view, { fitWidth: 8.2, elev: 1.0, tilt: 0.1 });
  const g = new THREE.Group();
  rig.add(g);
  const remote = box(0.5, 0.9, 0.3, std(0x22262e));
  remote.position.set(-2.9, -0.1, 0);
  g.add(remote);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), glow(0x8b6cff));
  dome.position.set(-2.62, 0.2, 0);
  g.add(dome);
  const rxb = box(0.7, 0.9, 0.6, std(0x2d3340));
  rxb.position.set(2.9, 0, 0);
  g.add(rxb);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), std(0x0a0a10, { roughness: 0.2 }));
  eye.position.set(2.53, 0.2, 0);
  g.add(eye);
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.75, 5, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x8b6cff, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }),
  );
  cone.rotation.z = Math.PI / 2;
  cone.position.set(0, 0.2, 0);
  g.add(cone);
  const texts: [string, number, number][] = [['IR LED · 940 NM', -2.6, 0.95], ['38 KHZ BURSTS = MARK · GAPS = SPACE', 0, 1.5], ['RECEIVER', 2.7, 0.95]];
  for (const [s, x, y] of texts) {
    const l = label(s, { size: 0.22 });
    l.position.set(x, y, 0);
    g.add(l);
  }
  const N = 96;
  const pattern = '1101001110100101';
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), glow(0xb39cff), N);
  g.add(dots);
  const outM = glow(DIM);
  const out = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), outM);
  out.position.set(2.9, 0.62, 0.35);
  g.add(out);
  const m4 = new THREE.Matrix4();
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  const cyc = 3.2;
  return (t) => {
    const shift = Math.floor(t / cyc) * 3;
    for (let i = 0; i < N; i++) {
      const s = wrapIndex(t / cyc - i / N, 1);
      const on = pattern[(Math.floor(s * 16) + shift) % 16] === '1';
      if (on) dots.setMatrixAt(i, m4.makeTranslation(-2.5 + s * 5, 0.2 + Math.sin(i * 7.3) * 0.18 * s, Math.cos(i * 5.1) * 0.18 * s));
      else dots.setMatrixAt(i, hide);
    }
    dots.instanceMatrix.needsUpdate = true;
    outM.color.setHex(pattern[(Math.floor(((t / cyc) % 1) * 16) + 15 + shift) % 16] === '1' ? GREEN : DIM);
  };
}

function gpio(api: SceneApi): SceneUpdate {
  const { rig, view } = api;
  Object.assign(view, { fitWidth: 6, elev: 1.3, tilt: 0.35 });
  const g = new THREE.Group();
  rig.add(g);
  /* Flipper 18-pin edge: 8 + 10 sockets, 2.54 mm pitch (positions from the official module outline) */
  const P = 2.54 * MM;
  const xs = [...Array(8).keys()].map((i) => (4.47 + i * 2.54 - 33.67) * MM).concat([...Array(10).keys()].map((i) => (40.03 + i * 2.54 - 33.67) * MM));
  const hdr = (x0: number, x1: number) => {
    const m = box(x1 - x0 + P, 0.18, 0.2, black());
    m.position.set((x0 + x1) / 2, 0, 0);
    g.add(m);
  };
  hdr(xs[0], xs[7]);
  hdr(xs[8], xs[17]);
  const names: Record<number, string> = { 0: '5V', 1: 'PA7', 7: 'GND', 8: '3V3', 10: 'GND', 17: 'GND' };
  const padMat = gold();
  const holeMat = std(0x050608);
  xs.forEach((x, i) => {
    const pad = box(P * 0.7, 0.02, P * 0.7, padMat);
    pad.position.set(x, 0.1, 0);
    g.add(pad);
    const hole = box(P * 0.35, 0.03, P * 0.35, holeMat);
    hole.position.set(x, 0.105, 0);
    g.add(hole);
    if (names[i]) {
      const l = label(names[i], { scale: 1, size: 0.15 });
      l.position.set(x, i % 2 ? -0.38 : -0.2, 0.16);
      g.add(l);
    }
  });
  const shell = box(xs[17] - xs[0] + 0.6, 0.5, 1.4, std(0xf2f1ec));
  shell.position.set(0, -0.35, -0.5);
  g.add(shell);
  /* PA7 -> 1 kOhm -> LED -> GND (the lesson's teaching circuit), current shown as moving charge */
  const A = xs[1];
  const G = xs[7];
  const top = 1.15;
  const mid = (A + G) / 2;
  const path: Pt[] = [[A, 0.12, 0], [A, 0.55, 0], [A - 0.75, 0.55, 0], [A - 0.75, top, 0], [G + 0.75, top, 0], [G + 0.75, 0.55, 0], [G, 0.55, 0], [G, 0.12, 0]];
  const wire = tube(path.length * 8, 0.018, 0xcc4b2a, 0);
  wire.set(
    [...Array(wire.n + 1).keys()].map((i) => {
      const u = (i / wire.n) * (path.length - 1);
      const k = Math.min(path.length - 2, Math.floor(u));
      const f = u - k;
      return path[k].map((v, j) => v + (path[k + 1][j] - v) * f) as Pt;
    }),
  );
  g.add(wire.mesh);
  const res = cyl(0.07, 0.42, std(0xd9c39a));
  res.position.set(A - 0.75, 0.85, 0);
  g.add(res);
  const stripes: [number, number][] = [[-0.1, 0x8b5a2b], [0, 0x111111], [0.1, RED]];
  for (const [dy, c] of stripes) {
    const b = cyl(0.075, 0.04, std(c));
    b.position.set(A - 0.75, 0.85 + dy, 0);
    g.add(b);
  }
  const ledM = std(0xff3b3b, { emissive: 0xff2020, emissiveIntensity: 0, roughness: 0.3, transparent: true, opacity: 0.85 });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), ledM);
  led.position.set(mid, top, 0);
  g.add(led);
  const haloM = new THREE.MeshBasicMaterial({ color: 0xff4040, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), haloM);
  halo.position.copy(led.position);
  g.add(halo);
  const texts: [string, number, number][] = [
    ['PA7 HIGH (3.3 V) - 1 KOHM - LED - GND', 0, 1.75],
    ['1 KOHM', A - 1.25, 0.85],
    ['LED', mid, 1.45],
    ['I = (3.3 V - 2 V) / 1 KOHM = 1.3 MA', 0.4, -0.75],
  ];
  for (const [s, x, y] of texts) {
    const l = label(s, { scale: 1, size: 0.14 });
    l.position.set(x, y, 0.2);
    g.add(l);
  }
  const N = 24;
  const q = new THREE.InstancedMesh(new THREE.SphereGeometry(0.028, 8, 6), glow(CYAN), N);
  g.add(q);
  const m4 = new THREE.Matrix4();
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  return (t) => {
    const on = t % 2 < 1;
    ledM.emissiveIntensity = on ? 1.6 : 0;
    haloM.opacity = on ? 0.25 : 0;
    for (let i = 0; i < N; i++) {
      if (!on) {
        q.setMatrixAt(i, hide);
        continue;
      }
      const k = Math.floor(((t * 0.35 + i / N) % 1) * wire.n) * 6 * 3;
      q.setMatrixAt(i, m4.makeTranslation(wire.pos[k], wire.pos[k + 1] + 0.02, wire.pos[k + 2] + 0.02));
    }
    q.instanceMatrix.needsUpdate = true;
  };
}

export const builders: Record<string, (api: SceneApi) => SceneUpdate> = {
  flipper,
  devboard: devboardScene,
  carrier,
  modulation,
  pulses,
  rolling,
  nearfield,
  infrared,
  gpio,
};
