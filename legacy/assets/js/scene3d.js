/* ============================================================
   Signal Path — 3D scenes (three.js, vendored ES module).
   Loaded on demand by presentation.js when a page has [data-scene3d].
   Device model: official Flipper Devices body STL (GPL-3.0), see
   assets/models/. Devboard and concept scenes are procedural.
   Scene units: 1 = 20 mm. Pauses offscreen, when the tab is hidden and
   under motion-off / reduced motion (drag to rotate still works).
   ============================================================ */
import * as THREE from "./vendor/three.module.min.js";

const root = document.body.getAttribute("data-root") || "";
const html = document.documentElement;
const PX = (window.SP && window.SP.pixel) || null;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const motionOff = () => reduced.matches || html.classList.contains("motion-off");
const ORANGE = 0xff7a2f, CYAN = 0x3fd8d2, GREEN = 0x55d08d, RED = 0xff6a86;
const MM = 0.05;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const std = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.5, metalness: 0.05 }, o));
const GOLD = std(0xd9a441, { metalness: 0.9, roughness: 0.3 });
const SILVER = std(0xc9ced2, { metalness: 0.85, roughness: 0.35 });
const BLACK = std(0x1a1c20, { roughness: 0.7 });
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const cyl = (r, h, mat, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);

/* ---------- shared pieces ---------- */
function canvasTex(c, pixel) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (pixel) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; }
  return t;
}
/* pixel-font label sprite, always faces the camera */
function label(text, o = {}) {
  const s = o.scale || 2, pad = 4, w = (PX ? PX.measure(text) : text.length * 6) * s + pad * 2, h = 7 * s + pad * 2;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = o.bg || "rgba(9,15,26,0.82)"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = o.color || "#ff8a34";
  if (PX) PX.text(ctx, text, pad, pad, s);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c, true), transparent: true, depthTest: false, toneMapped: false }));
  const k = (o.size || 0.26) / h; sp.scale.set(w * k, h * k, 1); sp.renderOrder = 5;
  return sp;
}
/* tube along an array of [x,y,z] points, rebuilt each frame */
function tube(n, radius, color, glow = 0.3) {
  const R = 6, pos = new Float32Array((n + 1) * R * 3), nor = new Float32Array((n + 1) * R * 3), idx = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < R; j++) {
    const a = i * R + j, b = i * R + ((j + 1) % R), c = a + R, d = b + R;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, std(color, { roughness: 0.35, emissive: color, emissiveIntensity: glow, side: THREE.DoubleSide }));
  mesh.set = (pts) => {
    for (let i = 0; i <= n; i++) {
      const p = pts[i], q = pts[Math.min(n, i + 1)], p0 = pts[Math.max(0, i - 1)];
      let tx = q[0] - p0[0], ty = q[1] - p0[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
      for (let j = 0; j < R; j++) {
        const a = (j / R) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), o = (i * R + j) * 3;
        pos[o] = p[0] - ty * ca * radius; pos[o + 1] = p[1] + tx * ca * radius; pos[o + 2] = (p[2] || 0) + sa * radius;
        nor[o] = -ty * ca; nor[o + 1] = tx * ca; nor[o + 2] = sa;
      }
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true; geo.computeBoundingSphere();
  };
  mesh.n = n;
  return mesh;
}
/* expanding, fading rings (radio waves) */
function rings(count, o = {}) {
  const g = new THREE.Group(), items = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, o.thick || 0.012, 6, 72), new THREE.MeshBasicMaterial({ color: o.color || ORANGE, transparent: true, opacity: 0, toneMapped: false }));
    if (o.flat) m.rotation.x = Math.PI / 2;
    g.add(m); items.push(m);
  }
  g.tick = (t) => items.forEach((m, i) => {
    const u = (t / (o.period || 2.4) + i / count) % 1, r = 0.05 + u * (o.max || 2.6);
    m.scale.setScalar(r); m.material.opacity = (1 - u) * (o.alpha || 0.55);
  });
  return g;
}
function shadow(w, h) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d"), g = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.5)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; return m;
}
/* 128x64 LCD plane (mm), backlit orange, pixel art from SP.pixel */
function lcd(w, h, spec) {
  const c = document.createElement("canvas"); c.width = 128; c.height = 64;
  const tex = canvasTex(c, true);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  let last = -1;
  m.spec = spec;
  m.tick = (t, force) => { const f = Math.floor(t * 3); if (f === last && !force) return; last = f; if (PX) PX.lcd(c, m.spec, t); tex.needsUpdate = true; };
  m.tick(0, true);
  return m;
}

