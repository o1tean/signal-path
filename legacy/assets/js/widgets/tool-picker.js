/* ============================================================
   Signal Path — widget: tool-picker
   A scenario quiz for the one decision beginners get wrong:
   which Sub-GHz tool to reach for. The four choices stay the
   same every round so the decision framework sticks:
     0 Frequency Analyzer  — find an unknown frequency
     1 Read                — decode a known protocol + key/counter
     2 Read RAW            — record & replay something Read can't ID
     3 Stop                — rolling code, replay won't help
   Everything here is a device you own.
   ============================================================ */
(function () {
  "use strict";
  if (!window.SP || !SP.registerWidget) return;

  var TOOLS = [
    "Frequency Analyzer",
    "Read",
    "Read RAW",
    "Stop — likely rolling code, don't bother replaying"
  ];

  var SCENARIOS = [
    {
      q: "You own a little remote but have no idea what frequency it transmits on. What do you reach for first?",
      a: 0,
      why: "Frequency Analyzer listens across the CC1101's bands and reports the strongest signal while you hold the button — it is how you discover an unknown frequency before anything else."
    },
    {
      q: "Your garage remote's frequency is known. You want the Flipper to name the protocol and show the decoded key.",
      a: 1,
      why: "Read demodulates and decodes: it tells you the protocol (e.g. Princeton), bit length and key. That is exactly what Read is for on a signal it recognises."
    },
    {
      q: "A quirky sensor you own transmits, but Read shows nothing it recognises. You just want to record it and replay it to your own receiver.",
      a: 2,
      why: "Read RAW captures the raw timing (the microsecond durations) without needing to understand the protocol, so you can replay an unknown but fixed signal."
    },
    {
      q: "You want to clone your car key fob so the Flipper can unlock your car.",
      a: 3,
      why: "Car fobs are rolling code — a capture will not replay, and cloning is not how you add a remote. Add a key through the car's own pairing procedure or the dealer instead."
    },
    {
      q: "You press Read on your gate remote. It shows 'Nice FloR-S' and a Cnt that changes on every press. You hoped to save it and replay later.",
      a: 3,
      why: "A Cnt that ticks every press means rolling code. A saved capture replays at most once and usually just fails, so this is a stop-and-rethink, not a replay job."
    },
    {
      q: "Before doing anything else, you only want to know whether your remote lives near 315 MHz or up around 433 MHz.",
      a: 0,
      why: "That is a pure frequency question, so Frequency Analyzer is the tool: hold the button near the Flipper and read the number it locks onto."
    },
    {
      q: "A cheap wireless doorbell you own triggers a chime. Read can't identify the protocol, but you want the Flipper to set the chime off.",
      a: 2,
      why: "When Read can't decode it but the code is fixed, Read RAW records the raw pulse timing so you can replay it and trigger your own doorbell."
    },
    {
      q: "Your own garage remote reads cleanly as 'Princeton, 24-bit' with a fixed Key. You want to save it and open the garage from the Flipper.",
      a: 1,
      why: "A fixed Princeton code is decodable and repeatable, so Read captures the protocol and key, and the saved .sub replays reliably to your own garage."
    }
  ];

  SP.registerWidget("tool-picker", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    var ui = SP.widgetShell(host, "Which tool?", "Pick the right Sub-GHz move");
    var body = ui.body;

    var order = SCENARIOS.map(function (_, i) { return i; });
    var pos = 0;
    var score = 0;
    var answered = false;

    if (!compact) {
      body.appendChild(SP.el("div", { class: "callout note", style: "margin-top:0" }, [
        SP.el("span", { class: "ic", text: "i" }),
        SP.el("div", { html: "Every scenario is a device <b>you own</b>. Same four tools each time — learn when each one is the right call." })
      ]));
    }

    var progress = SP.el("div", { class: "readout", style: "margin-bottom:8px" });
    body.appendChild(progress);

    var qBox = SP.el("div", { class: "q", style: "margin-bottom:12px" });
    var qText = SP.el("div", { class: "q-text" });
    var optsBox = SP.el("div", { class: "opts", role: "group", "aria-label": "Tool choices" });
    var explain = SP.el("div", { class: "explain", role: "status", "aria-live": "polite", style: "display:none" });
    qBox.appendChild(qText); qBox.appendChild(optsBox); qBox.appendChild(explain);
    body.appendChild(qBox);

    var nav = SP.el("div", { class: "btn-row" });
    var nextBtn = SP.el("button", { class: "btn primary small", type: "button", text: "Next ▸" });
    var restartBtn = SP.el("button", { class: "btn ghost small", type: "button", text: "Start over" });
    nextBtn.disabled = true;
    nextBtn.addEventListener("click", function () { pos++; if (pos >= order.length) finish(); else showQuestion(); });
    restartBtn.addEventListener("click", function () { restart(); });
    nav.appendChild(nextBtn); nav.appendChild(restartBtn);
    body.appendChild(nav);

    ui.foot("Tip: unknown frequency → Analyzer · known protocol → Read · unknown but fixed → Read RAW · counter that changes → stop.");

    showQuestion();

    function showQuestion() {
      answered = false;
      nextBtn.disabled = true;
      var sc = SCENARIOS[order[pos]];
      progress.innerHTML = "Scenario <b>" + (pos + 1) + "</b> / " + order.length + " &nbsp; · &nbsp; Score <b>" + score + "</b>";
      qText.textContent = sc.q;
      explain.style.display = "none";
      explain.className = "explain";
      optsBox.innerHTML = "";
      TOOLS.forEach(function (label, j) {
        var b = SP.el("button", { class: "opt", type: "button" }, [
          SP.el("span", { class: "letter", text: String.fromCharCode(65 + j) }),
          SP.el("span", { text: label })
        ]);
        b.addEventListener("click", function () { answer(j, sc, b); });
        optsBox.appendChild(b);
      });
    }

    function answer(j, sc, btn) {
      if (answered) return;
      answered = true;
      var buttons = optsBox.querySelectorAll(".opt");
      Array.prototype.forEach.call(buttons, function (x) { x.disabled = true; });
      var ok = j === sc.a;
      btn.classList.add(ok ? "correct" : "wrong");
      if (!ok) buttons[sc.a].classList.add("correct");
      if (ok) score++;
      explain.textContent = (ok ? "Right. " : "Not quite — the move is " + TOOLS[sc.a].split(" —")[0] + ". ") + sc.why;
      explain.className = "explain " + (ok ? "ok" : "bad");
      explain.style.display = "";
      progress.innerHTML = "Scenario <b>" + (pos + 1) + "</b> / " + order.length + " &nbsp; · &nbsp; Score <b>" + score + "</b>";
      nextBtn.disabled = false;
      nextBtn.textContent = (pos + 1 >= order.length) ? "See score ▸" : "Next ▸";
    }

    function finish() {
      qText.textContent = "Done.";
      optsBox.innerHTML = "";
      explain.style.display = "";
      explain.className = "explain " + (score === order.length ? "ok" : "");
      var msg = score + " / " + order.length + ". ";
      if (score === order.length) msg += "Perfect — you know exactly which tool each job wants.";
      else if (score >= order.length - 2) msg += "Solid. The rolling-code stops are the ones worth re-reading.";
      else msg += "Run it again — the pattern is: find, decode, record, or stop.";
      explain.textContent = msg;
      progress.innerHTML = "Final score <b>" + score + "</b> / " + order.length;
      nextBtn.disabled = true;
      nextBtn.textContent = "Next ▸";
      SP.toast("Tool picker: " + score + " / " + order.length);
    }

    function restart() {
      pos = 0; score = 0;
      nextBtn.textContent = "Next ▸";
      showQuestion();
    }
  });
})();
