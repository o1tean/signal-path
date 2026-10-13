/* Shared three.js pieces for the concept scenes. Ported from legacy/assets/js/scene3d.js.
   Scene units: 1 = 20 mm (MM = 0.05). Colours are fixed: the scenes sit on the dark scope panel
   in both themes, like the LCD art. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { lcd as drawLcd, measure, text, type LcdSpec } from '@/lib/pixel';

export const ORANGE = 0xff7a2f;
export const CYAN = 0x3fd8d2;
export const GREEN = 0x55d08d;
export const RED = 0xff6a86;
export const DIM = 0x334455;
export const MM = 0.05;

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.05, ...o });
/* fresh per call: cleanup disposes every material in a scene */
export const gold = () => std(0xd9a441, { metalness: 0.9, roughness: 0.3 });
export const silver = () => std(0xc9ced2, { metalness: 0.85, roughness: 0.35 });
export const black = () => std(0x1a1c20, { roughness: 0.7 });
export const box = <M extends THREE.Material>(w: number, h: number, d: number, mat: M) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
export const cyl = <M extends THREE.Material>(r: number, h: number, mat: M, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
export const glow = (color: number) => new THREE.MeshBasicMaterial({ color, toneMapped: false });

function canvas2d(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available.');
  return { c, ctx };
}

export function canvasTex(c: HTMLCanvasElement, pixel = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (pixel) {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
  }
  return t;
}

export interface LabelOpts {
  scale?: number;
  size?: number;
  bg?: string;
  color?: string;
}
/** Pixel-font label sprite that always faces the camera. */
export function label(str: string, o: LabelOpts = {}) {
  const s = o.scale ?? 2;
  const pad = 4;
  const w = measure(str) * s + pad * 2;
  const h = 7 * s + pad * 2;
  const { c, ctx } = canvas2d(w, h);
  ctx.fillStyle = o.bg ?? 'rgba(9,15,26,0.82)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = o.color ?? '#ff8a34';
  text(ctx, str, pad, pad, s);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c, true), transparent: true, depthTest: false, toneMapped: false }));
  const k = (o.size ?? 0.26) / h;
  sp.scale.set(w * k, h * k, 1);
  sp.renderOrder = 5;
  return sp;
}

export type Pt = [number, number, number];
/** Tube along n+1 points, rebuilt each frame with set(points). */
export function tube(n: number, radius: number, color: number, glowAmount = 0.3) {
  const R = 6;
  const pos = new Float32Array((n + 1) * R * 3);
  const nor = new Float32Array((n + 1) * R * 3);
  const idx: number[] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < R; j++) {
      const a = i * R + j;
      const b = i * R + ((j + 1) % R);
      idx.push(a, a + R, b, b, a + R, b + R);
    }
  const geo = new THREE.BufferGeometry();
  const pAttr = new THREE.BufferAttribute(pos, 3);
  const nAttr = new THREE.BufferAttribute(nor, 3);
  geo.setAttribute('position', pAttr);
  geo.setAttribute('normal', nAttr);
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, std(color, { roughness: 0.35, emissive: color, emissiveIntensity: glowAmount, side: THREE.DoubleSide }));
  const set = (pts: Pt[]) => {
    for (let i = 0; i <= n; i++) {
      const p = pts[i];
      const q = pts[Math.min(n, i + 1)];
      const p0 = pts[Math.max(0, i - 1)];
      let tx = q[0] - p0[0];
      let ty = q[1] - p0[1];
      const L = Math.hypot(tx, ty) || 1;
      tx /= L;
      ty /= L;
      for (let j = 0; j < R; j++) {
        const a = (j / R) * Math.PI * 2;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const o = (i * R + j) * 3;
        pos[o] = p[0] - ty * ca * radius;
        pos[o + 1] = p[1] + tx * ca * radius;
        pos[o + 2] = p[2] + sa * radius;
        nor[o] = -ty * ca;
        nor[o + 1] = tx * ca;
        nor[o + 2] = sa;
      }
    }
    pAttr.needsUpdate = true;
    nAttr.needsUpdate = true;
    geo.computeBoundingSphere();
  };
  return { mesh, n, set, pos };
}

