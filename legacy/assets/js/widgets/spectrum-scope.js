/* ============================================================
   Signal Path — widget: spectrum-scope
   A simulated spectrum analyzer. Pick a Sub-GHz band, watch the
   noise floor jitter, then "press" a remote to see its peak and RSSI.
   Registers as: spectrum-scope
   ============================================================ */
(function () {
  "use strict";
  var SP = window.SP;
  if (!SP || !SP.registerWidget) return;

  var BANDS = {
    "low":  { lo: 300, hi: 348, label: "300–348" },
    "mid":  { lo: 387, hi: 464, label: "387–464" },
    "high": { lo: 779, hi: 928, label: "779–928" },
    "full": { lo: 300, hi: 928, label: "Full 300–928" }
  };
  var BAND_ORDER = ["low", "mid", "high", "full"];

  var REMOTES = [
    { freq: 433.92, name: "Garage",  band: "mid"  },
    { freq: 315.00, name: "Fob",     band: "low"  },
    { freq: 868.00, name: "Sensor",  band: "high" }
  ];

  SP.registerWidget("spectrum-scope", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    var ui = SP.widgetShell(host, "Spectrum scope", "watch the band, press a remote");
    var body = ui.body;

    /* ---- state ---- */
    var state = {
      band: "mid",
      distance: 20,        // 0 near … 100 far
      signal: null         // { freq, name, born }
    };

    /* ---- controls ---- */
    var controls = SP.el("div", { class: "widget-controls" });

    // band select
    var bandLabel = SP.el("label", {}, ["Band"]);
    var bandSel = SP.el("select", { "aria-label": "Frequency band" });
    BAND_ORDER.forEach(function (k) {
      bandSel.appendChild(SP.el("option", { value: k, text: BANDS[k].label }));
    });
    bandSel.value = state.band;
    bandSel.addEventListener("change", function () { setBand(bandSel.value); });
    bandLabel.appendChild(bandSel);
    controls.appendChild(bandLabel);

    // distance slider
    var distLabel = SP.el("label", {}, ["Distance"]);
    var dist = SP.el("input", { type: "range", min: "0", max: "100", value: String(state.distance), "aria-label": "Distance to transmitter" });
    var distVal = SP.el("span", { class: "readout" });
    dist.addEventListener("input", function () {
      state.distance = parseInt(dist.value, 10) || 0;
      updateDistVal();
      if (SP.reducedMotion) render();
    });
    distLabel.appendChild(dist);
    distLabel.appendChild(distVal);
    controls.appendChild(distLabel);

    body.appendChild(controls);

    /* ---- remote buttons ---- */
    var remoteRow = SP.el("div", { class: "btn-row" });
    remoteRow.appendChild(SP.el("span", { class: "readout", text: "Remotes:" }));
    REMOTES.forEach(function (r) {
      var b = SP.el("button", {
        class: "btn small", type: "button",
        title: "Transmit a burst at " + r.freq + " MHz"
      }, [r.freq + " " + r.name]);
      b.addEventListener("click", function () { fire(r); });
      remoteRow.appendChild(b);
    });
    body.appendChild(remoteRow);

    /* ---- canvas ---- */
    var canvas = SP.el("canvas", {
      class: "scope",
      style: "height:" + (compact ? 170 : 240) + "px; margin-top:12px",
      role: "img",
      "aria-label": "Simulated spectrum analyzer display"
    });
    body.appendChild(canvas);

    /* ---- readout line ---- */
    var readout = SP.el("div", { class: "readout", "aria-live": "polite", style: "margin-top:10px" });
    body.appendChild(readout);

    ui.foot("The <b>peak</b> is the signal; the <b>fuzz</b> along the bottom is the noise floor — the radio background that's always there.");

    /* ---- noise buffer ---- */
    var noise = [];
    var NOISE_N = 200;
    function makeNoise() {
      noise.length = 0;
      var prev = 0.4;
      for (var i = 0; i < NOISE_N; i++) {
        // light smoothing so it reads as a floor, not static
        prev = prev * 0.55 + Math.random() * 0.45;
        noise.push(prev);
      }
    }
    makeNoise();

    /* ---- helpers ---- */
    function setBand(k) {
      if (!BANDS[k]) return;
      state.band = k;
      if (bandSel.value !== k) bandSel.value = k;
      if (SP.reducedMotion) render();
    }
    function updateDistVal() {
      distVal.innerHTML = "<b>" + state.distance + "%</b>";
    }
    updateDistVal();

    var clearTimer = null;
    function fire(r) {
      // make sure the peak is on-screen: hop to its native band if hidden
      var b = BANDS[state.band];
      if (r.freq < b.lo || r.freq > b.hi) setBand(r.band);
      state.signal = { freq: r.freq, name: r.name, born: now() };
      render(); // instant feedback; the rAF loop (if any) continues the decay
      if (SP.reducedMotion) {
        if (clearTimer) clearTimeout(clearTimer);
        clearTimer = setTimeout(function () { state.signal = null; render(); }, 1500);
      }
    }
    function now() {
      return (window.performance && performance.now) ? performance.now() : Date.now();
    }

    function rssiFor(dist) {
      return Math.round(-38 - (dist / 100) * 57); // -38 (near) … -95 (far) dBm
    }
    function peakFracFor(dist) {
      return 0.9 - (dist / 100) * 0.72;           // 0.90 (near) … 0.18 (far)
    }

    /* ---- render ---- */
    var ctx;
    function render(ts) {
      if (!ctx) return;
      if (ts == null) ts = now();
      var w = canvas.clientWidth || 600;
      var h = canvas.clientHeight || (compact ? 170 : 240);

      var bg = SP.cssVar("--scope-bg") || "#0B1220";
      var grid = SP.cssVar("--scope-grid") || "#1B2A44";
      var trace = SP.cssVar("--scope-trace") || "#3FD8D2";
      var peakC = SP.cssVar("--scope-peak") || "#FF8A34";
      var txt = SP.cssVar("--scope-text") || "#9BB3D1";

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      var padL = 8, padR = 8, padT = 12, axisH = 22;
      var x0 = padL, x1 = w - padR, plotW = x1 - x0;
      var y0 = padT, y1 = h - axisH, plotH = y1 - y0;

      var band = BANDS[state.band], fLo = band.lo, fHi = band.hi, span = fHi - fLo;

      // horizontal grid
      ctx.strokeStyle = grid; ctx.lineWidth = 1;
      var gy;
      for (gy = 0; gy <= 4; gy++) {
        var yy = y0 + plotH * gy / 4;
        ctx.beginPath(); ctx.moveTo(x0, yy + 0.5); ctx.lineTo(x1, yy + 0.5); ctx.stroke();
      }

      // vertical ticks + MHz labels
      ctx.font = "10px monospace";
      ctx.textBaseline = "top";
      var ticks = 5, i;
      for (i = 0; i <= ticks; i++) {
        var xx = x0 + plotW * i / ticks;
        ctx.strokeStyle = grid;
        ctx.beginPath(); ctx.moveTo(xx + 0.5, y0); ctx.lineTo(xx + 0.5, y1); ctx.stroke();
        var fx = fLo + span * i / ticks;
        ctx.fillStyle = txt;
        ctx.textAlign = i === 0 ? "left" : (i === ticks ? "right" : "center");
        var lx = i === 0 ? x0 : (i === ticks ? x1 : xx);
        ctx.fillText(fx.toFixed(0), lx, y1 + 5);
      }
      ctx.textAlign = "right";
      ctx.fillStyle = txt;
      ctx.fillText("MHz", x1, y0 - 1 < 0 ? 0 : y0 - 10);

      // noise floor
      var baseY = y1 - plotH * 0.07;
      ctx.strokeStyle = trace; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      var k;
      for (k = 0; k < noise.length; k++) {
        var nx = x0 + plotW * k / (noise.length - 1);
        var ny = baseY - noise[k] * plotH * 0.12;
        if (k === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // active peak
      var sig = state.signal;
      var haveSig = false, rssi = rssiFor(state.distance);
      if (sig && sig.freq >= fLo && sig.freq <= fHi) {
        var elapsed = ts - sig.born;
        var env = 1;
        if (!SP.reducedMotion) {
          if (elapsed > 1100) env = Math.max(0, (1500 - elapsed) / 400);
        }
        if (env > 0) {
          haveSig = true;
          var px = x0 + plotW * (sig.freq - fLo) / span;
          var top = y1 - plotH * peakFracFor(state.distance) * env;
          var sigma = Math.max(plotW * 0.011, 5);

          ctx.strokeStyle = peakC; ctx.lineWidth = 2;
          ctx.beginPath();
          var started = false, sx;
          for (sx = Math.max(x0, px - sigma * 4); sx <= Math.min(x1, px + sigma * 4); sx += 1) {
            var g = Math.exp(-((sx - px) * (sx - px)) / (2 * sigma * sigma));
            var gy2 = baseY - (baseY - top) * g;
            if (!started) { ctx.moveTo(sx, gy2); started = true; } else ctx.lineTo(sx, gy2);
          }
          ctx.stroke();

          // labels above the peak
          ctx.fillStyle = peakC;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.font = "11px monospace";
          ctx.fillText(sig.freq.toFixed(2) + " MHz", clamp(px, x0 + 30, x1 - 30), top - 16);
          ctx.fillText(rssi + " dBm · " + sig.name, clamp(px, x0 + 34, x1 - 34), top - 3);
        }
      }

      // readout line
      if (haveSig) {
        readout.innerHTML = "Receiving <b>" + sig.freq.toFixed(2) + " MHz</b> (" + sig.name +
          ") · RSSI <b>" + rssi + " dBm</b> — " + (state.distance < 40 ? "strong, close by" : (state.distance < 75 ? "usable" : "weak, far away"));
      } else {
        readout.innerHTML = "Noise floor only (≈ <b>-100 dBm</b>). Press a remote to transmit a burst.";
      }
    }

    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    /* ---- boot canvas + loop ---- */
    var fit = SP.fitCanvas(canvas, function () { render(); });
    ctx = fit.ctx;
    render(); // paint immediately (fitCanvas's first draw ran before ctx was set)

    document.addEventListener("sp:theme", function () { render(); });

    if (!SP.reducedMotion) {
      var lastNoise = 0;
      var raf;
      var loop = function (ts) {
        if (state.signal && ts - state.signal.born > 1500) state.signal = null;
        if (ts - lastNoise > 70) { makeNoise(); lastNoise = ts; }
        render(ts);
        raf = window.requestAnimationFrame(loop);
      };
      raf = window.requestAnimationFrame(loop);
    } else {
      render();
    }
  });
})();
