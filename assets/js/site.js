/* ============================================================
   Signal Path — shared site runtime
   theme · nav · progress & badges · quiz engine · widget registry
   toc scroll-spy · toast · confetti
   Exposes window.SP
   ============================================================ */
(function () {
  "use strict";

  var SP = {};
  window.SP = SP;

  /* ---------- course map (single source of truth) ---------- */
  SP.MODULES = [
    { id: "m00", n: 0,  week: "Week 0",  title: "Meet your radio lab",            href: "modules/00-setup.html",           badge: "signal-seeker" },
    { id: "m01", n: 1,  week: "Week 1",  title: "Find the frequency",             href: "modules/01-frequency.html",       badge: "frequency-finder" },
    { id: "m02", n: 2,  week: "Week 1",  title: "Hear the signal: AM vs FM",      href: "modules/02-modulation.html",      badge: "modulation-master" },
    { id: "m03", n: 3,  week: "Week 2",  title: "Decode a real protocol",         href: "modules/03-protocols.html",       badge: "protocol-reader" },
    { id: "m04", n: 4,  week: "Week 2",  title: "Your first legal replay",        href: "modules/04-transmit.html",        badge: "clean-transmitter" },
    { id: "m05", n: 5,  week: "Week 3",  title: "Raw signals & rolling codes",    href: "modules/05-raw-and-rolling.html", badge: "code-breaker" },
    { id: "m06", n: 6,  week: "Week 4",  title: "125 kHz RFID",                   href: "modules/06-rfid.html",            badge: "tag-whisperer" },
    { id: "m07", n: 7,  week: "Week 4",  title: "NFC at 13.56 MHz",               href: "modules/07-nfc.html",             badge: "nfc-explorer" },
    { id: "m08", n: 8,  week: "Week 5",  title: "Firmware, apps & Momentum",        href: "modules/08-momentum.html",        badge: "momentum-pilot" },
    { id: "m09", n: 9,  week: "Week 5",  title: "Troubleshooting field guide",    href: "modules/09-troubleshooting.html", badge: "field-medic" },
    { id: "m10", n: 10, week: "Week 6",  title: "Foundation project: your signal atlas",    href: "modules/10-capstone.html",        badge: "atlas-builder" },
    {"id": "m11", "n": 11, "week": "Week 7", "title": "Infrared: build your own remote", "href": "modules/11-infrared.html", "badge": "infrared"},
    {"id": "m12", "n": 12, "week": "Week 8", "title": "GPIO: signals you can touch", "href": "modules/12-gpio.html", "badge": "gpio"},
    {"id": "m13", "n": 13, "week": "Week 8", "title": "USB and Bluetooth: understand trust", "href": "modules/13-usb-bluetooth.html", "badge": "usb-bluetooth"},
    {"id": "m14", "n": 14, "week": "Week 9", "title": "iButton and U2F: identity is not authentication", "href": "modules/14-contact-and-authentication.html", "badge": "contact-and-authentication"},
    {"id": "m15", "n": 15, "week": "Week 10", "title": "Build your first Flipper app", "href": "modules/15-app-development.html", "badge": "app-development"},
    {"id": "m16", "n": 16, "week": "Week 11", "title": "Authorized security research: test the claim", "href": "modules/16-security-lab.html", "badge": "security-lab"},
    {"id": "m17", "n": 17, "week": "Week 11–12", "title": "Mastery project: explain, measure, teach", "href": "modules/17-mastery.html", "badge": "mastery"}
  ];

  SP.BADGES = [
    { id: "signal-seeker",     ic: "◎", name: "Signal Seeker",      how: "Finish Module 0" },
    { id: "frequency-finder",  ic: "∿", name: "Frequency Finder",   how: "Finish Module 1" },
    { id: "modulation-master", ic: "⌇", name: "Modulation Master",  how: "Finish Module 2" },
    { id: "protocol-reader",   ic: "⌗", name: "Protocol Reader",    how: "Finish Module 3" },
    { id: "clean-transmitter", ic: "⇡", name: "Clean Transmitter",  how: "Finish Module 4" },
    { id: "code-breaker",      ic: "⟳", name: "Rolling-Code Realist", how: "Finish Module 5" },
    { id: "tag-whisperer",     ic: "◌", name: "Tag Whisperer",      how: "Finish Module 6" },
    { id: "nfc-explorer",      ic: "◍", name: "NFC Explorer",       how: "Finish Module 7" },
    { id: "momentum-pilot",    ic: "➤", name: "Firmware Pilot",     how: "Finish Module 8" },
    { id: "field-medic",       ic: "✚", name: "Field Medic",        how: "Finish Module 9" },
    { id: "atlas-builder",     ic: "★", name: "Atlas Builder",      how: "Finish the capstone" },
    {"id": "infrared", "ic": "◇", "name": "Infrared", "how": "Finish Module 11"},
    {"id": "gpio", "ic": "◇", "name": "GPIO", "how": "Finish Module 12"},
    {"id": "usb-bluetooth", "ic": "◇", "name": "USB and Bluetooth", "how": "Finish Module 13"},
    {"id": "contact-and-authentication", "ic": "◇", "name": "iButton and U2F", "how": "Finish Module 14"},
    {"id": "app-development", "ic": "◇", "name": "Build your first Flipper app", "how": "Finish Module 15"},
    {"id": "security-lab", "ic": "◇", "name": "Authorized security research", "how": "Finish Module 16"},
    {"id": "mastery", "ic": "◇", "name": "Mastery project", "how": "Finish Module 17"},

    { id: "tuned-in",          ic: "◉", name: "Tuned In",           how: "Score 5 in the Tune In game" },
    { id: "wave-rider",        ic: "≈", name: "Wave Rider",         how: "Encode a message in the Wave Lab" },
    { id: "out-of-sync",       ic: "⊘", name: "Out of Sync",        how: "Watch a replay fail in the Rolling Code Sim" },
    { id: "perfect-quiz",      ic: "✓", name: "Perfect Quiz",       how: "Score 100% on any quiz" },
    { id: "all-clear",         ic: "◆", name: "All Clear",          how: "Complete every module" }
  ];

  /* ---------- environment ---------- */
  SP.root = (document.body && document.body.getAttribute("data-root")) || "";
  SP.page = (document.body && document.body.getAttribute("data-page")) || "";
  SP.reducedMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  SP.cssVar = function (name, el) {
    return getComputedStyle(el || document.documentElement).getPropertyValue(name).trim();
  };
  SP.el = function (tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  };

  /* ---------- storage ---------- */
  var KEY = "signalpath.v2";
  function load() {
    try { var raw = localStorage.getItem(KEY); var parsed = raw ? JSON.parse(raw) : {}; return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; } catch (e) { return {}; }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { if (SP.toast) SP.toast("Browser storage is unavailable or full. Export a backup before leaving."); return false; } }
  var state = load();
  ["done", "quiz", "badges", "notes"].forEach(function (key) { if (!state[key] || typeof state[key] !== "object" || Array.isArray(state[key])) state[key] = {}; });
  state.done = state.done || {};
  state.quiz = state.quiz || {};
  state.badges = state.badges || {};
  state.atlas = Array.isArray(state.atlas) ? state.atlas.filter(function (x) { return x && typeof x === "object"; }) : [];
  SP.state = state;
  SP.save = function () { var stored = save(state); document.dispatchEvent(new CustomEvent("sp:state")); return stored; };
  SP.resetAll = function () {
    state = { done: {}, quiz: {}, badges: {}, atlas: state.atlas, notes: state.notes };
    SP.state = state; save(state);
    document.dispatchEvent(new CustomEvent("sp:state"));
  };

  /* ---------- theme ---------- */
  var THEME_KEY = "signalpath.theme";
  function readTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function applyTheme(t) {
    var root = document.documentElement;
    if (t === "light" || t === "dark") root.setAttribute("data-theme", t);
    else root.removeAttribute("data-theme");
    document.dispatchEvent(new CustomEvent("sp:theme", { detail: { theme: SP.effectiveTheme() } }));
  }
  SP.effectiveTheme = function () {
    var cur = document.documentElement.getAttribute("data-theme");
    if (cur) return cur;
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  };
  SP.toggleTheme = function () {
    var next = SP.effectiveTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  };
  applyTheme(readTheme());
  if (window.matchMedia) {
    try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { if (!readTheme()) applyTheme(null); }); } catch (e) {}
  }

  /* ---------- progress ---------- */
  SP.isDone = function (id) { return !!state.done[id]; };
  SP.doneCount = function () { return SP.MODULES.filter(function (m) { return state.done[m.id]; }).length; };
  SP.markDone = function (id, done) {
    var was = !!state.done[id];
    state.done[id] = !!done;
    var mod = SP.MODULES.filter(function (m) { return m.id === id; })[0];
    if (done && !was) {
      if (mod && mod.badge) SP.award(mod.badge, true);
      if (SP.doneCount() === SP.MODULES.length) SP.award("all-clear", true);
      SP.toast("Module " + (mod ? mod.n : "") + " complete" + (mod ? " — " + mod.title : ""));
      SP.confetti();
    }
    SP.save();
  };
  SP.award = function (badgeId, quiet) {
    if (state.badges[badgeId]) return false;
    state.badges[badgeId] = true;
    SP.save();
    var b = SP.BADGES.filter(function (x) { return x.id === badgeId; })[0];
    if (!quiet && b) { SP.toast("Badge earned: " + b.ic + " " + b.name); SP.confetti(); }
    return true;
  };

  function renderProgressUI() {
    var n = SP.doneCount(), t = SP.MODULES.length;
    document.querySelectorAll("[data-progress-text]").forEach(function (el) { el.textContent = n + " / " + t; });
    document.querySelectorAll("[data-progress-bar]").forEach(function (el) { el.style.width = (n / t * 100) + "%"; });
    document.querySelectorAll("[data-badges]").forEach(function (host) {
      host.innerHTML = "";
      SP.BADGES.forEach(function (b) {
        var earned = !!state.badges[b.id] && (b.id !== "all-clear" || SP.doneCount() === SP.MODULES.length);
        host.appendChild(SP.el("span", { class: "badge" + (earned ? " earned" : ""), title: earned ? "Earned — " + b.how : b.how }, [
          SP.el("span", { class: "b-ic", text: b.ic }), SP.el("span", { text: b.name })
        ]));
      });
    });
    document.querySelectorAll("[data-mod-card]").forEach(function (card) {
      var id = card.getAttribute("data-mod-card");
      var done = !!state.done[id];
      card.classList.toggle("done", done);
      var s = card.querySelector(".mc-status");
      if (s) s.textContent = done ? "✓ complete" : (state.quiz[id] ? "quiz " + state.quiz[id].score + "/" + state.quiz[id].total : "");
    });
    document.querySelectorAll("[data-complete-module]").forEach(function (box) {
      var id = box.getAttribute("data-complete-module");
      var done = !!state.done[id];
      box.classList.toggle("done", done);
      var btn = box.querySelector("button");
      var txt = box.querySelector(".txt");
      if (btn) { btn.textContent = done ? "Mark incomplete" : "Mark module complete"; btn.className = "btn" + (done ? "" : " primary"); }
      if (txt) txt.innerHTML = done ? "<b>Done.</b> Nice work — on to the next one." : "<b>Can you explain and repeat the result?</b> Record your evidence in the notebook. Completion is self-reported.";
    });
  }
  document.addEventListener("sp:state", renderProgressUI);

  /* ---------- nav ---------- */
  function buildNav() {
    var bar = document.querySelector(".topbar");
    if (!bar) return;
    var r = SP.root;
    var links = [
      ["index.html#course", "Course"],
      ["roadmap.html", "Learning path"],
      ["notebook.html", "Notebook"],
      ["playground.html", "Playground"],
      ["quiz.html", "Quiz"],
      ["reference.html", "Reference"],
      ["sources.html", "Sources"],
      ["legal.html", "Legal"]
    ];
    var here = location.pathname.split("/").pop() || "index.html";
    var inner = SP.el("div", { class: "topbar-inner" });
    inner.appendChild(SP.el("a", { class: "brand", href: r + "index.html" }, [SP.el("span", { class: "dot" }), "Signal Path"]));
    var prog = SP.el("span", { class: "nav-progress" }, [
      SP.el("span", { "data-progress-text": "" , text: "0 / " + SP.MODULES.length }),
      SP.el("span", { class: "mini-bar" }, [SP.el("i", { "data-progress-bar": "" })])
    ]);
    inner.appendChild(prog);
    var nav = SP.el("nav", { class: "topnav", id: "site-nav", "aria-label": "Site" });
    links.forEach(function (l) {
      var a = SP.el("a", { href: r + l[0], text: l[1] });
      var file = l[0].split("#")[0];
      if (file === here || (here === "" && file === "index.html")) {
        if (!(file === "index.html" && SP.page && SP.page.indexOf("m") === 0)) a.setAttribute("aria-current", "page");
      }
      if (SP.page && SP.page.indexOf("m") === 0 && file === "index.html") a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
    inner.appendChild(nav);
    var toggle = SP.el("button", { type: "button", class: "icon-btn nav-toggle", "aria-label": "Menu", "aria-expanded": "false", "aria-controls": "site-nav", text: "☰" });
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    bar.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus();
      }
    });
    inner.appendChild(toggle);
    var tb = SP.el("button", { type: "button", class: "theme-btn", "aria-label": "Toggle color theme", text: "◐ theme" });
    tb.addEventListener("click", SP.toggleTheme);
    inner.appendChild(tb);
    bar.innerHTML = "";
    bar.appendChild(inner);
  }

  /* ---------- module chrome: complete box + pager ---------- */
  function buildModuleChrome() {
    var id = SP.page;
    var idx = -1;
    SP.MODULES.forEach(function (m, i) { if (m.id === id) idx = i; });
    if (idx < 0) return;
    var mod = SP.MODULES[idx];
    var content = document.querySelector(".content");
    if (!content) return;

    content.appendChild(SP.el("p", {}, [SP.el("a", { href: SP.root + "notebook.html?module=" + id, text: "Record this module in your learning notebook →" })]));

    // complete box
    var box = SP.el("div", { class: "mod-complete", "data-complete-module": id }, [
      SP.el("div", { class: "txt" }),
      SP.el("button", { class: "btn primary", type: "button", text: "Mark module complete" })
    ]);
    box.querySelector("button").addEventListener("click", function () { SP.markDone(id, !SP.isDone(id)); });
    content.appendChild(box);

    // pager
    var pager = SP.el("div", { class: "pager" });
    var prev = SP.MODULES[idx - 1], next = SP.MODULES[idx + 1];
    var r = SP.root;
    pager.appendChild(prev
      ? SP.el("a", { class: "prev", href: r + prev.href }, [SP.el("div", { class: "pg-k", text: "← Module " + prev.n }), SP.el("div", { class: "pg-t", text: prev.title })])
      : SP.el("a", { class: "prev", href: r + "primer.html" }, [SP.el("div", { class: "pg-k", text: "← Before you start" }), SP.el("div", { class: "pg-t", text: "The primer" })]));
    pager.appendChild(next
      ? SP.el("a", { class: "next", href: r + next.href }, [SP.el("div", { class: "pg-k", text: "Module " + next.n + " →" }), SP.el("div", { class: "pg-t", text: next.title })])
      : SP.el("a", { class: "next", href: r + "playground.html" }, [SP.el("div", { class: "pg-k", text: "Keep playing →" }), SP.el("div", { class: "pg-t", text: "The playground" })]));
    content.appendChild(pager);

    // toc "next" links
    var toc = document.querySelector(".toc");
    if (toc && next) {
      var tn = SP.el("div", { class: "toc-next" }, [
        SP.el("span", { class: "eyebrow", text: "Up next" }),
        SP.el("a", { href: r + next.href, text: next.n + " · " + next.title })
      ]);
      toc.appendChild(tn);
    }
  }

  /* ---------- toc scroll spy ---------- */
  function tocSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
    if (!links.length) return;
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
    if (!targets.length || !("IntersectionObserver" in window)) return;
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) current = en.target.id; });
      if (current) links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + current); });
    }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------- quiz engine ---------- */
  /* questions: [{ q, opts:[..], a: index, why }] */
  SP.quiz = function (host, questions, opts) {
    opts = opts || {};
    var id = opts.id || host.getAttribute("data-quiz") || "quiz";
    var qs = questions.slice();
    if (opts.shuffle) { for (var k = qs.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var temp = qs[k]; qs[k] = qs[j]; qs[j] = temp; } }
    if (opts.limit) qs = qs.slice(0, opts.limit);
    host.classList.add("quiz");
    host.innerHTML = "";
    var answered = 0, correct = 0;
    var foot = SP.el("div", { class: "quiz-foot" });
    var scoreEl = SP.el("span", { html: "Score: <b>0</b> / " + qs.length });
    var retry = SP.el("button", { class: "btn small", type: "button", text: "Retry" });
    retry.addEventListener("click", function () { SP.quiz(host, questions, opts); });
    var prev = state.quiz[id];
    var best = SP.el("span", { class: "faint", text: prev ? "Best: " + prev.score + " / " + prev.total : "" });
    foot.appendChild(scoreEl); foot.appendChild(best); foot.appendChild(retry);

    qs.forEach(function (item, i) {
      var q = SP.el("div", { class: "q" });
      q.appendChild(SP.el("div", { class: "q-num", text: "Question " + (i + 1) + " of " + qs.length }));
      var qTextId = "spq-" + id + "-" + i;
      q.appendChild(SP.el("div", { class: "q-text", id: qTextId, text: item.q }));
      var optsEl = SP.el("div", { class: "opts", role: "group", "aria-labelledby": qTextId });
      var explain = SP.el("div", { class: "explain", role: "status", "aria-live": "polite" });
      explain.style.display = "none";
      var buttons = [];
      item.opts.forEach(function (o, j) {
        var b = SP.el("button", { class: "opt", type: "button" }, [SP.el("span", { class: "letter", text: String.fromCharCode(65 + j) }), SP.el("span", { text: o })]);
        b.addEventListener("click", function () {
          buttons.forEach(function (x) { x.disabled = true; });
          var ok = j === item.a;
          b.classList.add(ok ? "correct" : "wrong");
          if (!ok) buttons[item.a].classList.add("correct");
          explain.textContent = (ok ? "Correct. " : "Not quite. ") + (item.why || "");
          explain.className = "explain " + (ok ? "ok" : "bad");
          explain.style.display = "";
          answered++; if (ok) correct++;
          scoreEl.innerHTML = "Score: <b>" + correct + "</b> / " + qs.length;
          if (answered === qs.length) finish();
        });
        buttons.push(b);
        optsEl.appendChild(b);
      });
      q.appendChild(optsEl); q.appendChild(explain);
      host.appendChild(q);
    });
    host.appendChild(foot);

    function finish() {
      var previous = state.quiz[id];
      if (!previous || correct / qs.length > previous.score / previous.total ||
          (correct / qs.length === previous.score / previous.total && qs.length >= previous.total)) {
        state.quiz[id] = { score: correct, total: qs.length };
      }
      SP.save();
      best.textContent = "Best: " + state.quiz[id].score + " / " + state.quiz[id].total;
      if (correct === qs.length) { SP.award("perfect-quiz"); SP.toast("Perfect score on this quiz!"); SP.confetti(); }
      else SP.toast("Quiz done: " + correct + " / " + qs.length);
    }
  };

  function mountQuizzes() {
    var bank = window.SP_QUIZ_BANK || {};
    document.querySelectorAll("[data-quiz]").forEach(function (host) {
      var id = host.getAttribute("data-quiz");
      var qs = bank[id];
      if (!qs || !qs.length) { host.innerHTML = "<p class='faint'>Quiz coming soon.</p>"; return; }
      var limit = parseInt(host.getAttribute("data-limit") || "0", 10) || 0;
      SP.quiz(host, qs, { id: id, shuffle: host.hasAttribute("data-shuffle"), limit: limit });
    });
  }

  /* ---------- widget registry ---------- */
  var widgets = {};
  SP.widgets = widgets;
  SP.registerWidget = function (name, fn) { widgets[name] = fn; mountWidgets(); };
  function mountWidgets() {
    document.querySelectorAll("[data-widget]").forEach(function (host) {
      if (host.getAttribute("data-mounted")) return;
      var name = host.getAttribute("data-widget");
      var fn = widgets[name];
      if (!fn) return;
      var o = {};
      try { o = JSON.parse(host.getAttribute("data-opts") || "{}"); } catch (e) {}
      host.setAttribute("data-mounted", "1");
      try { fn(host, o); } catch (e) {
        host.innerHTML = "<div class='callout warn'><span class='ic'>!</span><div><span class='callout-title'>This interactive couldn't load.</span>" + (e && e.message ? String(e.message) : "") + "</div></div>";
        if (window.console) console.error("widget " + name, e);
      }
    });
  }
  /* shell helper for widgets */
  SP.widgetShell = function (host, title, sub) {
    host.classList.add("widget");
    host.innerHTML = "";
    var head = SP.el("div", { class: "widget-head" }, [
      SP.el("div", { class: "widget-title" }, [SP.el("span", { class: "dot" }), title]),
      sub ? SP.el("div", { class: "widget-sub", text: sub }) : null,
      SP.el("div", { class: "spacer" })
    ]);
    var body = SP.el("div", { class: "widget-body" });
    host.appendChild(head); host.appendChild(body);
    return { head: head, body: body, foot: function (text) { var f = SP.el("div", { class: "widget-foot", html: text }); host.appendChild(f); return f; } };
  };
  /* hi-dpi canvas helper: returns ctx, keeps size in CSS px, redraws on resize */
  SP.fitCanvas = function (canvas, draw) {
    var ctx = canvas.getContext("2d");
    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.clientWidth || 600, h = canvas.clientHeight || parseInt(canvas.getAttribute("height") || "200", 10);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (draw) draw(ctx, w, h);
    }
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener("resize", resize);
    resize();
    return { ctx: ctx, redraw: resize };
  };

  /* ---------- toast ---------- */
  var toastEl, toastTimer;
  SP.toast = function (msg) {
    if (!toastEl) { toastEl = SP.el("div", { class: "toast", role: "status", "aria-live": "polite" }); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  };

  /* ---------- confetti ---------- */
  SP.confetti = function () {
    if (SP.reducedMotion) return;
    var c = document.getElementById("sp-confetti");
    if (!c) { c = SP.el("canvas", { id: "sp-confetti" }); document.body.appendChild(c); }
    var dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    var ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var colors = [SP.cssVar("--orange"), SP.cssVar("--cyan"), SP.cssVar("--yellow"), SP.cssVar("--green")];
    var parts = [];
    for (var i = 0; i < 90; i++) parts.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.6,
      vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 12 - 4,
      s: 4 + Math.random() * 5, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      col: colors[i % colors.length]
    });
    var t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var dt = (ts - t0) / 1000;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      var alive = false;
      parts.forEach(function (p) {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= 0.99;
        if (p.y < innerHeight + 20) alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col;
        ctx.globalAlpha = Math.max(0, 1 - dt / 2.2);
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx.restore();
      });
      if (alive && dt < 2.4) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
    requestAnimationFrame(frame);
  };

  /* ---------- boot ---------- */
  function boot() {
    if (!document.querySelector("link[rel='icon']")) {
      var fav = SP.el("link", { rel: "icon", type: "image/svg+xml", href: SP.root + "assets/favicon.svg" });
      document.head.appendChild(fav);
    }
    var main = document.querySelector("main") || document.querySelector("body > .wrap");
    if (main) {
      if (!main.id) main.id = "main-content";
      if (main.tagName !== "MAIN") main.setAttribute("role", "main");
      main.setAttribute("tabindex", "-1");
      document.body.insertBefore(SP.el("a", { class: "skip-link", href: "#" + main.id, text: "Skip to content" }), document.body.firstChild);
    }
    buildNav();
    buildModuleChrome();
    tocSpy();
    mountQuizzes();
    mountWidgets();
    renderProgressUI();
    document.querySelectorAll("[data-reset-progress]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (confirm("Reset completion marks, quiz scores and badges? Your atlas and notebook will be kept.")) { SP.resetAll(); SP.toast("Progress reset"); }
      });
    });
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) { b.addEventListener("click", SP.toggleTheme); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