export interface RingOpts {
  color?: number;
  max?: number;
  period?: number;
  alpha?: number;
  thick?: number;
}
/** Expanding, fading rings (radio waves). */
export function rings(count: number, o: RingOpts = {}) {
  const group = new THREE.Group();
  const items: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>[] = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(1, o.thick ?? 0.012, 6, 72),
      new THREE.MeshBasicMaterial({ color: o.color ?? ORANGE, transparent: true, opacity: 0, toneMapped: false }),
    );
    group.add(m);
    items.push(m);
  }
  const tick = (t: number) =>
    items.forEach((m, i) => {
      const u = (t / (o.period ?? 2.4) + i / count) % 1;
      m.scale.setScalar(0.05 + u * (o.max ?? 2.6));
      m.material.opacity = (1 - u) * (o.alpha ?? 0.55);
    });
  return { group, tick };
}

/** Soft radial contact shadow on the floor. */
export function shadow(w: number, h: number) {
  const { c, ctx } = canvas2d(128, 128);
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.5)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** 128x64 backlit LCD plane drawn with src/lib/pixel.ts at 3 fps. Mutate `spec` and call tick(t, true). */
export function lcdPlane(w: number, h: number, spec: LcdSpec) {
  const { c, ctx } = canvas2d(128, 64);
  const tex = canvasTex(c, true);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  let last = -1;
  const tick = (t: number, force = false) => {
    const f = Math.floor(t * 3);
    if (f === last && !force) return;
    last = f;
    drawLcd(ctx, spec, t);
    tex.needsUpdate = true;
  };
  tick(0, true);
  return { mesh, spec, tick };
}

/* ---------- Flipper Zero body (official STL -> GLB, GPL-3.0, see public/models/NOTICE) ---------- */
let flipperPromise: Promise<THREE.Object3D> | undefined;
export const loadFlipper = () =>
  (flipperPromise ??= new GLTFLoader()
    .loadAsync(`${import.meta.env.BASE_URL.replace(/\/?$/, '/')}models/flipper-zero.glb`)
    .then((g) => g.scene)
    .catch((e: unknown) => {
      flipperPromise = undefined; // allow a retry on the next mount
      throw e;
    }));

export function flipperModel(src: THREE.Object3D) {
  const wrap = new THREE.Group();
  const m = src.clone();
  m.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshStandardMaterial) {
      o.material = o.material.clone();
      o.material.roughness = o.material.name === 'glass' ? 0.25 : 0.5;
    }
  });
  /* STL frame: y = length (d-pad end +), x = width (GPIO edge -), z = front. GLB is Y-up: g = (x, z, -y).
     Screen frame: length -> +x, GPIO edge -> +y, front -> +z  =>  s = (-gz, -gx, gy). */
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().set(0, 0, -1, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
  /* STL bounds x -33.6..6.5, y -24.0..76.3, z -23.0..2.6 mm -> centre (26.14, 13.55, -10.2) in the screen frame */
  m.position.set(-26.14, -13.55, 10.2);
  wrap.add(m);
  wrap.scale.setScalar(MM);
  return wrap;
}

/** Screen window (STL x -29.25..-5.75, y 0.15..38.85, top z 2.1) -> 2:1 LCD inset 1 mm. */
export function flipperLcd(spec: LcdSpec) {
  const l = lcdPlane(36.7, 18.35, spec);
  l.mesh.position.set(-6.64, 3.95, 12.5);
  return l;
}