/* ---------- Flipper Zero body (official STL → GLB) ---------- */
let flipperPromise;
const loadFlipper = () => flipperPromise || (flipperPromise = new Promise((res, rej) =>
  new THREE.GLTFLoader().load(root + "assets/models/flipper-zero.glb", (g) => res(g.scene), undefined, rej)));
function flipperModel(src) {
  const wrap = new THREE.Group(), m = src.clone();
  m.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.roughness = o.material.name === "glass" ? 0.25 : 0.5; } });
  /* STL frame: y = length (d-pad end +), x = width (GPIO edge −), z = front. GLB is Y-up: g = (x, z, −y).
     Screen frame: length → +x, GPIO edge → +y, front → +z  ⇒  s = (−gz, −gx, gy). */
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().set(0, 0, -1, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
  /* STL bounds x −33.6…6.5, y −24.0…76.3, z −23.0…2.6 mm → centre (26.14, 13.55, −10.2) in the screen frame */
  m.position.set(-26.14, -13.55, 10.2);
  wrap.add(m); wrap.scale.setScalar(MM);
  return wrap;
}
/* screen window (STL x −29.25…−5.75, y 0.15…38.85, top ≈ z 2.1) → 2:1 LCD inset 1 mm */
function flipperLcd(spec) { const m = lcd(36.7, 18.35, spec); m.position.set(-6.64, 3.95, 12.5); return m; }

/* ---------- Wi-Fi Devboard (procedural, mm, official module outline) ---------- */
function devboard() {
  const g = new THREE.Group();
  /* outline from flipperzero-3d-models/external-module (67.34 × 20 mm incl. 2.6 mm connector tabs) */
  const s = new THREE.Shape();
  [[1.2, 0], [3, 0], [3, -2.6], [23.7, -2.6], [23.7, 0], [38.56, 0], [38.56, -2.6], [64.34, -2.6], [64.34, 0], [66.14, 0], [67.34, 1.2], [67.34, 16.2], [66.14, 17.4], [1.2, 17.4], [0, 16.2], [0, 1.2]]
    .forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
  const pcb = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false }), std(0x1f6b3c, { roughness: 0.55 }));
  pcb.position.z = -0.6; g.add(pcb);
  const put = (m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
  /* ESP32-S2-WROVER: module PCB, shielded can, antenna zone at the far left */
  put(box(31, 18, 0.8, std(0x0f2f20)), 15.5, 9.4, 1.0);
  put(box(25, 15.6, 3.0, SILVER), 18.5, 9.4, 2.9);
  put(box(5.4, 16, 0.3, std(0x1a1d22, { roughness: 0.8 })), 3, 9.4, 1.55);
  put(box(3.6, 12, 0.1, std(0xc9a44a, { metalness: 0.6, roughness: 0.4 })), 3, 9.4, 1.75);
  /* pin-label silkscreen block, LEDs, buttons, USB-C */
  put(box(13, 11, 0.15, std(0xe9ecef, { roughness: 0.9 })), 40, 9, 0.68);
  const led = (c, x) => put(box(1.6, 0.9, 0.7, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })), x, 15.2, 0.95);
  g.leds = [led(ORANGE, 47.5), led(CYAN, 50.5)];
  [51.5, 58.5].forEach((x) => { put(box(4.2, 4.2, 1.6, std(0x8a8f96, { metalness: 0.6 })), x, 8.2, 1.4); const c = cyl(1.3, 1, BLACK); c.rotation.x = Math.PI / 2; put(c, x, 8.2, 2.7); });
  put(box(8.9, 3.2, 7.4, SILVER), 63, 6.6, 4.3);
  put(box(2, 1.6, 6.4, BLACK), 67.4, 6.6, 4.3);
  /* 18 right-angle pins in the official 8 + 10 layout (2.54 mm pitch), plastic header bodies behind the board */
  const pins = [...Array(8)].map((_, i) => 4.47 + i * 2.54).concat([...Array(10)].map((_, i) => 40.03 + i * 2.54));
  pins.forEach((x) => { const p = cyl(0.32, 10.4, GOLD, 8); put(p, x, -3.7, -1.85); });
  put(box(20.5, 2.6, 2.5, BLACK), 13.36, 1.25, -1.85);
  put(box(25.6, 2.6, 2.5, BLACK), 51.46, 1.25, -1.85);
  g.waves = rings(3, { color: CYAN, max: 26, thick: 0.02, period: 2.2, alpha: 0.5 });
  g.waves.position.set(3, 9.4, 2); g.add(g.waves);
  g.tick = (t) => { g.waves.tick(t); g.leds[0].material.color.setHex(Math.sin(t * 6) > 0 ? ORANGE : 0x40200a); };
  return g;
}
/* board standing on the Flipper's GPIO edge (screen frame, mm) */
function attachBoard(wrap, b) { b.position.set(-31.39, 20.3, 0.2); wrap.add(b); return b; }

