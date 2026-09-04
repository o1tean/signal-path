/* ============================================================
   Signal Path — widget: rolling-sim
   A rolling-code remote + receiver, so you can see with your own
   hands why a captured signal opens the gate once and then dies.

   Model (deliberately simplified, but honest):
     - The remote keeps a counter Cnt that ticks up on every press.
     - Each press sends {serial, Cnt, blob}. The blob is a stand-in
       for the encrypted rolling part — we just show fake hex.
     - The receiver remembers the last Cnt it accepted and a forward
       "window". It accepts a code only if  last < Cnt <= last+window,
       then advances last to that Cnt and opens the gate.
       Cnt <= last  -> already used (a replay) -> reject.
       Cnt >  last+window -> too far ahead / out of sync -> reject.
     - The Flipper can record a press made away from the gate, then
       replay that exact packet later.

   This is the *why rolling codes exist* concept, not an attack recipe.
   ============================================================ */
(function () {
  "use strict";
  if (!window.SP || !SP.registerWidget) return;

  var SERIAL = "1A2B3C4D";
  var START = 5;

  function blobFor(cnt) {
    var s = 0, str = SERIAL + ":" + cnt;
    for (var i = 0; i < str.length; i++) s = (s * 131 + str.charCodeAt(i)) >>> 0;
    var out = [];
    for (var b = 0; b < 4; b++) out.push(("0" + (((s >>> (b * 8)) & 0xff).toString(16))).slice(-2).toUpperCase());
    return out.join(" ");
  }

  SP.registerWidget("rolling-sim", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    var ui = SP.widgetShell(host, "Rolling-code sim", "Why a replay works once, then never again");
    var body = ui.body;

    /* ---- state ---- */
    var remoteCnt = START;
    var recvLast = START;
    var win = 16;
    var captured = null;       // {cnt, blob}
    var captureArmed = false;
    var gateOpen = false;
    var running = false;       // a scripted preset is playing
    var sawReplayFail = false;

    /* ---- intro ---- */
    if (!compact) {
      body.appendChild(SP.el("div", { class: "callout note", style: "margin-top:0" }, [
        SP.el("span", { class: "ic", text: "i" }),
        SP.el("div", {}, [
          SP.el("span", { class: "callout-title", text: "You own this gate and this remote" }),
          SP.el("div", { html: "Press the remote, record a press with the Flipper, then try to replay it. The counter is doing all the work — watch it." })
        ])
      ]));
    }

    /* ---- three panels ---- */
    var panels = SP.el("div", { class: "grid3", style: "margin-bottom:14px" });

    // Remote panel
    var remoteCntEl = SP.el("b", { text: String(remoteCnt) });
    var remoteBlobEl = SP.el("span", { class: "mono", text: blobFor(remoteCnt) });
    panels.appendChild(panel("Remote", "◉", [
      row2("Serial", SP.el("span", { class: "mono", text: SERIAL })),
      row2("Cnt", remoteCntEl),
      row2("Last blob", remoteBlobEl)
    ]));

    // Flipper panel
    var flipCntEl = SP.el("span", { class: "faint", text: "empty" });
    var flipBlobEl = SP.el("span", { class: "faint", text: "—" });
    var flipStateEl = SP.el("span", { class: "pill grey", text: "idle" });
    panels.appendChild(panel("Flipper", "▸", [
      row2("Status", flipStateEl),
      row2("Captured Cnt", flipCntEl),
      row2("Blob", flipBlobEl)
    ]));

    // Receiver panel
    var recvLastEl = SP.el("b", { text: String(recvLast) });
    var recvWinEl = SP.el("b", { text: String(win) });
    var gatePill = SP.el("span", { class: "pill red", text: "GATE CLOSED" });
    var gateArt = SP.el("div", { class: "rc-gate", "aria-hidden": "true", style: gateStyle(false) });
    var recvPanel = panel("Receiver", "⛨", [
      row2("Last accepted", recvLastEl),
      row2("Window", recvWinEl),
      row2("Gate", gatePill)
    ]);
    recvPanel.appendChild(gateArt);
    panels.appendChild(recvPanel);
    body.appendChild(panels);

    /* ---- window slider ---- */
    var controls = SP.el("div", { class: "widget-controls" });
    var slider = SP.el("input", { type: "range", min: "1", max: "256", value: String(win), "aria-label": "Receiver acceptance window" });
    var sliderVal = SP.el("span", { class: "readout", html: "window <b>" + win + "</b>" });
    slider.addEventListener("input", function () {
      win = parseInt(slider.value, 10) || 1;
      sliderVal.innerHTML = "window <b>" + win + "</b>";
      recvWinEl.textContent = String(win);
    });
    controls.appendChild(SP.el("label", {}, [SP.el("span", { text: "Accept window" }), slider, sliderVal]));
    body.appendChild(controls);

    /* ---- action buttons ---- */
    var row = SP.el("div", { class: "btn-row" });
    var pressBtn = SP.el("button", { class: "btn primary small", type: "button", text: "Press real remote" });
    var captureBtn = SP.el("button", { class: "btn small", type: "button", text: "Capture next press" });
    var replayBtn = SP.el("button", { class: "btn small", type: "button", text: "Replay capture" });
    var presetBtn = SP.el("button", { class: "btn small", type: "button", text: "Reproduce the gate mystery" });
    var resetBtn = SP.el("button", { class: "btn ghost small", type: "button", text: "Reset" });
    // Manual controls are ignored while a scripted preset is playing, so a
    // stray click can't corrupt the demo. Reset is always allowed (escape hatch),
    // and the preset button drives the reduced-motion step-through itself.
    pressBtn.addEventListener("click", function () { if (!running) pressRemote(); });
    captureBtn.addEventListener("click", function () { if (!running) armCapture(); });
    replayBtn.addEventListener("click", function () { if (!running) replay(); });
    presetBtn.addEventListener("click", function () { runPreset(); });
    resetBtn.addEventListener("click", function () { reset(); });
    row.appendChild(pressBtn); row.appendChild(captureBtn); row.appendChild(replayBtn);
    row.appendChild(presetBtn); row.appendChild(resetBtn);
    body.appendChild(row);

    /* ---- decision + log ---- */
    var reason = SP.el("div", { class: "callout", style: "margin-top:14px", role: "status", "aria-live": "polite" }, [
      SP.el("span", { class: "ic", text: "»" }),
      SP.el("div", {}, [
        SP.el("span", { class: "callout-title", text: "Waiting" }),
        SP.el("div", { class: "rc-reason", text: "Press the remote to open the gate, or record a press to try a replay." })
      ])
    ]);
    body.appendChild(reason);
    var reasonTitle = reason.querySelector(".callout-title");
    var reasonBody = reason.querySelector(".rc-reason");

    var log = SP.el("div", { class: "lcd", style: "margin-top:12px;white-space:pre;max-height:" + (compact ? "84px" : "132px") + ";overflow:auto" });
    body.appendChild(log);
    var logLines = [];

    ui.foot("Cnt = the remote's counter. The receiver only ever moves forward, which is what makes an old capture worthless.");

    render();
    logMsg("Ready. Remote Cnt " + remoteCnt + ", receiver last accepted " + recvLast + ".");

    /* ---------- helpers ---------- */
    function panel(title, ic, rows) {
      var card = SP.el("div", { class: "card tight" });
      card.appendChild(SP.el("div", { class: "widget-title", style: "margin-bottom:8px;font-family:var(--font-display);font-weight:700", html: "<span aria-hidden='true' style='color:var(--cyan);margin-right:6px'>" + ic + "</span>" + title }));
      var dl = SP.el("dl", { class: "kv", style: "margin:0;grid-template-columns:max-content minmax(0,1fr);font-size:13px" });
      rows.forEach(function (r) { dl.appendChild(r[0]); dl.appendChild(r[1]); });
      card.appendChild(dl);
      return card;
    }
    function row2(k, valNode) {
      var dt = SP.el("dt", { text: k });
      var dd = SP.el("dd", {});
      dd.appendChild(valNode);
      return [dt, dd];
    }
    function gateStyle(open) {
      return "margin-top:10px;height:8px;border-radius:999px;background:" +
        (open ? "var(--green)" : "var(--red)") + ";opacity:" + (open ? "1" : "0.55") + ";";
    }
    function logMsg(m) {
      logLines.push(m);
      if (logLines.length > 40) logLines.shift();
      log.textContent = logLines.join("\n");
      log.scrollTop = log.scrollHeight;
    }
    function setReason(kind, title, msg) {
      reason.className = "callout " + kind;
      reason.querySelector(".ic").textContent = kind === "tip" ? "✓" : (kind === "legal" ? "✕" : (kind === "warn" ? "!" : "»"));
      reasonTitle.textContent = title;
      reasonBody.textContent = msg;
    }

    function render() {
      remoteCntEl.textContent = String(remoteCnt);
      remoteBlobEl.textContent = blobFor(remoteCnt);
      recvLastEl.textContent = String(recvLast);
      recvWinEl.textContent = String(win);
      if (captured) {
        flipCntEl.textContent = String(captured.cnt);
        flipCntEl.className = "mono";
        flipBlobEl.textContent = captured.blob;
        flipBlobEl.className = "mono";
        flipStateEl.textContent = "holds Cnt " + captured.cnt;
        flipStateEl.className = "pill purple";
        replayBtn.disabled = running; // stays locked while a preset plays
      } else {
        flipCntEl.textContent = captureArmed ? "listening…" : "empty";
        flipCntEl.className = "faint";
        flipBlobEl.textContent = "—";
        flipBlobEl.className = "faint";
        flipStateEl.textContent = captureArmed ? "armed" : "idle";
        flipStateEl.className = "pill " + (captureArmed ? "yellow" : "grey");
        replayBtn.disabled = true;
      }
      gatePill.textContent = gateOpen ? "GATE OPEN" : "GATE CLOSED";
      gatePill.className = "pill " + (gateOpen ? "green" : "red");
      gateArt.setAttribute("style", gateStyle(gateOpen));
      captureBtn.setAttribute("aria-pressed", captureArmed ? "true" : "false");
    }

    /* evaluate a received packet against the receiver; returns "accept"|"replay"|"ahead" */
    function evaluate(cnt) {
      if (cnt <= recvLast) {
        gateOpen = false;
        return "replay";
      }
      if (cnt > recvLast + win) {
        gateOpen = false;
        return "ahead";
      }
      recvLast = cnt;
      gateOpen = true;
      return "accept";
    }

    /* ---------- actions ---------- */
    function pressRemote() {
      remoteCnt++;
      var blob = blobFor(remoteCnt);
      if (captureArmed) {
        // Modelled as: you pressed it away from the gate. Flipper records it;
        // the gate never hears this one, so its counter does not move.
        captured = { cnt: remoteCnt, blob: blob };
        captureArmed = false;
        setReason("note", "Recorded, out of range",
          "You pressed the remote away from the gate. The Flipper stored Cnt " + remoteCnt +
          ". The gate heard nothing, so its last-accepted is still " + recvLast + ".");
        logMsg("Press #" + remoteCnt + " recorded by Flipper (gate out of range).");
        render();
        return;
      }
      var prev = recvLast;
      var r = evaluate(remoteCnt);
      if (r === "accept") {
        setReason("tip", "Gate opens",
          "Cnt " + remoteCnt + " is ahead of the last accepted " + prev + " and inside the window of " + win +
          ". Accepted — the receiver now expects a Cnt above " + remoteCnt + ".");
        logMsg("Press #" + remoteCnt + " -> ACCEPT. Gate opens. Receiver last = " + recvLast + ".");
      } else if (r === "ahead") {
        setReason("warn", "Too far ahead",
          "Cnt " + remoteCnt + " is more than " + win + " past the receiver's " + prev +
          ". The receiver thinks the remote drifted out of sync and refuses it (it needs a resync).");
        logMsg("Press #" + remoteCnt + " -> REJECT (out of sync, > window).");
      } else {
        setReason("legal", "Already used",
          "Cnt " + remoteCnt + " is not ahead of " + prev + ". Nothing happens.");
        logMsg("Press #" + remoteCnt + " -> REJECT (not ahead).");
      }
      render();
    }

    function armCapture() {
      if (captured) {
        setReason("note", "Flipper already holds a capture", "Replay it or Reset before recording another press.");
        return;
      }
      captureArmed = !captureArmed;
      setReason("note", captureArmed ? "Flipper armed" : "Capture cancelled",
        captureArmed
          ? "The next remote press will be recorded (picture pressing it in the driveway, out of the gate's range)."
          : "The Flipper is idle again.");
      logMsg(captureArmed ? "Flipper armed to capture the next press." : "Capture disarmed.");
      render();
    }

    function replay() {
      if (!captured) return;
      var prev = recvLast;
      var r = evaluate(captured.cnt);
      if (r === "accept") {
        setReason("tip", "Replay worked — this time",
          "The stored Cnt " + captured.cnt + " was still ahead of the receiver's " + prev + ", so the gate opened. " +
          "That capture is now spent: the receiver advanced to " + recvLast + ".");
        logMsg("Replay Cnt " + captured.cnt + " -> ACCEPT. Gate opens. Receiver last = " + recvLast + ".");
      } else if (r === "ahead") {
        setReason("warn", "Replay refused — too far ahead",
          "Stored Cnt " + captured.cnt + " is more than " + win + " past the receiver's " + recvLast + ". Out of sync, rejected.");
        logMsg("Replay Cnt " + captured.cnt + " -> REJECT (out of sync).");
        firstFail();
      } else {
        setReason("legal", "Replay is dead",
          "Stored Cnt " + captured.cnt + " is not ahead of the receiver's " + recvLast +
          " any more — the real remote moved the counter on. The receiver treats it as an old, already-used code and ignores it. This is why rolling codes beat a plain replay.");
        logMsg("Replay Cnt " + captured.cnt + " -> REJECT (already used).");
        firstFail();
      }
      render();
    }

    function firstFail() {
      if (!sawReplayFail) {
        sawReplayFail = true;
        SP.award("out-of-sync");
      }
    }

    function reset() {
      stopPreset();
      remoteCnt = START; recvLast = START; win = 16; captured = null;
      captureArmed = false; gateOpen = false;
      slider.value = "16"; sliderVal.innerHTML = "window <b>16</b>";
      logLines = [];
      setReason("note", "Reset", "Remote and receiver both back to Cnt " + START + ".");
      logMsg("Reset. Remote Cnt " + remoteCnt + ", receiver last " + recvLast + ".");
      render();
    }

    /* ---------- scripted demo ---------- */
    var presetTimer = null;
    var stepIdx = 0;          // reduced-motion stepper position
    var awaitingFinish = false;
    var STEPS = [
      function () { armCapture(); },
      function () { pressRemote(); },                                          // captured (#6), gate not evaluated
      function () { logMsg("— now you drive to the gate —"); replay(); },      // works: 6 > 5
      function () { pressRemote(); },                                          // real press #7 at gate
      function () { pressRemote(); },                                          // real press #8 at gate
      function () { logMsg("— you try the old capture again —"); replay(); }   // fails: 6 <= 8
    ];
    function stopPreset() {
      running = false;
      awaitingFinish = false;
      stepIdx = 0;
      if (presetTimer) { clearTimeout(presetTimer); presetTimer = null; }
      presetBtn.textContent = "Reproduce the gate mystery";
      setButtons(true);
    }
    function setButtons(on) {
      [pressBtn, captureBtn, replayBtn].forEach(function (b) { b.disabled = !on; });
      slider.disabled = !on;
      if (on) render(); // restores replayBtn disabled state based on capture
    }
    function finishSummary() {
      setReason("legal", "That is the whole mystery",
        "The capture opened the gate once, then two honest presses moved the counter past it. Replaying the old code now does nothing — exactly what people report as a gate that 'stopped working after I copied the remote.'");
      logMsg("Done. The one-time capture is now worthless.");
    }
    function runPreset() {
      if (SP.reducedMotion) { stepPreset(); return; }
      if (running) return;                 // already animating — ignore repeat clicks
      reset();
      running = true;
      setButtons(false);
      var k = 0;
      function tick() {
        if (k >= STEPS.length) { finishSummary(); stopPreset(); return; }
        STEPS[k++]();
        presetTimer = setTimeout(tick, 900);
      }
      presetTimer = setTimeout(tick, 300);
    }
    /* reduced motion: advance one step per click so the accept→reject
       progression is still visible instead of jumping to the end. */
    function stepPreset() {
      if (awaitingFinish) { finishSummary(); stopPreset(); return; }
      if (!running) {
        reset();
        running = true;
        setButtons(false);
        stepIdx = 0;
      }
      STEPS[stepIdx++]();
      if (stepIdx >= STEPS.length) {
        awaitingFinish = true;
        presetBtn.disabled = false;
        presetBtn.textContent = "See the summary ▸";
      } else {
        presetBtn.disabled = false;
        presetBtn.textContent = "Next step (" + stepIdx + " / " + STEPS.length + ") ▸";
      }
    }
  });
})();