/* ---------- Wi-Fi Devboard (procedural, mm, official module outline) ---------- */
export function devboard() {
  const g = new THREE.Group();
  /* outline from flipperzero-3d-models/external-module (67.34 x 20 mm incl. 2.6 mm connector tabs) */
  const s = new THREE.Shape();
  const outline: [number, number][] = [
    [1.2, 0], [3, 0], [3, -2.6], [23.7, -2.6], [23.7, 0], [38.56, 0], [38.56, -2.6], [64.34, -2.6], [64.34, 0],
    [66.14, 0], [67.34, 1.2], [67.34, 16.2], [66.14, 17.4], [1.2, 17.4], [0, 16.2], [0, 1.2],
  ];
  outline.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  const pcb = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false }), std(0x1f6b3c, { roughness: 0.55 }));
  pcb.position.z = -0.6;
  g.add(pcb);
  const put = <T extends THREE.Object3D>(m: T, x: number, y: number, z: number) => {
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  /* ESP32-S2-WROVER: module PCB, shielded can, antenna zone at the far left */
  put(box(31, 18, 0.8, std(0x0f2f20)), 15.5, 9.4, 1.0);
  put(box(25, 15.6, 3.0, silver()), 18.5, 9.4, 2.9);
  put(box(5.4, 16, 0.3, std(0x1a1d22, { roughness: 0.8 })), 3, 9.4, 1.55);
  put(box(3.6, 12, 0.1, std(0xc9a44a, { metalness: 0.6, roughness: 0.4 })), 3, 9.4, 1.75);
  /* pin-label silkscreen block, LEDs, buttons, USB-C */
  put(box(13, 11, 0.15, std(0xe9ecef, { roughness: 0.9 })), 40, 9, 0.68);
  const ledMat = glow(ORANGE);
  put(box(1.6, 0.9, 0.7, ledMat), 47.5, 15.2, 0.95);
  put(box(1.6, 0.9, 0.7, glow(CYAN)), 50.5, 15.2, 0.95);
  for (const x of [51.5, 58.5]) {
    put(box(4.2, 4.2, 1.6, std(0x8a8f96, { metalness: 0.6 })), x, 8.2, 1.4);
    const c = cyl(1.3, 1, black());
    c.rotation.x = Math.PI / 2;
    put(c, x, 8.2, 2.7);
  }
  put(box(8.9, 3.2, 7.4, silver()), 63, 6.6, 4.3);
  put(box(2, 1.6, 6.4, black()), 67.4, 6.6, 4.3);
  /* 18 right-angle pins in the official 8 + 10 layout (2.54 mm pitch), plastic header bodies behind the board */
  const pinMat = gold();
  const pinX = [...Array(8).keys()].map((i) => 4.47 + i * 2.54).concat([...Array(10).keys()].map((i) => 40.03 + i * 2.54));
  for (const x of pinX) put(cyl(0.32, 10.4, pinMat, 8), x, -3.7, -1.85);
  put(box(20.5, 2.6, 2.5, black()), 13.36, 1.25, -1.85);
  put(box(25.6, 2.6, 2.5, black()), 51.46, 1.25, -1.85);
  const waves = rings(3, { color: CYAN, max: 26, thick: 0.02, period: 2.2, alpha: 0.5 });
  put(waves.group, 3, 9.4, 2);
  const tick = (t: number) => {
    waves.tick(t);
    ledMat.color.setHex(Math.sin(t * 6) > 0 ? ORANGE : 0x40200a);
  };
  return { group: g, tick };
}

/** Board standing on the Flipper's GPIO edge (screen frame, mm). */
export function attachBoard(wrap: THREE.Object3D, board: THREE.Object3D) {
  board.position.set(-31.39, 20.3, 0.2);
  wrap.add(board);
}

/** Small studio environment so metals and gloss have something to reflect. */
export function studioEnv(renderer: THREE.WebGLRenderer) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x1c232c);
  const panel = (w: number, h: number, x: number, y: number, z: number, c: number, i: number) => {
    const mat = new THREE.MeshBasicMaterial({ color: c });
    mat.color.multiplyScalar(i);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(7, 7, 0, 8, 1, 0xffffff, 5);
  panel(4, 3, -8, 3, 4, 0xffe2c8, 2.5);
  panel(4, 3, 8, 2, 4, 0xc8dcff, 2);
  panel(20, 6, 0, -7, 0, 0x2a323c, 0.6);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.04).texture;
  pm.dispose();
  disposeTree(s);
  return tex;
}

/** Free GPU memory held by everything under root (geometries, materials, their textures). */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    if (o instanceof THREE.InstancedMesh) o.dispose();
    const m = o as Partial<THREE.Mesh>;
    m.geometry?.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
      mat.dispose();
    }
  });
}