/* ---------- scenes ---------- */
const scenes = {
  flipper(api) {
    const { rig, opts, host } = api;
    api.fitWidth = opts.hero ? 8 : 6.4; api.elev = 0.9; api.tilt = 0.12;
    const g = new THREE.Group(); rig.add(g);
    const sh = shadow(7, 4.2); sh.position.y = -1.25; g.add(sh);
    const spec = Object.assign({}, PX ? PX.MODES[opts.mode || "subghz"] : {});
    const screen = flipperLcd(spec);
    const sig = rings(3, { color: ORANGE, max: 3.4, period: 3, thick: 0.01 }); sig.position.set(-1.9, 0.2, 0.75); g.add(sig);
    let board = null;
    loadFlipper().then((src) => {
      const wrap = flipperModel(src); wrap.add(screen); g.add(wrap);
      if (opts.hero) { board = attachBoard(wrap, devboard()); board.visible = false; setMode(stage ? stage.getAttribute("data-mode") : "subghz"); }
      host.classList.add("scene3d-model"); host.parentElement.classList.add("has-scene3d"); api.kick();
    }).catch(() => host.classList.add("scene3d-failed"));
    const stage = host.closest("[data-signal-stage]");
    let dy = 0;
    const setMode = (m) => { Object.assign(spec, PX.MODES[m] || PX.MODES.subghz); screen.tick(0, true); if (board) board.visible = m === "wifi"; sig.visible = m !== "wifi"; if (opts.hero) { api.fitWidth = m === "wifi" ? 8.8 : 8; dy = m === "wifi" ? -0.55 : 0; api.resize(); } api.kick(); };
    if (stage) new MutationObserver(() => setMode(stage.getAttribute("data-mode") || "subghz")).observe(stage, { attributes: true, attributeFilter: ["data-mode"] });
    return (t, animate) => { g.position.y = dy + (animate ? Math.sin(t * 0.8) * 0.06 : 0); sig.tick(t); screen.tick(t); if (board && board.visible) board.tick(t); };
  },

  devboard(api) {
    const { rig, opts, host } = api;
    const g = new THREE.Group(); rig.add(g);
    const b = devboard();
    if (opts.attach) {
      api.fitWidth = 7.8; api.elev = 1.6; api.tilt = 0.3;
      loadFlipper().then((src) => { const wrap = flipperModel(src); wrap.add(flipperLcd(Object.assign({}, PX.MODES.wifi))); attachBoard(wrap, b); g.add(wrap); host.classList.add("scene3d-model"); api.kick(); }).catch(() => host.classList.add("scene3d-failed"));
      const l = label("STANDS ON THE 18-PIN GPIO EDGE · PINS GO 6 MM IN", { size: 0.22 }); l.position.set(0, -1.65, 0.5); g.add(l);
    } else {
      api.fitWidth = 4.9; api.elev = 0.7; api.tilt = 0.15; api.sway = 0.35;
      const w = new THREE.Group(); w.scale.setScalar(MM); b.position.set(-33.67, -7.4, 0); w.add(b); g.add(w);
      const sh = shadow(4.4, 2.2); sh.position.y = -0.95; g.add(sh);
      [["ESP32-S2 · 2.4 GHZ", -0.55, 1.0], ["USB-C", 1.5, 0.72], ["8 + 10 PINS · 2.54 MM", 0.2, -0.85]].forEach(([s, x, y]) => { const l = label(s); l.position.set(x, y, 0.4); g.add(l); });
      host.parentElement.classList.add("has-scene3d");
    }
    return (t, animate) => { g.position.y = animate && !opts.attach ? Math.sin(t * 0.9) * 0.05 : 0; b.tick(t); };
  },

  carrier(api) {
    const { rig, opts } = api; api.fitWidth = 8.6; api.elev = 1.1; api.tilt = 0.1;
    const g = new THREE.Group(); rig.add(g);
    const bands = opts.bands || [[315, "315 MHZ  ·  λ ≈ 95 CM"], [433.92, "433.92 MHZ  ·  λ ≈ 69 CM"]];
    const rows = bands.map((b, i) => {
      const y = ((bands.length - 1) / 2 - i) * 1.7, color = i % 2 ? ORANGE : CYAN;
      const mast = cyl(0.025, 1.1, SILVER); mast.position.set(-3.7, y, 0); g.add(mast);
      const base = box(0.5, 0.08, 0.5, BLACK); base.position.set(-3.7, y - 0.55, 0); g.add(base);
      const tb = tube(220, 0.035, color); g.add(tb);
      const l = label(b[1].replace("λ", "WAVELENGTH").replace("≈", "=")); l.position.set(-1.9, y + 0.78, 0); g.add(l);
      const L = (300 / b[0]) * 2.2, bar = box(L, 0.03, 0.03, std(color)); bar.position.set(-3.4 + L / 2, y - 0.62, 0); g.add(bar);
      const rr = rings(2, { color, max: 1.1, period: 2, thick: 0.02 }); rr.position.set(-3.7, y, 0); g.add(rr);
      return { y, f: b[0], tb, rr, L };
    });
    const pts = [];
    return (t) => rows.forEach((r) => {
      const k = (2 * Math.PI) / r.L, w = 2 * Math.PI * 0.9 * (r.f / 433.92);
      for (let i = 0; i <= r.tb.n; i++) { const u = i / r.tb.n, x = -3.5 + u * 7; pts[i] = [x, r.y + 0.42 * Math.min(1, u * 8) * Math.sin(k * (x + 3.5) - w * t), 0]; }
      r.tb.set(pts); r.rr.tick(t);
    });
  },

  modulation(api) {
    const { rig } = api; api.fitWidth = 9.4; api.elev = 1.0; api.tilt = 0.1;
    const g = new THREE.Group(); rig.add(g);
    const bits = [1, 0, 1, 1, 0, 0, 1, 0], BL = 0.85, V = 0.9;
    const rows = [["OOK (AM): 1 = CARRIER ON, 0 = OFF", 0.95, ORANGE], ["FSK (FM): THE BIT SHIFTS THE FREQUENCY", -1.45, CYAN]].map(([s, y, c]) => {
      const l = label(s, { size: 0.22 }); l.position.set(-1.2, y + 0.68, 0); g.add(l);
      const tb = tube(260, 0.035, c); g.add(tb);
      return { y, tb };
    });
    const blocks = [...Array(10)].map(() => { const m = box(0.34, 0.34, 0.34, std(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.4 })); g.add(m); return m; });
    const pts = [];
    return (t) => {
      const off = t * V, bit = (x) => bits[((Math.floor((x + 3.5 + off) / BL) % 8) + 8) % 8];
      blocks.forEach((m, j) => { const x = -3.5 + j * BL - (off % BL) + BL / 2, b = bits[((j + Math.floor(off / BL)) % 8 + 8) % 8]; m.position.set(x, 2.15, 0); m.visible = x < 3.5 && x > -3.5; m.material.emissiveIntensity = b ? 0.6 : 0; m.material.color.setHex(b ? ORANGE : 0x2a3446); });
      rows.forEach((r, i) => {
        let ph = 0, px = -3.5;
        for (let k = 0; k <= r.tb.n; k++) {
          const x = -3.5 + (k / r.tb.n) * 7, b = bit(x);
          const freq = i === 0 ? 2 * Math.PI / 0.5 : b ? 2 * Math.PI / 0.3 : 2 * Math.PI / 0.62;
          ph += freq * (x - px); px = x;
          pts[k] = [x, r.y + (i === 0 ? (b ? 0.42 : 0.03) : 0.42) * Math.sin(ph - t * 6), 0];
        }
        r.tb.set(pts);
      });
    };
  },

  pulses(api) {
    const { rig } = api; api.fitWidth = 8.6; api.elev = 1.0; api.tilt = 0.1;
    const g = new THREE.Group(); rig.add(g);
    const bits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1], TE = 0.22, SYM = TE * 4, TOTAL = SYM * bits.length, V = 0.8;
    const tb = tube(320, 0.04, ORANGE); g.add(tb);
    const hi = label("HIGH  (CARRIER ON)"); hi.position.set(-2.9, 1.15, 0); g.add(hi);
    const lo = label("LOW  (SILENCE)"); lo.position.set(-3.05, -0.75, 0); g.add(lo);
    const te = label("1 = LONG-SHORT   0 = SHORT-LONG   TE = 400 US"); te.position.set(0, 1.75, 0); g.add(te);
    const blocks = bits.map(() => { const m = box(0.3, 0.3, 0.3, std(ORANGE, { emissive: ORANGE })); g.add(m); return m; });
    const level = (x) => { const p = ((x + 3.5 + t0) % TOTAL + TOTAL) % TOTAL, i = Math.floor(p / SYM), f = (p - i * SYM) / TE; return bits[i] ? (f < 3 ? 1 : 0) : (f < 1 ? 1 : 0); };
    let t0 = 0; const pts = [];
    return (t) => {
      t0 = t * V;
      for (let k = 0; k <= tb.n; k++) { const x = -3.5 + (k / tb.n) * 7; pts[k] = [x, level(x) ? 0.55 : -0.25, 0]; }
      tb.set(pts);
      blocks.forEach((m, i) => { let p = i * SYM + SYM / 2 - (t0 % TOTAL); if (p < 0) p += TOTAL; const x = -3.5 + p; m.position.set(x, -1.35, 0); m.visible = x < 3.5; m.material.emissiveIntensity = bits[i] ? 0.5 : 0; m.material.color.setHex(bits[i] ? ORANGE : 0x2a3446); });
    };
  },

  rolling(api) {
    const { rig } = api; api.fitWidth = 8.4; api.elev = 1.0; api.tilt = 0.1;
    const g = new THREE.Group(); rig.add(g);
    const remote = box(0.7, 1.2, 0.3, std(0x2d3340)); remote.position.set(-2.5, 0, 0); g.add(remote);
    const btn = cyl(0.14, 0.12, std(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.3 })); btn.rotation.x = Math.PI / 2; btn.position.set(-2.5, 0.25, 0.2); g.add(btn);
    const rx = box(1.3, 1.5, 0.5, std(0x2d3340)); rx.position.set(2.4, 0, 0); g.add(rx);
    const ledM = new THREE.MeshBasicMaterial({ color: 0x334455, toneMapped: false }), led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), ledM); led.position.set(2.4, 0.5, 0.3); g.add(led);
    const rl = label("RECEIVER · NEXT 0042", { size: 0.2 }); rl.position.set(2.1, 1.3, 0); g.add(rl);
    const tl = label("REMOTE · COUNTER 0041", { size: 0.2 }); tl.position.set(-2.2, 1.2, 0); g.add(tl);
    let msg = label("A NEW CODE EVERY PRESS", { size: 0.22 }); msg.position.set(0, -1.3, 0); g.add(msg);
    const events = [
      { t0: 0.5, code: "0042", ok: true, rx: "NEXT 0043", tx: "COUNTER 0042", say: "FRESH COUNTER 0042 · ACCEPTED" },
      { t0: 3, code: "0043", ok: true, rx: "NEXT 0044", tx: "COUNTER 0043", say: "FRESH COUNTER 0043 · ACCEPTED" },
      { t0: 5.5, code: "0042", ok: false, rx: "NEXT 0044", tx: "REPLAY OF 0042", say: "STALE COUNTER 0042 · REJECTED" },
    ];
    let packet = label("0042", { scale: 3, color: "#0b0f1a", bg: "#ff8a34" }); packet.visible = false; g.add(packet);
    const state = { shown: -1 };
    const swap = (old, text, x, y) => { g.remove(old); const l = label(text, { size: y < 0 ? 0.22 : 0.2 }); l.position.set(x, y, 0); g.add(l); return l; };
    let rlab = rl, tlab = tl;
    return (t) => {
      const T = t % 8, ev = events.find((e) => T >= e.t0 && T < e.t0 + 2.4), i = events.indexOf(ev);
      if (ev && state.shown !== i) { state.shown = i; g.remove(packet); packet = label(ev.code, { scale: 3, color: "#0b0f1a", bg: ev.ok ? "#ff8a34" : "#ff6a86" }); g.add(packet); msg = swap(msg, ev.say, 0, -1.3); tlab = swap(tlab, "REMOTE · " + ev.tx, -2.2, 1.2); }
      if (!ev) { if (state.shown !== -1 && T < 0.5) { state.shown = -1; msg = swap(msg, "A NEW CODE EVERY PRESS", 0, -1.3); rlab = swap(rlab, "RECEIVER · NEXT 0042", 2.1, 1.3); } packet.visible = false; ledM.color.setHex(0x334455); btn.position.z = 0.2; return; }
      const u = (T - ev.t0) / 2.4, fly = clamp(u / 0.5, 0, 1);
      btn.position.z = u < 0.08 ? 0.12 : 0.2;
      packet.visible = true;
      const back = !ev.ok && u > 0.5 ? clamp((u - 0.5) / 0.3, 0, 1) : 0;
      packet.position.set(-2.1 + fly * 3.9 - back * 1.2, 0.2 + Math.sin(fly * Math.PI) * 0.5 + back * 0.4, 0.4);
      ledM.color.setHex(u > 0.5 ? (ev.ok ? GREEN : RED) : 0x334455);
      if (u > 0.5 && ev.ok && rlab.userData.rx !== ev.rx) { rlab = swap(rlab, "RECEIVER · " + ev.rx, 2.1, 1.3); rlab.userData.rx = ev.rx; }
    };
  },

  nearfield(api) {
    const { rig, opts } = api; api.fitWidth = 7.6; api.elev = 1.4; api.tilt = 0.25;
    const g = new THREE.Group(); rig.add(g);
    const nfc = opts.kind === "card";
    const reader = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 10, 64), std(0xc97b3a, { metalness: 0.7, roughness: 0.35 })); reader.rotation.y = Math.PI / 2; reader.position.set(-1.6, 0, 0); g.add(reader);
    const base = box(0.3, 2, 2, std(0x2d3340)); base.position.set(-1.95, 0, 0); g.add(base);
    const rl = label(nfc ? "READER COIL  ·  13.56 MHZ" : "READER COIL  ·  125 KHZ"); rl.position.set(-1.6, 1.45, 0); g.add(rl);
    const tag = new THREE.Group(); g.add(tag);
    if (nfc) { tag.add(box(0.04, 1.1, 1.7, std(0xf2f1ec))); const coil = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 8, 4), std(0xc97b3a, { metalness: 0.7 })); coil.rotation.y = Math.PI / 2; coil.rotation.x = Math.PI / 4; coil.position.x = 0.03; tag.add(coil); const chip = box(0.05, 0.25, 0.3, GOLD); chip.position.set(0.03, 0.25, -0.45); tag.add(chip); }
    else { const fob = box(0.12, 0.9, 0.65, std(0x22262e)); tag.add(fob); const coil = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 8, 40), std(0xc97b3a, { metalness: 0.7 })); coil.rotation.y = Math.PI / 2; coil.position.x = 0.07; tag.add(coil); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 24), SILVER); ring.position.set(0, 0.55, 0); tag.add(ring); }
    const tl = label(nfc ? "CARD  ·  ISO 14443" : "KEY FOB  ·  EM4100"); tl.position.set(1.4, 1.2, 0); g.add(tl);
    const lines = [], mat = new THREE.LineDashedMaterial({ color: CYAN, dashSize: 0.12, gapSize: 0.1, transparent: true, opacity: 0.7, toneMapped: false });
    for (let i = 0; i < 6; i++) {
      const r = 0.35 + i * 0.22, pts = new THREE.EllipseCurve(0, 0, 1.6 + i * 0.2, r, 0, Math.PI * 2, false, 0).getPoints(90).map((p) => new THREE.Vector3(p.x, p.y, 0));
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat.clone()); l.computeLineDistances(); l.rotation.x = (i % 3) * (Math.PI / 3); g.add(l); lines.push(l);
    }
    const st = label("FIELD POWERS THE TAG · TAG ANSWERS BY LOADING THE FIELD"); st.position.set(0, -1.35, 0); g.add(st);
    let far = label("OUT OF RANGE · NO POWER, NO ID"); far.position.set(0, -1.35, 0); far.visible = false; g.add(far);
    return (t) => {
      const x = 1.4 + Math.max(0, Math.sin(t * 0.45)) * 1.6, near = x < 2.2;
      tag.position.set(x, 0, 0); tag.rotation.z = Math.sin(t * 0.7) * 0.08;
      lines.forEach((l, i) => { l.material.dashOffset = -t * 0.8; l.material.opacity = near ? 0.75 - i * 0.07 : 0.12; l.material.needsUpdate = true; });
      st.visible = near; far.visible = !near;
    };
  },

  infrared(api) {
    const { rig } = api; api.fitWidth = 8.2; api.elev = 1.0; api.tilt = 0.1;
    const g = new THREE.Group(); rig.add(g);
    const remote = box(0.5, 0.9, 0.3, std(0x22262e)); remote.position.set(-2.9, -0.1, 0); g.add(remote);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color: 0x8b6cff, toneMapped: false })); dome.position.set(-2.62, 0.2, 0); g.add(dome);
    const rxb = box(0.7, 0.9, 0.6, std(0x2d3340)); rxb.position.set(2.9, 0, 0); g.add(rxb);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), std(0x0a0a10, { roughness: 0.2 })); eye.position.set(2.53, 0.2, 0); g.add(eye);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.75, 5, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x8b6cff, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })); cone.rotation.z = Math.PI / 2; cone.position.set(0, 0.2, 0); g.add(cone);
    [["IR LED · 940 NM", -2.6, 0.95], ["38 KHZ BURSTS = MARK · GAPS = SPACE", 0, 1.5], ["RECEIVER", 2.7, 0.95]].forEach(([s, x, y]) => { const l = label(s, { size: 0.22 }); l.position.set(x, y, 0); g.add(l); });
    const N = 96, pattern = "1101001110100101", dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0xb39cff, toneMapped: false }), N); g.add(dots);
    const out = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshBasicMaterial({ color: 0x334455, toneMapped: false })); out.position.set(2.9, 0.62, 0.35); g.add(out);
    const m4 = new THREE.Matrix4(), hide = new THREE.Matrix4().makeScale(0, 0, 0);
    return (t) => {
      const cyc = 3.2;
      for (let i = 0; i < N; i++) {
        const s = (((t / cyc) - i / N) % 1 + 1) % 1, slot = Math.floor(s * 16), on = pattern[(slot + Math.floor(t / cyc) * 3) % 16] === "1";
        if (on) { m4.makeTranslation(-2.5 + s * 5, 0.2 + Math.sin(i * 7.3) * 0.18 * s, Math.cos(i * 5.1) * 0.18 * s); dots.setMatrixAt(i, m4); } else dots.setMatrixAt(i, hide);
      }
      dots.instanceMatrix.needsUpdate = true;
      out.material.color.setHex(pattern[(Math.floor(((t / cyc) % 1) * 16) + 15 + Math.floor(t / cyc) * 3) % 16] === "1" ? GREEN : 0x334455);
    };
  },

  gpio(api) {
    const { rig } = api; api.fitWidth = 6; api.elev = 1.3; api.tilt = 0.35;
    const g = new THREE.Group(); rig.add(g);
    /* Flipper 18-pin edge: 8 + 10 sockets, 2.54 mm pitch (positions from the official module outline) */
    const P = 2.54 * MM, xs = [...Array(8)].map((_, i) => (4.47 + i * 2.54 - 33.67) * MM).concat([...Array(10)].map((_, i) => (40.03 + i * 2.54 - 33.67) * MM));
    const hdr = (x0, x1) => { const m = box(x1 - x0 + P, 0.18, 0.2, BLACK); m.position.set((x0 + x1) / 2, 0, 0); g.add(m); };
    hdr(xs[0], xs[7]); hdr(xs[8], xs[17]);
    const names = { 0: "5V", 1: "PA7", 7: "GND", 8: "3V3", 10: "GND", 17: "GND" };
    xs.forEach((x, i) => { const pad = box(P * 0.7, 0.02, P * 0.7, GOLD); pad.position.set(x, 0.1, 0); g.add(pad); const hole = box(P * 0.35, 0.03, P * 0.35, std(0x050608)); hole.position.set(x, 0.105, 0); g.add(hole);
      if (names[i]) { const l = label(names[i], { scale: 1, size: 0.15 }); l.position.set(x, i % 2 ? -0.38 : -0.2, 0.16); g.add(l); } });
    const shell = box(xs[17] - xs[0] + 0.6, 0.5, 1.4, std(0xf2f1ec)); shell.position.set(0, -0.35, -0.5); g.add(shell);
    /* PA7 → 1 kΩ → LED → GND (the lesson's teaching circuit), current shown as moving charge */
    const A = xs[1], G = xs[7], top = 1.15, mid = (A + G) / 2;
    const path = [[A, 0.12, 0], [A, 0.55, 0], [A - 0.75, 0.55, 0], [A - 0.75, top, 0], [G + 0.75, top, 0], [G + 0.75, 0.55, 0], [G, 0.55, 0], [G, 0.12, 0]];
    const wire = tube(path.length * 8, 0.018, 0xcc4b2a, 0); wire.set([...Array(wire.n + 1)].map((_, i) => { const u = (i / wire.n) * (path.length - 1), k = Math.min(path.length - 2, Math.floor(u)), f = u - k; return path[k].map((v, j) => v + (path[k + 1][j] - v) * f); })); g.add(wire);
    const res = cyl(0.07, 0.42, std(0xd9c39a)); res.position.set(A - 0.75, 0.85, 0); g.add(res);
    [[-0.1, 0x8b5a2b], [0, 0x111111], [0.1, RED]].forEach(([dy, c]) => { const b = cyl(0.075, 0.04, std(c)); b.position.set(A - 0.75, 0.85 + dy, 0); g.add(b); });
    const ledM = std(0xff3b3b, { emissive: 0xff2020, emissiveIntensity: 0, roughness: 0.3, transparent: true, opacity: 0.85 });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), ledM); led.position.set(mid, top, 0); g.add(led);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff4040, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); halo.position.copy(led.position); g.add(halo);
    [["PA7 HIGH (3.3 V) - 1 KOHM - LED - GND", 0, 1.75], ["1 KOHM", A - 1.25, 0.85], ["LED", mid, 1.45], ["I = (3.3 V - 2 V) / 1 KOHM = 1.3 MA", 0.4, -0.75]].forEach(([s, x, y]) => { const l = label(s, { scale: 1, size: 0.14 }); l.position.set(x, y, 0.2); g.add(l); });
    const N = 24, q = new THREE.InstancedMesh(new THREE.SphereGeometry(0.028, 8, 6), new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false }), N); g.add(q);
    const m4 = new THREE.Matrix4(), hide = new THREE.Matrix4().makeScale(0, 0, 0), pos = wire.geometry.attributes.position;
    return (t) => {
      const on = t % 2 < 1; ledM.emissiveIntensity = on ? 1.6 : 0; halo.material.opacity = on ? 0.25 : 0;
      for (let i = 0; i < N; i++) { if (!on) { q.setMatrixAt(i, hide); continue; } const u = ((t * 0.35 + i / N) % 1), k = Math.floor(u * wire.n) * 6 * 3; m4.makeTranslation(pos.array[k], pos.array[k + 1] + 0.02, pos.array[k + 2] + 0.02); q.setMatrixAt(i, m4); }
      q.instanceMatrix.needsUpdate = true;
    };
  },
};

