/* ============================================================
   Signal Path — widget: flashcards
   Flip-card study tool over window.SP_GLOSSARY
   (array of { term, short, long, tags }). Degrades gracefully
   when the glossary isn't loaded.
   Registers as "flashcards".
   ============================================================ */
(function () {
  "use strict";
  if (!window.SP || !SP.registerWidget) return;

  function ensureCSS() {
    if (document.getElementById("sp-flashcards-css")) return;
    var s = document.createElement("style");
    s.id = "sp-flashcards-css";
    s.textContent =
      ".sp-fc{perspective:1200px;margin:0 0 12px;}" +
      ".sp-fc-card{position:relative;width:100%;min-height:200px;cursor:pointer;display:block;}" +
      ".sp-fc-inner{position:relative;width:100%;min-height:inherit;transition:transform .5s cubic-bezier(.2,.7,.2,1);transform-style:preserve-3d;}" +
      ".sp-fc-card.flipped .sp-fc-inner{transform:rotateY(180deg);}" +
      ".sp-fc.reduced .sp-fc-inner{transition:none;}" +
      ".sp-fc-face{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;" +
        "display:flex;flex-direction:column;gap:10px;justify-content:center;overflow:auto;" +
        "border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);padding:22px 22px 30px;}" +
      ".sp-fc-back{transform:rotateY(180deg);}" +
      ".sp-fc-eyebrow{font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:var(--faint);}" +
      ".sp-fc-term{font-family:var(--font-display);font-weight:800;font-size:26px;line-height:1.12;color:var(--text);}" +
      ".sp-fc-short{font-size:15.5px;color:var(--text);}" +
      ".sp-fc-long{font-size:13.5px;color:var(--muted);}" +
      ".sp-fc-tags{display:flex;flex-wrap:wrap;gap:6px;}" +
      ".sp-fc-hint{position:absolute;right:14px;bottom:9px;font-family:var(--font-mono);font-size:10px;" +
        "text-transform:uppercase;letter-spacing:.1em;color:var(--faint);}";
    document.head.appendChild(s);
  }

  SP.registerWidget("flashcards", function (host, opts) {
    opts = opts || {};
    var compact = opts.mode === "compact";
    ensureCSS();

    var ui = SP.widgetShell(host, "Glossary flashcards", "flip to check yourself");
    var body = ui.body;

    /* ---- data ---- */
    var GL = window.SP_GLOSSARY;
    var all = Array.isArray(GL) ? GL.filter(function (e) { return e && e.term; }) : [];
    if (!all.length) {
      body.appendChild(SP.el("div", { class: "callout note" }, [
        SP.el("span", { class: "ic", text: "i" }),
        SP.el("div", {}, [
          SP.el("span", { class: "callout-title", text: "Glossary not loaded" }),
          SP.el("p", { html: "These cards read the site glossary. They appear on any page that loads " +
            "<code>assets/js/data/glossary.js</code> before this widget." })
        ])
      ]));
      return;
    }

    /* union of tags */
    var tagMap = {};
    all.forEach(function (e) { (e.tags || []).forEach(function (t) { if (t) tagMap[t] = true; }); });
    var tags = Object.keys(tagMap).sort();

    var list = all.slice();
    var i = 0;
    var flipped = false;
    var saved = SP.state && typeof SP.state.flashIndex === "number" ? SP.state.flashIndex : 0;
    if (saved >= 0 && saved < list.length) i = saved;

    /* ---- controls ---- */
    var controls = SP.el("div", { class: "widget-controls" });

    var tagSel = SP.el("select", { "aria-label": "Filter cards by tag" });
    tagSel.appendChild(SP.el("option", { value: "all", text: "all tags" }));
    tags.forEach(function (t) { tagSel.appendChild(SP.el("option", { value: t, text: t })); });
    tagSel.addEventListener("change", function () { applyFilter(tagSel.value); });
    controls.appendChild(SP.el("label", {}, [SP.el("span", { text: "Tag" }), tagSel]));

    var shuffleBtn = SP.el("button", { class: "btn small", type: "button", text: "Shuffle" });
    shuffleBtn.addEventListener("click", function () { shuffle(); });
    controls.appendChild(shuffleBtn);

    var spacer = SP.el("span"); spacer.style.flex = "1";
    controls.appendChild(spacer);

    var pos = SP.el("span", { class: "readout" });
    controls.appendChild(pos);
    body.appendChild(controls);

    /* ---- card ---- */
    var wrap = SP.el("div", { class: "sp-fc" + (SP.reducedMotion ? " reduced" : "") });
    var card = SP.el("div", { class: "sp-fc-card", role: "button", tabindex: "0",
      "aria-pressed": "false", "aria-label": "Flashcard. Activate to flip between term and definition." });
    var minH = compact ? "150px" : "200px";
    card.style.minHeight = minH;
    var inner = SP.el("div", { class: "sp-fc-inner" });
    inner.style.minHeight = minH;
    var front = SP.el("div", { class: "sp-fc-face" });
    var back = SP.el("div", { class: "sp-fc-face sp-fc-back" });
    inner.appendChild(front); inner.appendChild(back);
    card.appendChild(inner); wrap.appendChild(card);
    card.addEventListener("click", flip);
    body.appendChild(wrap);

    /* ---- nav buttons ---- */
    var nav = SP.el("div", { class: "btn-row" });
    var prevBtn = SP.el("button", { class: "btn small", type: "button", text: "‹ Prev", "aria-label": "Previous card" });
    var flipBtn = SP.el("button", { class: "btn small primary", type: "button", text: "Flip" });
    var nextBtn = SP.el("button", { class: "btn small", type: "button", text: "Next ›", "aria-label": "Next card" });
    prevBtn.addEventListener("click", function () { go(-1); });
    flipBtn.addEventListener("click", flip);
    nextBtn.addEventListener("click", function () { go(1); });
    nav.appendChild(prevBtn); nav.appendChild(flipBtn); nav.appendChild(nextBtn);
    body.appendChild(nav);

    /* ---- keyboard: only when focus is inside the widget ---- */
    host.addEventListener("keydown", function (e) {
      var t = e.target, tag = t && t.tagName;
      var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      var isBtn = tag === "BUTTON";
      switch (e.key) {
        case "ArrowLeft": if (typing) return; e.preventDefault(); go(-1); break;
        case "ArrowRight": if (typing) return; e.preventDefault(); go(1); break;
        case " ":
        case "Enter":
          if (typing || isBtn) return; /* let native buttons / selects act */
          e.preventDefault(); flip(); break;
        default: break;
      }
    });

    /* ---- logic ---- */
    function esc(s) { return String(s == null ? "" : s); }

    function renderCard() {
      var e = list[i] || { term: "—" };
      front.innerHTML = "";
      front.appendChild(SP.el("div", { class: "sp-fc-eyebrow", text: "Term" }));
      front.appendChild(SP.el("div", { class: "sp-fc-term", text: esc(e.term) }));
      if (e.tags && e.tags.length) {
        var chips = SP.el("div", { class: "sp-fc-tags" });
        e.tags.forEach(function (t) { chips.appendChild(SP.el("span", { class: "pill grey", text: t })); });
        front.appendChild(chips);
      }
      front.appendChild(SP.el("div", { class: "sp-fc-hint", text: "flip →" }));

      back.innerHTML = "";
      back.appendChild(SP.el("div", { class: "sp-fc-eyebrow", text: esc(e.term) }));
      if (e.short) back.appendChild(SP.el("div", { class: "sp-fc-short", text: esc(e.short) }));
      if (e.long) back.appendChild(SP.el("div", { class: "sp-fc-long", text: esc(e.long) }));
      if (!e.short && !e.long) back.appendChild(SP.el("div", { class: "sp-fc-long", text: "No definition on file." }));
      back.appendChild(SP.el("div", { class: "sp-fc-hint", text: "← flip" }));

      setFlipped(false);
      pos.textContent = (i + 1) + " / " + list.length;
    }

    function setFlipped(v) {
      flipped = v;
      card.classList.toggle("flipped", flipped);
      card.setAttribute("aria-pressed", flipped ? "true" : "false");
    }
    function flip() { setFlipped(!flipped); }

    function go(d) {
      if (!list.length) return;
      i = (i + d + list.length) % list.length;
      renderCard();
      if (SP.state) { SP.state.flashIndex = i; if (SP.save) SP.save(); }
    }

    function applyFilter(tag) {
      list = tag === "all" ? all.slice() : all.filter(function (e) { return (e.tags || []).indexOf(tag) !== -1; });
      if (!list.length) list = all.slice();
      i = 0;
      renderCard();
    }

    function shuffle() {
      for (var k = list.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var tmp = list[k]; list[k] = list[j]; list[j] = tmp;
      }
      i = 0;
      renderCard();
      SP.toast && SP.toast("Shuffled " + list.length + " cards");
    }

    renderCard();
  });
})();
