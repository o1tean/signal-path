/* ============================================================
   Signal Path — widget: tune-in
   A guessing game built on the scope: a hidden device transmits a
   peak at a common frequency; read it and pick the right one.
   Five in a row earns the "tuned-in" badge.
   Registers as: tune-in
   ============================================================ */
(function () {
  "use strict";
  var SP = window.SP;
  if (!SP || !SP.registerWidget) return;

  var FREQS = [315, 390, 433.92, 868, 915]; // common Sub-GHz remote frequencies
  var AXIS_LO = 300, AXIS_HI = 928, AXIS_SPAN = AXIS_HI - AXIS_LO;

  function fmt(f) { return f === Math.round(f) ? String(f) : f.toFixed(2); }

  SP.registerWidget("tune-in", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    var ui = SP.widgetShell(host, "Tune In", "read the peak, name the frequency");
    var body = ui.body;

    SP.state.tuneIn = SP.state.tuneIn || { best: 0 };

    var correctCount = 0, attempts = 0, streak = 0, answered = false, lastSecret = null;
    var cur = null; // { secret, opts:[..] }

    /* ---- stats bar ---- */
    var stats = SP.el("div", { class: "widget-controls", style: "gap:8px 20px" });
    var sScore = SP.el("span", { class: "readout" });
    var sStreak = SP.el("span", { class: "readout" });
    var sBest = SP.el("span", { class: "readout" });
    stats.appendChild(sScore); stats.appendChild(sStreak); stats.appendChild(sBest);
    body.appendChild(stats);

    /* ---- canvas ---- */
    var canvas = SP.el("canvas", {
      class: "scope",
      style: "height:" + (compact ? 150 : 200) + "px",
      role: "img",
      "aria-label": "Spectrum reading with one peak to identify"
    });
    body.appendChild(canvas);

    /* ---- question ---- */
    var question = SP.el("div", { class: "readout", style: "margin:12px 0 8px; font-size:14px" },
      ["What frequency is this device transmitting on?"]);
    body.appendChild(question);

    var optWrap = SP.el("div", {
      class: "btn-row", role: "group", "aria-label": "Frequency choices"
    });
    body.appendChild(optWrap);

    var feedback = SP.el("div", { class: "callout note", "aria-live": "polite", style: "margin-top:12px" }, [
      SP.el("span", { class: "ic", text: "?" }),
      SP.el("div", { class: "fb-text" }, ["Read the peak against the MHz scale, then choose."])
    ]);
    body.appendChild(feedback);

    var nextRow = SP.el("div", { class: "btn-row", style: "margin-top:12px" });
    var nextBtn = SP.el("button", { class: "btn primary", type: "button" }, ["Next round →"]);
    nextBtn.addEventListener("click", function () { newRound(); });
    nextRow.appendChild(nextBtn);
    body.appendChild(nextRow);

    ui.foot("Peaks sit at the transmitter's frequency. Real remotes cluster near <b>315</b>, <b>390</b>, <b>433.92</b>, <b>868</b> and <b>915 MHz</b>.");

    /* ---- render ---- */
    var ctx;
    function render() {
      if (!ctx || !cur) return;
      var w = canvas.clientWidth || 600;
      var h = canvas.clientHeight || (compact ? 150 : 200);

      var bg = SP.cssVar("--scope-bg") || "#0B1220";
      var grid = SP.cssVar("--scope-grid") || "#1B2A44";
      var trace = SP.cssVar("--scope-trace") || "#3FD8D2";
      var peakC = SP.cssVar("--scope-peak") || "#FF8A34";
      var txt = SP.cssVar("--scope-text") || "#9BB3D1";

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      var padL = 8, padR = 8, padT = 12, axisH = 22;
      var x0 = padL, x1 = w - padR, plotW = x1 - x0;
      var y0 = padT, y1 = h - axisH, plotH = y1 - y0;

      // grid
      ctx.strokeStyle = grid; ctx.lineWidth = 1;
      var gy;
      for (gy = 0; gy <= 4; gy++) {
        var yy = y0 + plotH * gy / 4;
        ctx.beginPath(); ctx.moveTo(x0, yy + 0.5); ctx.lineTo(x1, yy + 0.5); ctx.stroke();
      }
      ctx.font = "10px monospace"; ctx.textBaseline = "top";
      var ticks = 6, i;
      for (i = 0; i <= ticks; i++) {
        var xx = x0 + plotW * i / ticks;
        ctx.strokeStyle = grid;
        ctx.beginPath(); ctx.moveTo(xx + 0.5, y0); ctx.lineTo(xx + 0.5, y1); ctx.stroke();
        var fx = AXIS_LO + AXIS_SPAN * i / ticks;
        ctx.fillStyle = txt;
        ctx.textAlign = i === 0 ? "left" : (i === ticks ? "right" : "center");
        ctx.fillText(fx.toFixed(0), i === 0 ? x0 : (i === ticks ? x1 : xx), y1 + 5);
      }

      // noise floor (static, gentle)
      var baseY = y1 - plotH * 0.07;
      ctx.strokeStyle = trace; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.8;
      ctx.beginPath();
      var N = 160, k;
      for (k = 0; k < N; k++) {
        var nx = x0 + plotW * k / (N - 1);
        var ny = baseY - noiseAt(k) * plotH * 0.10;
        if (k === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // the secret peak
      var px = x0 + plotW * (cur.secret - AXIS_LO) / AXIS_SPAN;
      var top = y1 - plotH * 0.82;
      var sigma = Math.max(plotW * 0.011, 5);
      ctx.strokeStyle = peakC; ctx.lineWidth = 2;
      ctx.beginPath();
      var started = false, sx;
      for (sx = Math.max(x0, px - sigma * 4); sx <= Math.min(x1, px + sigma * 4); sx += 1) {
        var g = Math.exp(-((sx - px) * (sx - px)) / (2 * sigma * sigma));
        var yv = baseY - (baseY - top) * g;
        if (!started) { ctx.moveTo(sx, yv); started = true; } else ctx.lineTo(sx, yv);
      }
      ctx.stroke();

      // reveal the exact value only after answering
      if (answered) {
        ctx.fillStyle = peakC; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.font = "11px monospace";
        ctx.fillText(fmt(cur.secret) + " MHz", clamp(px, x0 + 30, x1 - 30), top - 4);
      }
    }

    // deterministic-ish noise so it doesn't flicker between redraws
    function noiseAt(k) {
      var v = Math.sin(k * 12.9898) * 43758.5453;
      v = v - Math.floor(v);
      return 0.25 + v * 0.6;
    }
    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    /* ---- rounds ---- */
    function shuffle(a) {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function newRound() {
      var secret = FREQS[Math.floor(Math.random() * FREQS.length)];
      if (secret === lastSecret) secret = FREQS[(FREQS.indexOf(secret) + 1) % FREQS.length];
      lastSecret = secret;

      var pool = FREQS.filter(function (f) { return f !== secret; });
      shuffle(pool);
      var options = shuffle([secret, pool[0], pool[1], pool[2]]);
      cur = { secret: secret, opts: options };
      answered = false;

      renderOptions();
      setFeedback("note", "?", "Read the peak against the MHz scale, then choose.");
      nextBtn.disabled = true;
      if (fit) fit.redraw(); else render();
    }

    function renderOptions() {
      optWrap.innerHTML = "";
      cur.opts.forEach(function (f, idx) {
        var b = SP.el("button", {
          class: "btn", type: "button",
          "aria-label": "Choice " + (idx + 1) + ": " + fmt(f) + " megahertz"
        }, [
          SP.el("span", { class: "readout", style: "opacity:.6", text: (idx + 1) + " " }),
          fmt(f) + " MHz"
        ]);
        b._freq = f;
        b.addEventListener("click", function () { answer(f, b); });
        optWrap.appendChild(b);
      });
    }

    function answer(f, btn) {
      if (answered) return;
      answered = true;
      attempts++;
      var ok = f === cur.secret;

      // lock + colorize buttons
      Array.prototype.forEach.call(optWrap.children, function (b) {
        b.disabled = true;
        if (b._freq === cur.secret) {
          b.style.background = SP.cssVar("--green-soft");
          b.style.borderColor = SP.cssVar("--green");
        }
      });
      if (!ok) {
        btn.style.background = SP.cssVar("--red-soft");
        btn.style.borderColor = SP.cssVar("--red");
      }

      if (ok) {
        correctCount++; streak++;
        if (streak > SP.state.tuneIn.best) { SP.state.tuneIn.best = streak; SP.save(); }
        setFeedback("tip", "✓", "Correct — that peak sits at " + fmt(cur.secret) + " MHz. Streak: " + streak + ".");
        if (streak === 5) SP.award("tuned-in"); // award() handles toast + confetti
        else SP.toast("Correct — " + fmt(cur.secret) + " MHz");
      } else {
        streak = 0;
        setFeedback("warn", "!", "Not quite — that peak was at " + fmt(cur.secret) + " MHz. Streak reset.");
        SP.toast("Missed it — it was " + fmt(cur.secret) + " MHz");
      }

      nextBtn.disabled = false;
      nextBtn.focus();
      updateStats();
      render();
    }

    function setFeedback(kind, ic, text) {
      feedback.className = "callout " + kind;
      var icEl = feedback.querySelector(".ic");
      var txtEl = feedback.querySelector(".fb-text");
      if (icEl) icEl.textContent = ic;
      if (txtEl) txtEl.textContent = text;
    }

    function updateStats() {
      sScore.innerHTML = "Correct: <b>" + correctCount + "</b> / " + attempts;
      sStreak.innerHTML = "Streak: <b>" + streak + "</b>";
      sBest.innerHTML = "Best streak: <b>" + SP.state.tuneIn.best + "</b>";
    }

    /* ---- keyboard: 1–4 select an option ---- */
    host.addEventListener("keydown", function (e) {
      if (answered) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4 && optWrap.children[n - 1]) {
        optWrap.children[n - 1].click();
        e.preventDefault();
      }
    });

    /* ---- boot ---- */
    var fit;
    updateStats();
    newRound();
    fit = SP.fitCanvas(canvas, function () { render(); });
    ctx = fit.ctx;
    render();
    document.addEventListener("sp:theme", function () { render(); });
  });
})();