/* small studio environment so metals and gloss have something to reflect */
function studioEnv(renderer) {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x1c232c);
  const panel = (w, h, x, y, z, c, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c })); m.material.color.multiplyScalar(i); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  panel(7, 7, 0, 8, 1, 0xffffff, 5); panel(4, 3, -8, 3, 4, 0xffe2c8, 2.5); panel(4, 3, 8, 2, 4, 0xc8dcff, 2); panel(20, 6, 0, -7, 0, 0x2a323c, 0.6);
  const pm = new THREE.PMREMGenerator(renderer), t = pm.fromScene(s, 0.04).texture; pm.dispose(); return t;
}

/* ---------- mounting, loop, input ---------- */
const instances = [];
function mount(host) {
  const name = host.getAttribute("data-scene3d"), build = scenes[name];
  if (!build) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }); }
  catch (e) { host.classList.add("scene3d-failed"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0; canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", host.getAttribute("data-label") || "Interactive 3D illustration. Drag or use arrow keys to rotate.");
  host.appendChild(canvas);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60), rig = new THREE.Group();
  scene.add(rig);
  scene.environment = studioEnv(renderer); scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x38414f, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff8a34, 0.9); rim.position.set(-5, 2, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xbfd7ff, 0.7); fill.position.set(-4, -2, 5); scene.add(fill);
  const opts = (() => { try { return JSON.parse(host.getAttribute("data-opts") || "{}"); } catch (e) { return {}; } })();
  const ctl = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0 };
  const api = { rig, scene, camera, host, opts, fitWidth: 6, elev: 0.6, tilt: 0, sway: 0.22, kick: () => kick(), resize: () => resize() };
  const update = build(api) || (() => {});
  let raf = 0, last = 0, t = 0;
  const inst = { host, visible: false, kick };
  function resize() {
    const w = host.clientWidth || 320, h = host.clientHeight || 180;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const d = api.fitWidth / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / camera.aspect;
    camera.position.set(0, api.elev, Math.max(d, 2.5)); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  }
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
    const animate = !motionOff();
    if (animate) t += dt;
    ctl.yaw += (ctl.tYaw - ctl.yaw) * 0.15; ctl.pitch += (ctl.tPitch - ctl.pitch) * 0.15;
    rig.rotation.set(ctl.pitch + api.tilt, ctl.yaw + (animate ? Math.sin(t * 0.45) * api.sway : 0), 0);
    update(t, animate);
    renderer.render(scene, camera);
    const moving = Math.abs(ctl.tYaw - ctl.yaw) > 1e-3 || Math.abs(ctl.tPitch - ctl.pitch) > 1e-3;
    if (inst.visible && !document.hidden && (animate || moving)) raf = requestAnimationFrame(frame); else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  let px = 0, py = 0, down = false;
  canvas.addEventListener("pointerdown", (e) => { down = true; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => { if (!down) return; ctl.tYaw += (e.clientX - px) * 0.008; ctl.tPitch = clamp(ctl.tPitch + (e.clientY - py) * 0.006, -0.7, 0.7); px = e.clientX; py = e.clientY; kick(); });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => canvas.addEventListener(ev, () => { down = false; }));
  canvas.addEventListener("keydown", (e) => { const k = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.2], ArrowDown: [0, 0.2] }[e.key]; if (!k) return; e.preventDefault(); ctl.tYaw += k[0]; ctl.tPitch = clamp(ctl.tPitch + k[1], -0.7, 0.7); kick(); });
  new ResizeObserver(() => { resize(); kick(); }).observe(host);
  resize(); host.classList.add("scene3d-ready"); instances.push(inst);
  return inst;
}
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  let inst = e.target.spScene;
  if (e.isIntersecting && !inst) inst = e.target.spScene = mount(e.target);
  if (inst) { inst.visible = e.isIntersecting; if (inst.visible) inst.kick(); }
}), { rootMargin: "120px" });
document.querySelectorAll("[data-scene3d]").forEach((el) => io.observe(el));
const kickAll = () => instances.forEach((i) => i.visible && i.kick());
document.addEventListener("visibilitychange", kickAll);
new MutationObserver(kickAll).observe(html, { attributes: true, attributeFilter: ["class"] });
if (reduced.addEventListener) reduced.addEventListener("change", kickAll);
