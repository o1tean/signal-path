/* ============================================================
   Signal Path — widget: pulse-decoder
   Watch an on/off (OOK) pulse train turn into bits, one pulse
   pair at a time. Simple TE-based model:
     bit 0 = short HIGH + long  LOW   (1×TE high, 3×TE low)
     bit 1 = long  HIGH + short LOW   (3×TE high, 1×TE low)
   TE = "timing element" (Princeton-style, e.g. 400 µs).
   ============================================================ */
(function () {
  "use strict";
  if (!window.SP || !SP.registerWidget) return;

  /* Two sample captures. Keys are MSB-first, matching a .sub "Key" field. */
  var SAMPLES = [
    {
      id: "garage",
      label: "Garage (Princeton 24-bit)",
      te: 400,
      proto: "Princeton",
      hex: "8C5A3B",
      bits: hexToBits("8C5A3B", 24)
    },
    {
      id: "flo",
      label: "Nice FLO (fixed 12-bit)",
      te: 700,
      proto: "Nice FLO",
      hex: "5C3",
      bits: hexToBits("5C3", 12)
    }
  ];

  function hexToBits(hex, n) {
    var v = parseInt(hex, 16);
    var out = [];
    for (var i = n - 1; i >= 0; i--) out.push((v >> i) & 1);
    return out;
  }
  function bitsValue(arr) {
    var v = 0;
    for (var i = 0; i < arr.length; i++) v = v * 2 + arr[i];
    return v;
  }
  function bitsHex(arr) {
    if (!arr.length) return "";
    var v = bitsValue(arr);
    var w = Math.ceil(arr.length / 4);
    var s = v.toString(16).toUpperCase();
    while (s.length < w) s = "0" + s;
    return s;
  }
  function groupBits(arr) {
    var s = "";
    for (var i = 0; i < arr.length; i++) {
      if (i && i % 4 === 0) s += " ";
      s += arr[i];
    }
    return s;
  }

  SP.registerWidget("pulse-decoder", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    var ui = SP.widgetShell(host, "Pulse decoder", "How a pulse train becomes bits");
    var body = ui.body;

    var sample = SAMPLES[0];
    var i = 0;                 // index of the next bit to decode (0..bits.length)
    var timer = null;
    var playing = false;

    /* ---- sample picker (segmented) ---- */
    var controls = SP.el("div", { class: "widget-controls" });
    var seg = SP.el("div", { class: "seg", role: "group", "aria-label": "Sample capture" });
    var segBtns = [];
    SAMPLES.forEach(function (s, idx) {
      var b = SP.el("button", { type: "button", text: s.label, "aria-pressed": idx === 0 ? "true" : "false" });
      b.addEventListener("click", function () { pickSample(idx); });
      segBtns.push(b);
      seg.appendChild(b);
    });
    controls.appendChild(SP.el("label", {}, [SP.el("span", { text: "Capture" }), seg]));
    body.appendChild(controls);

    /* ---- canvas scope ---- */
    var canvas = SP.el("canvas", { class: "scope", style: "height:" + (compact ? "150px" : "190px"), role: "img", "aria-label": "OOK pulse train being decoded" });
    body.appendChild(canvas);
    var fit = SP.fitCanvas(canvas, draw);

    /* ---- buttons ---- */
    var row = SP.el("div", { class: "btn-row", style: "margin-top:12px" });
    var stepBtn = SP.el("button", { class: "btn primary small", type: "button", text: "Step ▸" });
    var autoBtn = SP.el("button", { class: "btn small", type: "button", text: "Auto play", "aria-pressed": "false" });
    var resetBtn = SP.el("button", { class: "btn ghost small", type: "button", text: "Reset" });
    stepBtn.addEventListener("click", function () { stopAuto(); step(); });
    resetBtn.addEventListener("click", function () { stopAuto(); i = 0; render(); });
    if (SP.reducedMotion) {
      autoBtn.setAttribute("disabled", "");
      autoBtn.setAttribute("title", "Auto play is off while your system requests reduced motion — use Step.");
    } else {
      autoBtn.addEventListener("click", toggleAuto);
    }
    row.appendChild(stepBtn); row.appendChild(autoBtn); row.appendChild(resetBtn);
    body.appendChild(row);

    /* ---- LCD readout ---- */
    var lcd = SP.el("div", { class: "lcd", style: "margin-top:12px", role: "status", "aria-live": "polite" });
    body.appendChild(lcd);

    /* ---- key/value facts ---- */
    var kv = SP.el("dl", { class: "kv", style: "margin-top:14px;margin-bottom:0" });
    var kvTE = SP.el("dd", {}), kvBits = SP.el("dd", {}), kvBin = SP.el("dd", {}), kvHex = SP.el("dd", {});
    kv.appendChild(SP.el("dt", { text: "TE" })); kv.appendChild(kvTE);
    kv.appendChild(SP.el("dt", { text: "Bits" })); kv.appendChild(kvBits);
    kv.appendChild(SP.el("dt", { text: "Binary" })); kv.appendChild(kvBin);
    kv.appendChild(SP.el("dt", { text: "Hex" })); kv.appendChild(kvHex);
    body.appendChild(kv);

    /* ---- legend ---- */
    if (!compact) {
      body.appendChild(SP.el("div", { class: "callout note", style: "margin-top:14px;margin-bottom:0" }, [
        SP.el("span", { class: "ic", text: "?" }),
        SP.el("div", {}, [
          SP.el("span", { class: "callout-title", text: "The rule (OOK, TE-based)" }),
          SP.el("div", {
            html: "The radio is only ever <b>on</b> or <b>off</b> (on-off keying). One <b>TE</b> (timing element) is the base tick. " +
              "A <b>bit 0</b> is a short pulse then a long gap (1×TE high, 3×TE low). A <b>bit 1</b> is a long pulse then a short gap (3×TE high, 1×TE low). " +
              "Read the widths, not the voltage — that is all a decoder does."
          })
        ])
      ]));
    }

    ui.foot("Highlighted pulse = the bit being read. Bits accumulate MSB-first into the key.");

    document.addEventListener("sp:theme", function () { fit.redraw(); });

    pickSample(0);

    /* ---------- behaviour ---------- */
    function pickSample(idx) {
      stopAuto();
      sample = SAMPLES[idx];
      i = 0;
      segBtns.forEach(function (b, k) { b.setAttribute("aria-pressed", k === idx ? "true" : "false"); });
      render();
    }

    function step() {
      if (i < sample.bits.length) { i++; render(); }
      if (i >= sample.bits.length) stopAuto();
    }

    function toggleAuto() {
      if (playing) { stopAuto(); return; }
      if (i >= sample.bits.length) i = 0;
      playing = true;
      autoBtn.setAttribute("aria-pressed", "true");
      autoBtn.textContent = "Pause";
      timer = setInterval(function () {
        if (i >= sample.bits.length) { stopAuto(); return; }
        step();
      }, 650);
    }
    function stopAuto() {
      playing = false;
      if (timer) { clearInterval(timer); timer = null; }
      autoBtn.setAttribute("aria-pressed", "false");
      autoBtn.textContent = "Auto play";
    }

    function render() {
      var decoded = sample.bits.slice(0, i);
      var done = i >= sample.bits.length;
      stepBtn.textContent = done ? "Done" : "Step ▸";
      stepBtn.disabled = done;

      var lines = [];
      lines.push(sample.proto + "  TE " + sample.te + "us");
      lines.push("Bit " + i + "/" + sample.bits.length + (done ? "  DECODED" : "  reading..."));
      lines.push("BIN " + (groupBits(decoded) || "-"));
      lines.push("HEX " + (bitsHex(decoded) || "-"));
      lcd.textContent = lines.join("\n");
      lcd.style.whiteSpace = "pre";

      kvTE.innerHTML = "<b>" + sample.te + " µs</b> per timing element";
      kvBits.innerHTML = "<b>" + i + "</b> of " + sample.bits.length + " read";
      kvBin.innerHTML = decoded.length ? ("<span class='mono'>" + groupBits(decoded) + "</span>") : "<span class='faint'>nothing yet</span>";
      kvHex.innerHTML = decoded.length ? ("<span class='mono'><b>0x" + bitsHex(decoded) + "</b></span>" + (done ? " — full key" : "")) : "<span class='faint'>—</span>";

      fit.redraw();
    }

    /* ---------- drawing ---------- */
    function draw(ctx, w, h) {
      var bg = SP.cssVar("--scope-bg") || "#0B1220";
      var grid = SP.cssVar("--scope-grid") || "#1B2A44";
      var trace = SP.cssVar("--scope-trace") || "#3FD8D2";
      var peak = SP.cssVar("--scope-peak") || "#FF8A34";
      var txt = SP.cssVar("--scope-text") || "#9BB3D1";

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      var padL = 8, padR = 8, padTop = 16, padBottom = 22;
      var yHigh = padTop, yLow = h - padBottom;
      var bits = sample.bits;
      var totalTE = bits.length * 4;
      var unit = (w - padL - padR) / totalTE;
      var quad = unit * 4;
      var labels = quad >= 16;

      /* baseline grid */
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, yLow + 0.5); ctx.lineTo(w - padR, yLow + 0.5);
      ctx.moveTo(padL, yHigh + 0.5); ctx.lineTo(w - padR, yHigh + 0.5);
      ctx.stroke();

      /* highlight the current bit's window */
      if (i < bits.length) {
        var hx = padL + i * quad;
        ctx.fillStyle = SP.cssVar("--scope-peak") ? hexA(peak, 0.16) : "rgba(255,138,52,0.16)";
        ctx.fillRect(hx, yHigh - 4, quad, (yLow - yHigh) + 8);
      }

      /* draw each bit's segment, coloured by state */
      var x = padL;
      for (var k = 0; k < bits.length; k++) {
        var b = bits[k];
        var hi = b ? 3 : 1, lo = b ? 1 : 3;
        var state = k < i ? "done" : (k === i ? "cur" : "next");
        ctx.strokeStyle = state === "done" ? trace : (state === "cur" ? peak : grid);
        ctx.lineWidth = state === "cur" ? 2.5 : 2;
        ctx.beginPath();
        ctx.moveTo(x, yLow);
        ctx.lineTo(x, yHigh);          // rise
        x += hi * unit;
        ctx.lineTo(x, yHigh);          // high plateau
        ctx.lineTo(x, yLow);           // fall
        x += lo * unit;
        ctx.lineTo(x, yLow);           // low plateau
        ctx.stroke();

        if (labels && k <= i && k < bits.length) {
          ctx.fillStyle = k === i ? peak : txt;
          ctx.font = "11px " + (SP.cssVar("--font-mono") || "monospace");
          ctx.textAlign = "center";
          ctx.fillText(String(b), padL + k * quad + quad / 2, yLow + 15);
        }
      }

      /* on/off labels */
      ctx.fillStyle = txt;
      ctx.font = "10px " + (SP.cssVar("--font-mono") || "monospace");
      ctx.textAlign = "left";
      ctx.fillText("on", 2, yHigh - 5);
      ctx.fillText("off", 2, yLow - 5);
    }

    /* turn a hex/rgb colour into an rgba() with alpha; falls back safely */
    function hexA(c, a) {
      c = (c || "").trim();
      if (c.charAt(0) === "#") {
        var s = c.slice(1);
        if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
        var n = parseInt(s, 16);
        return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
      }
      return c || ("rgba(255,138,52," + a + ")");
    }
  });
})();
