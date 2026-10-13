/* ============================================================
   Signal Path — widget: rf-calc
   Two pocket calculators:
   (A) frequency → wavelength + antenna lengths
   (B) power converter dBm ⇄ mW
   Registers as: rf-calc
   ============================================================ */
(function () {
  "use strict";
  var SP = window.SP;
  if (!SP || !SP.registerWidget) return;

  var C = 299792458; // speed of light, m/s

  SP.registerWidget("rf-calc", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";

    var ui = SP.widgetShell(host, "RF calculator", "wavelength & power, worked out");
    var body = ui.body;

    /* ============ (A) frequency → wavelength ============ */
    var secA = SP.el("div", { class: "card flat tight", style: "margin-bottom:14px" });
    secA.appendChild(SP.el("div", { class: "eyebrow", text: "A · Wavelength & antenna" }));

    var ctrlA = SP.el("div", { class: "widget-controls" });
    var fLabel = SP.el("label", {}, ["Frequency (MHz)"]);
    var fInput = SP.el("input", {
      type: "number", value: "433.92", min: "0", step: "0.01",
      style: "width:120px", "aria-label": "Frequency in megahertz"
    });
    fLabel.appendChild(fInput);
    ctrlA.appendChild(fLabel);
    secA.appendChild(ctrlA);

    var kvA = SP.el("dl", { class: "kv tabular", style: "margin-bottom:0" });
    var ddLambda = SP.el("dd", {});
    var ddQuarter = SP.el("dd", {});
    var ddHalf = SP.el("dd", {});
    var ddWork = SP.el("dd", { class: "faint", style: "font-family:var(--font-mono); font-size:12px" });
    kvA.appendChild(SP.el("dt", { text: "λ (full)" })); kvA.appendChild(ddLambda);
    kvA.appendChild(SP.el("dt", { text: "λ/4" })); kvA.appendChild(ddQuarter);
    kvA.appendChild(SP.el("dt", { text: "λ/2" })); kvA.appendChild(ddHalf);
    if (!compact) { kvA.appendChild(SP.el("dt", { text: "worked" })); kvA.appendChild(ddWork); }
    secA.appendChild(kvA);
    body.appendChild(secA);

    /* ============ (B) power converter ============ */
    var secB = SP.el("div", { class: "card flat tight" });
    secB.appendChild(SP.el("div", { class: "eyebrow", text: "B · Power (dBm ⇄ mW)" }));

    // dBm -> mW
    var ctrlB1 = SP.el("div", { class: "widget-controls" });
    var dbmLabel = SP.el("label", {}, ["dBm"]);
    var dbmInput = SP.el("input", { type: "number", value: "10", step: "1", style: "width:100px", "aria-label": "Power in dBm" });
    dbmLabel.appendChild(dbmInput);
    ctrlB1.appendChild(dbmLabel);
    var dbmOut = SP.el("span", { class: "readout tabular" });
    ctrlB1.appendChild(dbmOut);
    secB.appendChild(ctrlB1);

    // mW -> dBm
    var ctrlB2 = SP.el("div", { class: "widget-controls" });
    var mwLabel = SP.el("label", {}, ["mW"]);
    var mwInput = SP.el("input", { type: "number", value: "1", min: "0", step: "0.1", style: "width:100px", "aria-label": "Power in milliwatts" });
    mwLabel.appendChild(mwInput);
    ctrlB2.appendChild(mwLabel);
    var mwOut = SP.el("span", { class: "readout tabular" });
    ctrlB2.appendChild(mwOut);
    secB.appendChild(ctrlB2);

    secB.appendChild(SP.el("div", { class: "readout faint", style: "margin-top:6px", html: "Reference: <b>0 dBm = 1 mW</b> · +10 dB = ×10 · +3 dB ≈ ×2" }));
    body.appendChild(secB);

    ui.foot("Wavelength: <b>λ = c ÷ f</b>, with c = 299,792,458 m/s. A quarter-wave whip (λ/4) is the classic \"rubber duck\" antenna length.");

    /* ---- formatting helpers ---- */
    function fmtCm(cm) {
      if (!isFinite(cm)) return "—";
      if (cm >= 100) return cm.toFixed(1) + " cm";
      if (cm >= 1) return cm.toFixed(2) + " cm";
      return (cm * 10).toFixed(2) + " mm";
    }
    function sig(n, digits) {
      if (!isFinite(n)) return "—";
      if (n === 0) return "0";
      var d = digits || 4;
      // fixed for readable ranges, else exponential
      if (n >= 0.001 && n < 1e7) {
        var abs = Math.abs(n);
        var dec = abs >= 100 ? 2 : (abs >= 1 ? 3 : 4);
        return parseFloat(n.toFixed(dec)).toString();
      }
      return n.toExponential(d - 1);
    }

    /* ---- calc A ---- */
    function calcA() {
      var fMHz = parseFloat(fInput.value);
      if (!isFinite(fMHz) || fMHz <= 0) {
        ddLambda.textContent = "—"; ddQuarter.textContent = "—"; ddHalf.textContent = "—";
        ddWork.textContent = "Enter a frequency above 0.";
        return;
      }
      var fHz = fMHz * 1e6;
      var lambdaM = C / fHz;         // metres
      var lambdaCm = lambdaM * 100;
      ddLambda.innerHTML = "<b>" + fmtCm(lambdaCm) + "</b>";
      ddQuarter.innerHTML = "<b>" + fmtCm(lambdaCm / 4) + "</b>";
      ddHalf.innerHTML = "<b>" + fmtCm(lambdaCm / 2) + "</b>";
      ddWork.textContent = "λ = 299,792,458 ÷ " + Math.round(fHz).toLocaleString() +
        " Hz = " + lambdaM.toFixed(4) + " m = " + lambdaCm.toFixed(2) + " cm";
    }

    /* ---- calc B ---- */
    function calcB1() {
      var dbm = parseFloat(dbmInput.value);
      if (!isFinite(dbm)) { dbmOut.innerHTML = "= <b>—</b>"; return; }
      var mw = Math.pow(10, dbm / 10);
      dbmOut.innerHTML = "= <b>" + sig(mw) + " mW</b>";
    }
    function calcB2() {
      var mw = parseFloat(mwInput.value);
      if (!isFinite(mw) || mw <= 0) { mwOut.innerHTML = "= <b>—</b>" + (mw === 0 ? " (0 mW = -∞ dBm)" : ""); return; }
      var dbm = 10 * Math.log10(mw);
      mwOut.innerHTML = "= <b>" + sig(dbm) + " dBm</b>";
    }

    /* ---- wire up ---- */
    fInput.addEventListener("input", calcA);
    dbmInput.addEventListener("input", calcB1);
    mwInput.addEventListener("input", calcB2);

    calcA(); calcB1(); calcB2();
  });
})();
