/* ============================================================
   Signal Path — widget: signal-atlas  (capstone)
   A personal RF-device logger backed by SP.state.atlas (array).
   Add / edit / delete entries, load samples, export JSON or CSV
   into a copyable textarea (no file downloads — sandbox blocks them).
   Registers as "signal-atlas".
   ============================================================ */
(function () {
  "use strict";
  if (!window.SP || !SP.registerWidget) return;

  SP.registerWidget("signal-atlas", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    /* ensure backing store exists even if state was reshaped */
    if (!SP.state) SP.state = {};
    if (!Array.isArray(SP.state.atlas)) SP.state.atlas = [];

    var ui = SP.widgetShell(host, "Signal Atlas", "your personal RF-device log");
    var body = ui.body;

    var CATS = ["Sub-GHz", "125 kHz RFID", "NFC"];
    var MODS = ["n/a", "AM650", "AM270", "FM238", "FM476", "FSK", "other"];
    var CODES = ["Fixed", "Rolling", "Unknown"];
    var COLS = ["name", "category", "frequency", "modulation", "protocol", "codeType", "notes"];

    var INPUT_CSS = "font-family:var(--font-mono);font-size:13px;padding:6px 8px;border-radius:7px;" +
      "border:1px solid var(--line-strong);background:var(--surface);color:var(--text);width:100%;";

    var editIndex = -1;

    if (!compact) {
      body.appendChild(SP.el("p", { class: "readout",
        html: "Log every remote, fob, tag and card you own. This is your reference — and the capstone deliverable." }));
    }

    /* ---------- form ---------- */
    function textInput(placeholder, aria) {
      var el = SP.el("input", { type: "text", placeholder: placeholder || "", "aria-label": aria || placeholder || "" });
      el.style.cssText = INPUT_CSS;
      return el;
    }
    function selectInput(options, aria) {
      var el = SP.el("select", { "aria-label": aria || "" });
      el.style.cssText = INPUT_CSS;
      options.forEach(function (o) { el.appendChild(SP.el("option", { value: o, text: o })); });
      return el;
    }
    function field(labelText, control, full) {
      var w = SP.el("label", {});
      w.style.cssText = "display:flex;flex-direction:column;gap:4px;font-size:11.5px;" +
        "font-family:var(--font-mono);color:var(--muted);text-transform:uppercase;letter-spacing:.06em;";
      if (full) w.style.gridColumn = "1 / -1";
      w.appendChild(SP.el("span", { text: labelText }));
      w.appendChild(control);
      return w;
    }

    var nameEl = textInput("Front doorbell", "Device name");
    var catEl = selectInput(CATS, "Category");
    var freqEl = textInput("433.92 MHz", "Frequency");
    var modEl = selectInput(MODS, "Modulation / preset");
    var protEl = textInput("Princeton", "Protocol");
    var codeEl = selectInput(CODES, "Code type");
    var notesEl = SP.el("textarea", { rows: "2", placeholder: "Anything worth remembering…", "aria-label": "Notes" });
    notesEl.style.cssText = INPUT_CSS + "resize:vertical;";

    var form = SP.el("form");
    form.setAttribute("novalidate", "");
    form.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));" +
      "gap:12px;align-items:end;margin-bottom:14px;";
    form.appendChild(field("Name", nameEl));
    form.appendChild(field("Category", catEl));
    form.appendChild(field("Frequency", freqEl));
    form.appendChild(field("Modulation", modEl));
    form.appendChild(field("Protocol", protEl));
    form.appendChild(field("Code type", codeEl));
    form.appendChild(field("Notes", notesEl, true));

    var actions = SP.el("div", { class: "btn-row" });
    actions.style.gridColumn = "1 / -1";
    var submitBtn = SP.el("button", { class: "btn primary", type: "submit", text: "Add device" });
    var cancelBtn = SP.el("button", { class: "btn ghost", type: "button", text: "Cancel edit" });
    cancelBtn.style.display = "none";
    cancelBtn.addEventListener("click", function () { resetForm(); });
    actions.appendChild(submitBtn);
    actions.appendChild(cancelBtn);
    form.appendChild(actions);
    body.appendChild(form);

    /* ---------- utility row ---------- */
    var util = SP.el("div", { class: "widget-controls" });
    var sampleBtn = SP.el("button", { class: "btn small", type: "button", text: "Add sample entries" });
    sampleBtn.addEventListener("click", addSamples);
    util.appendChild(sampleBtn);
    var uspacer = SP.el("span"); uspacer.style.flex = "1"; util.appendChild(uspacer);
    var summary = SP.el("span", { class: "readout" });
    util.appendChild(summary);
    body.appendChild(util);

    /* ---------- table ---------- */
    var scroll = SP.el("div", { class: "table-scroll" });
    var table = SP.el("table");
    var thead = SP.el("thead");
    var htr = SP.el("tr");
    ["Name", "Category", "Freq", "Mod", "Protocol", "Code", "Notes", ""].forEach(function (h) {
      htr.appendChild(SP.el("th", { text: h }));
    });
    thead.appendChild(htr);
    var tbody = SP.el("tbody");
    table.appendChild(thead); table.appendChild(tbody);
    scroll.appendChild(table);
    body.appendChild(scroll);

    /* ---------- export ---------- */
    var details = SP.el("details");
    details.appendChild(SP.el("summary", { text: "Export data" }));
    var dbody = SP.el("div", { class: "d-body" });
    var exRow = SP.el("div", { class: "btn-row" });
    var jsonBtn = SP.el("button", { class: "btn small", type: "button", text: "Export JSON" });
    var csvBtn = SP.el("button", { class: "btn small", type: "button", text: "Export CSV" });
    var copyBtn = SP.el("button", { class: "btn small ghost", type: "button", text: "Copy" });
    exRow.appendChild(jsonBtn); exRow.appendChild(csvBtn); exRow.appendChild(copyBtn);
    dbody.appendChild(exRow);
    var ta = SP.el("textarea", { readonly: "", rows: "8",
      "aria-label": "Exported atlas data — select and copy" });
    ta.style.cssText = INPUT_CSS + "margin-top:10px;white-space:pre;resize:vertical;font-size:12px;";
    ta.value = "Choose Export JSON or Export CSV to fill this box, then Copy.";
    dbody.appendChild(ta);
    details.appendChild(dbody);
    body.appendChild(details);

    jsonBtn.addEventListener("click", function () { ta.value = toJSON(); details.open = true; ta.focus(); ta.select(); });
    csvBtn.addEventListener("click", function () { ta.value = toCSV(); details.open = true; ta.focus(); ta.select(); });
    copyBtn.addEventListener("click", copyExport);

    /* ---------- logic ---------- */
    function collect() {
      return {
        name: nameEl.value.trim(),
        category: catEl.value,
        frequency: freqEl.value.trim(),
        modulation: modEl.value,
        protocol: protEl.value.trim(),
        codeType: codeEl.value,
        notes: notesEl.value.trim()
      };
    }
    function validFreq(v) {
      v = (v || "").trim();
      if (!v) return true;            /* optional */
      return /\d/.test(v);            /* loose: "433.92" or "433.92 MHz" both pass */
    }
    function resetForm() {
      nameEl.value = ""; freqEl.value = ""; protEl.value = ""; notesEl.value = "";
      catEl.selectedIndex = 0; modEl.selectedIndex = 0; codeEl.selectedIndex = 0;
      editIndex = -1;
      submitBtn.textContent = "Add device";
      cancelBtn.style.display = "none";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var entry = collect();
      if (!entry.name) { SP.toast && SP.toast("Give the device a name first"); nameEl.focus(); return; }
      if (!validFreq(entry.frequency)) {
        SP.toast && SP.toast("Frequency should include a number, e.g. 433.92 MHz"); freqEl.focus(); return;
      }
      if (editIndex >= 0 && editIndex < SP.state.atlas.length) {
        SP.state.atlas[editIndex] = entry;
        SP.toast && SP.toast("Updated " + entry.name);
      } else {
        SP.state.atlas.push(entry);
        SP.toast && SP.toast("Logged " + entry.name);
      }
      if (SP.save) SP.save();
      resetForm();
      renderTable();
    });

    function editRow(idx) {
      var a = SP.state.atlas[idx];
      if (!a) return;
      nameEl.value = a.name || "";
      catEl.value = CATS.indexOf(a.category) !== -1 ? a.category : CATS[0];
      freqEl.value = a.frequency || "";
      modEl.value = MODS.indexOf(a.modulation) !== -1 ? a.modulation : MODS[0];
      protEl.value = a.protocol || "";
      codeEl.value = CODES.indexOf(a.codeType) !== -1 ? a.codeType : CODES[CODES.length - 1];
      notesEl.value = a.notes || "";
      editIndex = idx;
      submitBtn.textContent = "Save changes";
      cancelBtn.style.display = "";
      nameEl.focus();
      if (nameEl.scrollIntoView) nameEl.scrollIntoView({ block: "nearest" });
    }

    function deleteRow(idx) {
      SP.state.atlas.splice(idx, 1);
      if (editIndex === idx) resetForm();
      else if (editIndex > idx) editIndex--;
      if (SP.save) SP.save();
      renderTable();
    }

    function addSamples() {
      var samples = [
        { name: "Front doorbell", category: "Sub-GHz", frequency: "433.92 MHz", modulation: "AM650", protocol: "Princeton", codeType: "Fixed", notes: "(sample) fixed 24-bit code", sample: true },
        { name: "Car key fob", category: "Sub-GHz", frequency: "433.92 MHz", modulation: "FSK", protocol: "KeeLoq", codeType: "Rolling", notes: "(sample) counter changes every press", sample: true },
        { name: "Office badge", category: "125 kHz RFID", frequency: "125 kHz", modulation: "n/a", protocol: "EM4100", codeType: "Fixed", notes: "(sample) 40-bit EM-Marin ID", sample: true },
        { name: "Transit card", category: "NFC", frequency: "13.56 MHz", modulation: "n/a", protocol: "Mifare Classic", codeType: "Unknown", notes: "(sample) 13.56 MHz ISO 14443", sample: true }
      ];
      var added = 0;
      samples.forEach(function (s) {
        var dup = SP.state.atlas.some(function (a) { return a.sample && a.name === s.name; });
        if (!dup) {
          var copy = {};
          Object.keys(s).forEach(function (k) { copy[k] = s[k]; });
          SP.state.atlas.push(copy);
          added++;
        }
      });
      if (added) {
        if (SP.save) SP.save();
        renderTable();
        SP.toast && SP.toast("Added " + added + " sample device" + (added > 1 ? "s" : ""));
      } else {
        SP.toast && SP.toast("Samples are already in your atlas");
      }
    }

    function codePill(ct) {
      var cls = ct === "Rolling" ? "rolling" : ct === "Fixed" ? "fixed" : "grey";
      return SP.el("span", { class: "pill " + cls, text: ct || "—" });
    }
    function catPill(c) {
      var cls = c === "Sub-GHz" ? "orange" : c === "NFC" ? "purple" : "cyan";
      return SP.el("span", { class: "pill " + cls, text: c || "—" });
    }

    function renderTable() {
      var arr = SP.state.atlas;
      var rolling = arr.filter(function (a) { return a.codeType === "Rolling"; }).length;
      summary.innerHTML = "<b>" + arr.length + "</b> device" + (arr.length === 1 ? "" : "s") +
        " · <b>" + rolling + "</b> rolling";

      tbody.innerHTML = "";
      if (!arr.length) {
        var tr = SP.el("tr");
        var td = SP.el("td", { class: "faint",
          text: "No devices yet — add one above, or load a few samples to see how it works." });
        td.setAttribute("colspan", "8");
        tr.appendChild(td); tbody.appendChild(tr);
        return;
      }
      arr.forEach(function (a, idx) {
        var tr = SP.el("tr");
        tr.appendChild(SP.el("td", {}, [SP.el("b", { text: a.name || "—" })]));
        tr.appendChild(SP.el("td", {}, [catPill(a.category)]));
        tr.appendChild(SP.el("td", {}, [SP.el("span", { class: "mono", text: a.frequency || "—" })]));
        tr.appendChild(SP.el("td", {}, [SP.el("span", { class: "mono", text: a.modulation || "—" })]));
        tr.appendChild(SP.el("td", { text: a.protocol || "—" }));
        tr.appendChild(SP.el("td", {}, [codePill(a.codeType)]));
        tr.appendChild(SP.el("td", { class: "faint", text: a.notes || "" }));

        var act = SP.el("td");
        act.style.whiteSpace = "nowrap";
        var ed = SP.el("button", { class: "btn small ghost", type: "button", text: "Edit",
          "aria-label": "Edit " + (a.name || "device") });
        ed.addEventListener("click", function () { editRow(idx); });
        var del = SP.el("button", { class: "btn small ghost", type: "button", text: "✕",
          "aria-label": "Delete " + (a.name || "device") });
        del.style.marginLeft = "4px";
        del.addEventListener("click", function () { deleteRow(idx); });
        act.appendChild(ed); act.appendChild(del);
        tr.appendChild(act);
        tbody.appendChild(tr);
      });
    }

    /* ---------- export helpers ---------- */
    function clean(a) {
      var o = {};
      COLS.forEach(function (c) { o[c] = a[c] == null ? "" : a[c]; });
      return o;
    }
    function toJSON() {
      return JSON.stringify(SP.state.atlas.map(clean), null, 2);
    }
    function csvCell(v) {
      v = v == null ? "" : String(v);
      if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
      return v;
    }
    function toCSV() {
      var rows = [COLS.join(",")];
      SP.state.atlas.forEach(function (a) {
        rows.push(COLS.map(function (c) { return csvCell(a[c]); }).join(","));
      });
      return rows.join("\n");
    }
    function copyExport() {
      var txt = ta.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(
          function () { SP.toast && SP.toast("Copied to clipboard"); },
          function () { selectFallback(); }
        );
      } else {
        selectFallback();
      }
    }
    function selectFallback() {
      ta.focus(); ta.select();
      var ok = false;
      try { ok = document.execCommand && document.execCommand("copy"); } catch (e) { ok = false; }
      SP.toast && SP.toast(ok ? "Copied" : "Text selected — press Ctrl/Cmd+C to copy");
    }

    renderTable();

    ui.foot("Stays on this device (localStorage). Log only devices you own. Export to keep a copy elsewhere.");
  });
})();
