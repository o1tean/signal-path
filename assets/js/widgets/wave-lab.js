/* ============================================================
   Signal Path — widget: wave-lab
   Type a short bit string and watch it become a modulated radio
   wave. OOK (AM) switches the carrier on/off; FSK (FM) shifts its
   pitch. Three stacked traces: data · carrier · modulated output.
   Registers as: wave-lab
   ============================================================ */
(function () {
  "use strict";
  var SP = window.SP;
  if (!SP || !SP.registerWidget) return;

  var DEFAULT_BITS = "10110001";
  var MAX_BITS = 16;

  SP.registerWidget("wave-lab", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    var ui = SP.widgetShell(host, "Wave Lab", "turn bits into a radio wave");
    var body = ui.body;

    var state = { bits: DEFAULT_BITS, mod: "OOK", cpb: 4 }; // cpb = carrier cycles per bit

    /* ---- controls ---- */
    var controls = SP.el("div", { class: "widget-controls" });

    // bit string input
    var bitsLabel = SP.el("label", {}, ["Bits"]);
    var bitsInput = SP.el("input", {
      type: "text", value: DEFAULT_BITS, size: "18", inputmode: "numeric",
      "aria-label": "Bit string (0 and 1 only)", spellcheck: "false"
    });
    bitsInput.addEventListener("input", function () {
      var clean = sanitize(bitsInput.value);
      if (bitsInput.value !== clean) {
        var pos = bitsInput.selectionStart;
        bitsInput.value = clean;
        try { bitsInput.setSelectionRange(pos, pos); } catch (e) {}
      }
      state.bits = clean;
      draw();
      maybeAward();
    });
    bitsLabel.appendChild(bitsInput);
    controls.appendChild(bitsLabel);

    // modulation seg
    var seg = SP.el("div", { class: "seg", role: "group", "aria-label": "Modulation" });
    var segBtns = {};
    [["OOK", "OOK (AM)"], ["FSK", "FSK (FM)"]].forEach(function (m) {
      var b = SP.el("button", { type: "button", "aria-pressed": m[0] === state.mod ? "true" : "false" }, [m[1]]);
      b.addEventListener("click", function () { setMod(m[0]); });
      segBtns[m[0]] = b;
      seg.appendChild(b);
    });
    controls.appendChild(seg);

    // carrier frequency slider
    var cpbLabel = SP.el("label", {}, ["Carrier"]);
    var cpb = SP.el("input", { type: "range", min: "2", max: "10", value: String(state.cpb), style: "width:120px", "aria-label": "Carrier cycles per bit" });
    var cpbVal = SP.el("span", { class: "readout" });
    cpb.addEventListener("input", function () {
      state.cpb = parseInt(cpb.value, 10) || 4;
      updateCpbVal();
      draw();
    });
    cpbLabel.appendChild(cpb);
    cpbLabel.appendChild(cpbVal);
    controls.appendChild(cpbLabel);

    body.appendChild(controls);

    /* ---- canvas ---- */
    var canvas = SP.el("canvas", {
      class: "scope",
      style: "height:" + (compact ? 190 : 250) + "px",
      role: "img",
      "aria-label": "Three stacked waveform traces: data, carrier, and modulated output"
    });
    body.appendChild(canvas);

    var readout = SP.el("div", { class: "readout", style: "margin-top:10px", "aria-live": "polite" });
    body.appendChild(readout);

    ui.foot("<b>OOK</b> (on-off keying) is AM: the carrier is <b>on</b> for a 1, <b>off</b> for a 0. <b>FSK</b> is FM: the carrier is always on but its pitch shifts — higher for a 1, lower for a 0.");

    /* ---- helpers ---- */
    function sanitize(s) {
      return (s || "").replace(/[^01]/g, "").slice(0, MAX_BITS);
    }
    function setMod(m) {
      state.mod = m;
      Object.keys(segBtns).forEach(function (k) {
        segBtns[k].setAttribute("aria-pressed", k === m ? "true" : "false");
      });
      draw();
    }
    function updateCpbVal() { cpbVal.innerHTML = "<b>" + state.cpb + "</b> cyc/bit"; }
    updateCpbVal();

    var awarded = false;
    function maybeAward() {
      if (awarded) return;
      if (state.bits.length >= 1 && state.bits !== DEFAULT_BITS) {
        awarded = true;
        SP.award("wave-rider");
      }
    }

    /* ---- draw ---- */
    var ctx;
    function draw() {
      if (!ctx) return;
      var w = canvas.clientWidth || 600;
      var h = canvas.clientHeight || (compact ? 190 : 250);

      var bg = SP.cssVar("--scope-bg") || "#0B1220";
      var grid = SP.cssVar("--scope-grid") || "#1B2A44";
      var trace = SP.cssVar("--scope-trace") || "#3FD8D2";
      var peakC = SP.cssVar("--scope-peak") || "#FF8A34";
      var txt = SP.cssVar("--scope-text") || "#9BB3D1";

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      var bits = state.bits;
      var n = bits.length;

      var padL = 8, padR = 8, padT = 6, padB = 6;
      var x0 = padL, x1 = w - padR, plotW = x1 - x0;
      var lanes = 3;
      var laneH = (h - padT - padB) / lanes;
      var labels = ["DATA", "CARRIER", state.mod === "OOK" ? "OOK (AM)" : "FSK (FM)"];
      var laneColors = [trace, txt, peakC];

      if (n === 0) {
        ctx.fillStyle = txt; ctx.font = "12px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("Type some 0s and 1s above.", w / 2, h / 2);
        readout.innerHTML = "Waiting for bits…";
        return;
      }

      var bitW = plotW / n;

      // lane separators + labels
      var li;
      for (li = 0; li < lanes; li++) {
        var midY = padT + laneH * li + laneH / 2;
        // dim center baseline
        ctx.strokeStyle = grid; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, midY + 0.5); ctx.lineTo(x1, midY + 0.5); ctx.stroke();
        // label
        ctx.fillStyle = laneColors[li]; ctx.font = "10px monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillText(labels[li], x0 + 2, padT + laneH * li + 2);
      }

      // vertical bit boundaries (faint) across whole plot
      ctx.strokeStyle = grid; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
      var bi;
      for (bi = 0; bi <= n; bi++) {
        var bx = x0 + bitW * bi;
        ctx.beginPath(); ctx.moveTo(bx + 0.5, padT); ctx.lineTo(bx + 0.5, h - padB); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      var amp = laneH * 0.34;

      /* lane 0: digital data square wave */
      var dataMid = padT + laneH * 0 + laneH / 2;
      ctx.strokeStyle = trace; ctx.lineWidth = 2; ctx.beginPath();
      for (bi = 0; bi < n; bi++) {
        var hi = bits.charAt(bi) === "1";
        var yv = dataMid - (hi ? amp : -amp);
        var sx = x0 + bitW * bi, ex = x0 + bitW * (bi + 1);
        if (bi === 0) ctx.moveTo(sx, yv);
        else ctx.lineTo(sx, yv); // vertical transition drawn implicitly by shared x
        ctx.lineTo(ex, yv);
      }
      ctx.stroke();
      // bit labels
      ctx.fillStyle = txt; ctx.font = "10px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      for (bi = 0; bi < n && bitW > 12; bi++) {
        ctx.fillText(bits.charAt(bi), x0 + bitW * (bi + 0.5), dataMid + laneH * 0.42);
      }

      /* lane 1: pure carrier reference */
      var carrMid = padT + laneH * 1 + laneH / 2;
      drawSine(ctx, x0, x1, carrMid, amp, function () { return state.cpb; }, bitW, txt, 1.3);

      /* lane 2: modulated output */
      var modMid = padT + laneH * 2 + laneH / 2;
      if (state.mod === "OOK") {
        drawOOK(ctx, x0, modMid, amp, bits, bitW, state.cpb, peakC, grid);
      } else {
        drawFSK(ctx, x0, modMid, amp, bits, bitW, state.cpb, peakC);
      }

      var ones = 0; for (bi = 0; bi < n; bi++) if (bits.charAt(bi) === "1") ones++;
      readout.innerHTML = "<b>" + n + "</b> bits · " + state.mod +
        (state.mod === "OOK"
          ? " — carrier on for the " + ones + " one-bit" + (ones === 1 ? "" : "s") + ", silent for the " + (n - ones) + " zero" + (n - ones === 1 ? "" : "s") + "."
          : " — carrier always on, pitch shifting between " + ones + " high and " + (n - ones) + " low bits.");
    }

    // continuous sine across the whole lane at a fixed cycles/bit
    function drawSine(ctx, x0, x1, midY, amp, freqFn, bitW, color, lw) {
      ctx.strokeStyle = color; ctx.lineWidth = lw || 1.5; ctx.beginPath();
      var phase = 0, x, first = true;
      var step = 1;
      for (x = x0; x <= x1; x += step) {
        var f = freqFn(x);
        phase += (2 * Math.PI * f / bitW) * step;
        var y = midY - Math.sin(phase) * amp;
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function drawOOK(ctx, x0, midY, amp, bits, bitW, cpb, color, grid) {
      ctx.lineWidth = 1.7;
      var phase = 0, x, first = true, penDown = false;
      for (x = x0; x <= x0 + bitW * bits.length; x += 1) {
        var bi = Math.floor((x - x0) / bitW);
        if (bi >= bits.length) bi = bits.length - 1;
        var on = bits.charAt(bi) === "1";
        phase += (2 * Math.PI * cpb / bitW);
        if (on) {
          var y = midY - Math.sin(phase) * amp;
          if (!penDown) { ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(x, y); penDown = true; }
          else ctx.lineTo(x, y);
        } else {
          if (penDown) { ctx.stroke(); penDown = false; }
        }
      }
      if (penDown) ctx.stroke();
      // flat baseline over silent (0) bits so "off" reads clearly
      ctx.strokeStyle = grid; ctx.lineWidth = 1.4;
      for (var b = 0; b < bits.length; b++) {
        if (bits.charAt(b) === "0") {
          ctx.beginPath();
          ctx.moveTo(x0 + bitW * b, midY);
          ctx.lineTo(x0 + bitW * (b + 1), midY);
          ctx.stroke();
        }
      }
    }

    function drawFSK(ctx, x0, midY, amp, bits, bitW, cpb, color) {
      var loF = cpb * 0.75, hiF = cpb * 1.6;
      ctx.strokeStyle = color; ctx.lineWidth = 1.7; ctx.beginPath();
      var phase = 0, x, first = true;
      var end = x0 + bitW * bits.length;
      for (x = x0; x <= end; x += 1) {
        var bi = Math.floor((x - x0) / bitW);
        if (bi >= bits.length) bi = bits.length - 1;
        var f = bits.charAt(bi) === "1" ? hiF : loF;
        phase += (2 * Math.PI * f / bitW);
        var y = midY - Math.sin(phase) * amp;
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    /* ---- boot ---- */
    var fit = SP.fitCanvas(canvas, function () { draw(); });
    ctx = fit.ctx;
    draw();
    document.addEventListener("sp:theme", function () { draw(); });
  });
})();
