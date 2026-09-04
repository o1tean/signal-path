/* ============================================================
   Signal Path — widget: flipper-sim
   A simulated Flipper Zero screen + D-pad for learning the
   Sub-GHz menu tree. Teaching approximation, not a real device.
   Registers as "flipper-sim".
   ============================================================ */
(function () {
  "use strict";
  if (!window.SP || !SP.registerWidget) return;

  SP.registerWidget("flipper-sim", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    var ui = SP.widgetShell(host, "Flipper Sub-GHz sim", "walk the menu with the D-pad");
    var body = ui.body;

    /* ---- menu model (kept close to the documented menu) ---- */
    function menu(title, items) { return { type: "menu", title: title, items: items }; }
    function leaf(title, lines, note) { return { type: "leaf", title: title, lines: lines || [], note: note || "" }; }

    var DECODE_NOTE = "(on a real Flipper, a decoded signal — protocol, key, and a Save option — appears here)";

    var saved = menu("Saved", [
      { label: "Doorbell_front", node: leaf("Doorbell_front",
        ["Freq  433.92 MHz", "Preset  AM650", "Protocol Princeton", "Bit 24   TE 400"],
        "(a stored .sub key file; the real screen offers Emulate / Send / Rename / Delete)") },
      { label: "LED_strip", node: leaf("LED_strip",
        ["Freq  433.92 MHz", "Preset  AM650", "Protocol Princeton", "Bit 24"],
        "(your own saved capture — the course only ever stores devices you own)") }
    ]);

    var subghz = menu("Sub-GHz", [
      { label: "Read", node: leaf("Read",
        ["433.92   AM650", "", "Scanning . . .", "(quiet air)"], DECODE_NOTE) },
      { label: "Read RAW", node: leaf("Read RAW",
        ["433.92   AM650", "", "Records raw on/off", "timing to a .sub"],
        "(RAW capture stores microsecond timings, not a decoded protocol)") },
      { label: "Frequency Analyzer", node: leaf("Freq Analyzer",
        ["Hold a remote's", "button nearby...", "", "433.920 MHz", "-64 dBm"],
        "(finds the strongest signal across 300-928 MHz — handy for an unknown remote)") },
      { label: "Test", node: leaf("Test",
        ["433.92 MHz", "", "RSSI  -92 dBm", "level: quiet"],
        "(a live signal-strength meter on the current frequency)") },
      { label: "Add Manually", node: leaf("Add Manually",
        ["Pick a known", "protocol, then type", "its code by hand.", "", "e.g. Princeton,", "Nice FLO, CAME"],
        "(builds a .sub from a protocol template; the real list is long)") },
      { label: "Saved", node: saved }
    ]);

    function notCovered(name) {
      return leaf(name,
        ["This teaching sim", "only walks the", "Sub-GHz menu.", "", "Press Back and", "choose Sub-GHz."],
        "(a real Flipper opens the " + name + " app here)");
    }

    var root = menu("Flipper", [
      { label: "Sub-GHz", node: subghz },
      { label: "125 kHz RFID", node: notCovered("125 kHz RFID") },
      { label: "NFC", node: notCovered("NFC") },
      { label: "Infrared", node: notCovered("Infrared") },
      { label: "GPIO", node: notCovered("GPIO") },
      { label: "iButton", node: notCovered("iButton") },
      { label: "Settings", node: notCovered("Settings") }
    ]);

    /* start on the Sub-GHz app, already opened, so learners land in the topic */
    var stack = [{ node: root, sel: 0 }, { node: subghz, sel: 0 }];

    /* ---- screen ---- */
    if (!compact) {
      body.appendChild(SP.el("p", { class: "readout",
        html: "Move with the D-pad or arrow keys. <b>OK</b> opens an item, <b>Back</b> goes up a level." }));
    }

    var lcd = SP.el("div", { class: "lcd", tabindex: "0", role: "group",
      "aria-label": "Simulated Flipper screen. Arrow keys move the cursor, Enter selects, Backspace goes back." });
    lcd.style.maxWidth = compact ? "260px" : "320px";
    lcd.style.margin = "0 auto";
    lcd.style.fontSize = compact ? "13px" : "15px";
    lcd.style.minHeight = compact ? "148px" : "184px";
    lcd.style.userSelect = "none";

    var titleBar = SP.el("div");
    titleBar.style.cssText = "display:flex;justify-content:space-between;align-items:center;" +
      "background:var(--lcd-ink);color:var(--lcd-bg);padding:2px 6px;border-radius:3px;font-weight:700;margin-bottom:6px;";
    var screen = SP.el("div", { "aria-live": "polite" });
    lcd.appendChild(titleBar);
    lcd.appendChild(screen);
    body.appendChild(lcd);

    var crumb = SP.el("div", { class: "readout" });
    crumb.style.cssText = "text-align:center;margin-top:8px;font-size:12px;color:var(--faint);";
    if (!compact) body.appendChild(crumb);

    /* ---- D-pad ---- */
    var pad = SP.el("div");
    pad.style.cssText = "display:grid;grid-template-columns:repeat(3,minmax(52px,1fr));gap:8px;" +
      "max-width:280px;margin:14px auto 0;" +
      "grid-template-areas:'. up .' '. ok .' '. down back';";

    function padBtn(label, aria, area, handler, primary) {
      var b = SP.el("button", {
        class: "btn" + (primary ? " primary" : "") + (compact ? " small" : ""),
        type: "button", "aria-label": aria, text: label
      });
      b.style.gridArea = area;
      b.addEventListener("click", handler);
      return b;
    }

    pad.appendChild(padBtn("▲", "Up", "up", function () { move(-1); }));
    pad.appendChild(padBtn("OK", "Select or open", "ok", function () { doOK(); }, true));
    pad.appendChild(padBtn("▼", "Down", "down", function () { move(1); }));
    var backBtn = padBtn("Back", "Back — up one level", "back", function () { doBack(); });
    pad.appendChild(backBtn);
    body.appendChild(pad);

    /* ---- behaviour ---- */
    function cur() { return stack[stack.length - 1]; }

    function move(d) {
      var f = cur();
      if (f.node.type !== "menu") return;
      var n = f.node.items.length;
      f.sel = Math.max(0, Math.min(n - 1, f.sel + d));
      render();
    }
    function doOK() {
      var f = cur();
      if (f.node.type !== "menu") return;
      var item = f.node.items[f.sel];
      if (!item) return;
      stack.push({ node: item.node, sel: 0 });
      render();
    }
    function doBack() {
      if (stack.length <= 1) return;
      stack.pop();
      render();
    }

    function render() {
      var f = cur(), node = f.node;
      titleBar.innerHTML = "";
      titleBar.appendChild(SP.el("span", { text: node.title }));
      titleBar.appendChild(SP.el("span", { text: "((•))" }));

      screen.innerHTML = "";
      if (node.type === "menu") {
        node.items.forEach(function (it, i) {
          var selected = i === f.sel;
          var row = SP.el("div", { text: (selected ? "» " : "  ") + it.label });
          row.style.cssText = "padding:1px 4px;border-radius:3px;white-space:pre;";
          if (selected) { row.style.background = "var(--lcd-ink)"; row.style.color = "var(--lcd-bg)"; }
          screen.appendChild(row);
        });
      } else {
        node.lines.forEach(function (ln) {
          var d = SP.el("div", { text: ln });
          d.style.whiteSpace = "pre";
          d.style.minHeight = "1.2em";
          screen.appendChild(d);
        });
        if (node.note) {
          var n = SP.el("div", { text: node.note });
          n.style.cssText = "margin-top:8px;font-size:0.82em;opacity:0.8;font-style:italic;white-space:normal;line-height:1.3;";
          screen.appendChild(n);
        }
      }

      crumb.textContent = stack.map(function (fr) { return fr.node.title; }).join(" ▸ ");
      backBtn.disabled = stack.length <= 1;
    }

    /* ---- keyboard: only when focus is inside the widget ---- */
    host.addEventListener("keydown", function (e) {
      var t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      var isBtn = tag === "BUTTON";
      switch (e.key) {
        case "ArrowUp": e.preventDefault(); move(-1); break;
        case "ArrowDown": e.preventDefault(); move(1); break;
        case "Enter": if (!isBtn) { e.preventDefault(); doOK(); } break;
        case "Backspace": e.preventDefault(); doBack(); break;
        default: break;
      }
    });

    render();

    ui.foot("Teaching approximation — Momentum may reorder or add items (extra presets, tools). Learn the shape, then trust the real menu.");
  });
})();
