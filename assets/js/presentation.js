(function () {
  "use strict";
  function initPresentation() {
    var root = document.body.getAttribute("data-root") || "";
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var motionPaused = false;
    try {
      motionPaused = localStorage.getItem("signalpath.motion") === "paused";
    } catch (e) {}
    var brand = document.querySelector(".brand");
    if (brand) {
      var dot = brand.querySelector(".dot");
      var logo = document.createElement("img");
      logo.src = root + "assets/images/signal-path-logo.png";
      logo.alt = "";
      logo.width = 29;
      logo.height = 32;
      logo.className = "brand-logo";
      if (dot) dot.replaceWith(logo);
      else brand.prepend(logo);
    }
    var themeButton = document.querySelector(".theme-btn");
    if (themeButton) {
      themeButton.textContent = "◐";
      themeButton.title = "Toggle color theme";
    }
    var motionButton = document.createElement("button");
    motionButton.type = "button";
    motionButton.className = "motion-btn";
    motionButton.innerHTML = '<span aria-hidden="true">◌</span>';
    var bar = document.querySelector(".topbar-inner");
    if (bar) bar.appendChild(motionButton);
    function syncMotion() {
      var paused = motionPaused || reduced.matches;
      if (window.SP) window.SP.reducedMotion = reduced.matches;
      document.documentElement.classList.toggle("motion-off", paused);
      motionButton.setAttribute("aria-pressed", String(paused));
      motionButton.setAttribute(
        "aria-label",
        reduced.matches
          ? "Animations paused by system preference"
          : paused
            ? "Resume decorative animations"
            : "Pause decorative animations",
      );
      motionButton.title = motionButton.getAttribute("aria-label");
      motionButton.disabled = reduced.matches;
      motionButton.querySelector("span").textContent = paused ? "▷" : "Ⅱ";
      if (paused)
        document.querySelectorAll(".reveal-pending").forEach(function (el) {
          el.classList.remove("reveal-pending");
        });
    }
    motionButton.addEventListener("click", function () {
      motionPaused = !motionPaused;
      try {
        localStorage.setItem(
          "signalpath.motion",
          motionPaused ? "paused" : "playing",
        );
      } catch (e) {}
      syncMotion();
    });
    if (reduced.addEventListener)
      reduced.addEventListener("change", syncMotion);
    syncMotion();
    document.addEventListener("visibilitychange", function () {
      document.documentElement.classList.toggle(
        "motion-suspended",
        document.hidden,
      );
    });

    var signalModes = {
      subghz: {
        label: "Sub-GHz · fixed-code lab",
        frequency: "433.92",
        unit: "MHz",
        caption: "Discover what a remote is saying.",
        link: "modules/01-frequency.html",
        title: "Explore Sub-GHz →",
      },
      nfc: {
        label: "NFC · contactless lab",
        frequency: "13.56",
        unit: "MHz",
        caption: "Understand identity and authentication.",
        link: "modules/07-nfc.html",
        title: "Explore NFC →",
      },
      wifi: {
        label: "Wi-Fi · optional ESP32-S2 board",
        frequency: "2.4",
        unit: "GHz",
        caption: "A separate radio. A new set of skills.",
        link: "modules/18-wifi-devboard.html",
        title: "Explore the Wi-Fi Devboard →",
      },
    };
    var stage = document.querySelector("[data-signal-stage]");
    if (stage)
      document
        .querySelectorAll("[data-signal-mode]")
        .forEach(function (button) {
          button.addEventListener("click", function () {
            var mode = button.getAttribute("data-signal-mode"),
              data = signalModes[mode];
            stage.setAttribute("data-mode", mode);
            ["label", "frequency", "unit", "caption"].forEach(function (key) {
              document.querySelector("[data-signal-" + key + "]").textContent =
                data[key];
            });
            stage.querySelector(".hero-board").hidden = mode !== "wifi";
            var link = document.querySelector("[data-signal-link]");
            link.href = root + data.link;
            link.textContent = data.title;
            document
              .querySelectorAll("[data-signal-mode]")
              .forEach(function (b) {
                b.setAttribute("aria-pressed", String(b === button));
              });
          });
        });

    var firmwareModes = {
      debug: {
        nodes: [
          ["HOST", "Computer", "Debugger / USB or Wi-Fi"],
          ["BOARD", "Black Magic probe", "ESP32-S2 / SWD"],
          ["TARGET", "Flipper Zero", "Firmware under test"],
        ],
        explanation:
          "The computer controls the debugger. The board translates that connection into SWD, so you can pause the Flipper, inspect state and step through code. CMSIS-DAP is the USB-only alternative.",
      },
      marauder: {
        nodes: [
          ["CONTROLLER", "Flipper companion", ".fap app / UART"],
          ["BOARD", "Marauder firmware", "ESP32-S2 / 2.4 GHz"],
          ["LAB TARGET", "Your access point", "Wi-Fi frames"],
        ],
        explanation:
          "The Flipper app sends commands over UART. Marauder on the board operates the Wi-Fi radio. Installing the app alone does not install the board firmware, and the S2 has no Bluetooth radio.",
      },
      custom: {
        nodes: [
          ["BUILD HOST", "ESP-IDF tools", "Build / USB flash"],
          ["BOARD", "Your program", "ESP32-S2 firmware"],
          ["YOUR INTERFACE", "Lab service", "Define its protocol"],
        ],
        explanation:
          "Compile an ESP32-S2 application and flash it to the board. You define its network or serial behavior. A Flipper client needs a matching protocol; it does not appear automatically.",
      },
    };
    var explorer = document.querySelector("[data-firmware-explorer]");
    if (explorer)
      document
        .querySelectorAll("[data-firmware-mode]")
        .forEach(function (button) {
          button.addEventListener("click", function () {
            var data = firmwareModes[button.getAttribute("data-firmware-mode")];
            explorer
              .querySelectorAll(".firmware-node")
              .forEach(function (node, i) {
                node.querySelector("span").textContent = data.nodes[i][0];
                node.querySelector("b").textContent = data.nodes[i][1];
                node.querySelector("small").textContent = data.nodes[i][2];
              });
            explorer.querySelector(".firmware-explanation").textContent =
              data.explanation;
            document
              .querySelectorAll("[data-firmware-mode]")
              .forEach(function (b) {
                b.setAttribute("aria-pressed", String(b === button));
              });
          });
        });

    if ("IntersectionObserver" in window) {
      var reveal = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("reveal-visible");
            entry.target.classList.remove("reveal-pending");
            reveal.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px 35px 0px" },
      );
      document
        .querySelectorAll(
          ".section-heading,.experience-card,.wifi-feature-inner,.mod-card,.closing-section,.firmware-explorer",
        )
        .forEach(function (el) {
          if (
            !motionPaused &&
            !reduced.matches &&
            el.getBoundingClientRect().top > window.innerHeight
          ) {
            el.classList.add("reveal-pending");
            reveal.observe(el);
          }
        });
      var visibility = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            entry.target.classList.toggle(
              "is-offscreen",
              !entry.isIntersecting,
            );
          });
        },
        { rootMargin: "100px" },
      );
      document
        .querySelectorAll(
          ".signal-stage,.board-scene,.experience-wave,.firmware-visual",
        )
        .forEach(function (el) {
          visibility.observe(el);
        });
      // Keyboard focus must never land on an element waiting for a scroll reveal.
      document.addEventListener("focusin", function (event) {
        var el = event.target.closest(".reveal-pending");
        if (el) {
          el.classList.remove("reveal-pending");
          reveal.unobserve(el);
        }
      });
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initPresentation);
  else initPresentation();
})();

/* ============================================================
   Pixel art (1-bit, 128x64 LCD style) + on-demand 3D loader.
   Original artwork; drawn in the spirit of the device's screen,
   not copied from it. Exposed as SP.pixel for scene3d.js.
   ============================================================ */
(function () {
  "use strict";
  var SP = (window.SP = window.SP || {});
  var BG = "#f6a03a", INK = "#1b1509"; /* same values as --lcd-bg / --lcd-ink */

  /* 5x7 font: key + 35 cells, row by row */
  var FONT = {};
  (
    "0 .###.#...##..###.#.###..##...#.###.|1 ..#...##....#....#....#....#...###.|" +
    "2 .###.#...#....#...#...#...#...#####|3 #####...#...#.....#.....##...#.###.|" +
    "4 ...#...##..#.#.#..#.#####...#....#.|5 ######....####.....#....##...#.###.|" +
    "6 ..##..#...#....####.#...##...#.###.|7 #####....#...#...#...#....#....#...|" +
    "8 .###.#...##...#.###.#...##...#.###.|9 .###.#...##...#.####....#...#..##..|" +
    "A .###.#...##...#######...##...##...#|B ####.#...##...#####.#...##...#####.|" +
    "C .###.#...##....#....#....#...#.###.|D ###..#..#.#...##...##...##..#.###..|" +
    "E ######....#....####.#....#....#####|F ######....#....####.#....#....#....|" +
    "G .###.#...##....#.####...##...#.####|H #...##...##...#######...##...##...#|" +
    "I .###...#....#....#....#....#...###.|J ..###...#....#....#....#.#..#..##..|" +
    "K #...##..#.#.#..##...#.#..#..#.#...#|L #....#....#....#....#....#....#####|" +
    "M #...###.###.#.##.#.##...##...##...#|N #...##...###..##.#.##..###...##...#|" +
    "O .###.#...##...##...##...##...#.###.|P ####.#...##...#####.#....#....#....|" +
    "Q .###.#...##...##...##.#.##..#..##.#|R ####.#...##...#####.#.#..#..#.#...#|" +
    "S .#####....#.....###.....#....#####.|T #####..#....#....#....#....#....#..|" +
    "U #...##...##...##...##...##...#.###.|V #...##...##...##...##...#.#.#...#..|" +
    "W #...##...##...##.#.##.#.###.###...#|X #...##...#.#.#...#...#.#.#...##...#|" +
    "Y #...##...#.#.#...#....#....#....#..|Z #####....#...#...#...#...#....#####|" +
    ". ..........................##...##..|: ......##...##........##...##.......|" +
    "- ...............#####...............|/ ....#....#...#...#...#...#....#....|" +
    "% ##..###..#...#...#...#...#..###..##|+ .......#....#..#####..#....#.......|" +
    "< ...#...#...#...#.....#.....#.....#.|> .#.....#.....#.....#...#...#...#...|" +
    "' .##...##....#......................|, .....................##...##....#..|" +
    "! ..#....#....#....#....#.........#..|? .###.#...#....#...#...#.........#..|" +
    "= ..........#####.....#####..........|( ...#...#...#....#....#.....#.....#.|" +
    ") .#.....#.....#....#....#...#...#...|* .....#.#.#.###.#####.###.#.#.#....."
  )
    .split("|")
    .forEach(function (g) {
      FONT[g.charAt(0)] = g.slice(2, 37);
    });

  /* sprites: rows of '#' (ink) and '.' */
  var SPRITES = {
    logo: "....######..|...#......#.|..#........#|..#.........|...##.......|.....##.....|.......##...|.........#..|..........#.|#.........#.|.#.......#..|..##...##...|....###.....",
    antenna: ".......#.......|......###......|.....#.#.#.....|....#..#..#....|...#...#...#...|.......#.......|.......#.......|.......#.......|.......#.......|.......#.......|......###......|.....#.#.#.....|....#..#..#....|...#...#...#...|..###########..",
    wave: "..###.......###.|.#...#.....#...#|#.....#...#.....|.......#.#......|........#.......",
    pulses: ".####....##..###|.#..#....##..#..|.#..#....##..#..|.#..#....##..#..|##..######..##..",
    key: "...###...|..#...#..|..#.#.#..|..#...#..|...#.#...|...#.#...|...#.#...|...#.##..|...#.#...|...#.##..|...#.#...|...###...",
    tag: "....#####....|..##.....##..|.#.........#.|#....###....#|#...#...#...#|#...#...#...#|#....###....#|.#.........#.|..##.....##..|....#####....|.....#.#.....|.....#.#.....|.....###.....",
    card: ".##############.|#..............#|#.####.........#|#.#..#....###..#|#.####...#...#.#|#........#.#.#.#|#........#...#.#|#.........###..#|#..............#|.##############.",
    chip: "..#.#.#.#.#..|.###########.|#.#.......#.#|.#..#####..#.|#.#.#...#.#.#|.#..#...#..#.|#.#.#...#.#.#|.#..#####..#.|#.#.......#.#|.###########.|..#.#.#.#.#..",
    ir: ".###.....#....|#...#...#....#|#...#..#....#.|#...#.........|#...#..#....#.|#...#...#....#|.###.....#....|.#.#..........|.#.#..........",
    pins: "#################|#.#.#.#.#.#.#.#.#|#################|.#.#.#.#.#.#.#.#.|.#.#.#.#.#.#.#.#.",
    usb: "....##....|...#..#...|...#..#...|...#..#...|.########.|.#......#.|.#.####.#.|.#.#..#.#.|.#.####.#.|.#......#.|.########.|....##....|....##....",
    lock: "...#####...|..#.....#..|..#.....#..|..#.....#..|.#########.|.#.......#.|.#...#...#.|.#..###..#.|.#...#...#.|.#.......#.|.#########.",
    flag: "#.........|######....|#.....###.|#........#|#.....###.|######....|#.........|#.........|#.........|###.......",
    ibutton: "....#####....|..##.....##..|.#..#####..#.|#..#.....#..#|#.#.......#.#|#.#.......#.#|#.#.......#.#|#..#.....#..#|.#..#####..#.|..##.....##..|....#####....",
    tool: ".........##.|........#..#|........#..#|.......#####|......#.....|.....#......|....#.......|...#........|.##.........|#..#........|#..#........|.##.........",
    wifi: "....#####....|..##.....##..|.#..#####..#.|#..#.....#..#|..#..###..#..|.....#.#.....|......#......",
    flipper:
      "......#############################|.....#............................#|....#..##########.....######......#|...#...#........#....#..#...#.....#|..#....#........#...#.#####.#.###.#|.#.....#........#...#.#...#.#.#.#.#|#......#........#...#.#####.#.###.#|#......#........#....#..#...#.....#|#......##########.....######......#|.#................................#|..#...............................#|...#..............................#|....#.............................#|.....#............................#|......#############################",
  };
  Object.keys(SPRITES).forEach(function (k) {
    SPRITES[k] = SPRITES[k].split("|");
  });

  function text(ctx, str, x, y, s) {
    s = s || 1;
    String(str)
      .toUpperCase()
      .split("")
      .forEach(function (ch) {
        var g = FONT[ch];
        if (g)
          for (var i = 0; i < 35; i++)
            if (g.charAt(i) === "#")
              ctx.fillRect(x + (i % 5) * s, y + Math.floor(i / 5) * s, s, s);
        x += 6 * s;
      });
    return x;
  }
  function sprite(ctx, name, x, y, s) {
    s = s || 1;
    var rows = SPRITES[name] || [];
    rows.forEach(function (row, j) {
      for (var i = 0; i < row.length; i++)
        if (row.charAt(i) === "#") ctx.fillRect(x + i * s, y + j * s, s, s);
    });
  }
  function arc(ctx, cx, cy, r, a0, a1) {
    for (var a = a0; a <= a1; a += 0.5 / r)
      ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
  }
  function wrap(str, width) {
    var out = [], line = "";
    String(str).toUpperCase().split(/\s+/).forEach(function (w) {
      if ((line + " " + w).trim().length > width && line) { out.push(line); line = w; }
      else line = (line + " " + w).trim();
    });
    if (line) out.push(line);
    return out;
  }
  /* one animated LCD frame: title bar, icon + scan arcs, text, footer */
  function lcd(canvas, spec, t) {
    var ctx = canvas.getContext("2d"), f = Math.floor((t || 0) * 3);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = INK;
    text(ctx, spec.title || "", 2, 1);
    ctx.fillRect(112, 1, 13, 7); ctx.fillRect(125, 3, 1, 3); /* battery */
    ctx.fillStyle = BG; ctx.fillRect(113, 2, 11, 5);
    ctx.fillStyle = INK; ctx.fillRect(114, 3, 8, 3);
    ctx.fillRect(0, 9, 128, 1);
    var icon = spec.icon || "logo", ih = (SPRITES[icon] || []).length, iw = ((SPRITES[icon] || [""])[0] || "").length;
    sprite(ctx, icon, 15 - Math.floor(iw / 2), 30 - Math.floor(ih / 2));
    for (var k = 0; k < 3; k++) if (((f + k) % 3) !== 2 || spec.anim === "bars") {
      if (spec.anim === "bars") { if (k <= f % 4) ctx.fillRect(28 + k * 3, 34 - k * 3, 2, 3 + k * 3); }
      else arc(ctx, 15 + iw / 2, 30, 4 + k * 3, -0.9, 0.9);
    }
    var x = 38;
    if (spec.big) { x = text(ctx, spec.big, 38, 15, 2); text(ctx, spec.unit || "", x + 2, 22); }
    (spec.lines || []).forEach(function (l, i) { text(ctx, l, 38, (spec.big ? 34 : 17) + i * 9); });
    ctx.fillRect(0, 54, 128, 10);
    ctx.fillStyle = BG;
    text(ctx, (spec.foot || "") + (spec.anim ? "...".slice(0, f % 4) : ""), 3, 56);
    text(ctx, spec.right || "", 128 - 3 - 6 * (spec.right || "").length, 56);
    ctx.fillStyle = INK;
  }
  function ascii(name) {
    var rows = SPRITES[name] || [], out = "";
    for (var y = 0; y < rows.length; y += 2) {
      var line = "";
      for (var x = 0; x < rows[0].length; x++) {
        var a = rows[y].charAt(x) === "#", b = rows[y + 1] && rows[y + 1].charAt(x) === "#";
        line += a && b ? "█" : a ? "▀" : b ? "▄" : " ";
      }
      out += line.replace(/\s+$/, "") + "\n";
    }
    return out;
  }
  var MODES = {
    subghz: { title: "SUB-GHZ", icon: "antenna", big: "433.92", unit: "MHz", lines: ["AM650  READ"], anim: "scan", foot: "SCANNING", right: "OK >" },
    nfc: { title: "NFC", icon: "card", big: "13.56", unit: "MHz", lines: ["ISO 14443-A"], anim: "scan", foot: "READING", right: "OK >" },
    wifi: { title: "WIFI", icon: "wifi", big: "2.4", unit: "GHz", lines: ["ESP32-S2  CH 6"], anim: "bars", foot: "SCANNING", right: "OK >" },
  };
  var ICONS = { m00: "logo", m01: "antenna", m02: "wave", m03: "pulses", m04: "antenna", m05: "key", m06: "tag", m07: "card", m08: "chip", m09: "tool", m10: "flag", m11: "ir", m12: "pins", m13: "usb", m14: "ibutton", m15: "chip", m16: "lock", m17: "flag", m18: "wifi" };
  SP.pixel = { FONT: FONT, SPRITES: SPRITES, MODES: MODES, text: text, sprite: sprite, arc: arc, lcd: lcd, ascii: ascii, measure: function (s) { return String(s).length * 6 - 1; } };

  function init() {
    var root = document.body.getAttribute("data-root") || "", page = document.body.getAttribute("data-page") || "";
    var animating = function () { return !document.documentElement.classList.contains("motion-off") && !document.hidden; };
    /* module header: a small screen with the module's icon and title */
    var header = document.querySelector(".mod-header"), h1 = header && header.querySelector("h1");
    if (header && h1) {
      var c = document.createElement("canvas"); c.width = 128; c.height = 64; c.className = "lcd-art"; c.setAttribute("aria-hidden", "true");
      var week = header.querySelector(".mod-week"), spec = { title: "MODULE " + page.replace(/^m/, ""), icon: ICONS[page] || "logo", lines: wrap(h1.textContent, 14).slice(0, 3), anim: "scan", foot: week ? week.textContent.split("·")[0].trim() : "", right: "OK >" };
      header.appendChild(c); lcd(c, spec, 0);
      setInterval(function () { if (animating() && c.getBoundingClientRect().bottom > 0) lcd(c, spec, performance.now() / 1000); }, 333);
    }
    document.querySelectorAll("[data-ascii]").forEach(function (pre) { pre.textContent = ascii(pre.getAttribute("data-ascii")); });
    if (document.querySelector("[data-scene3d]")) {
      var s = document.createElement("script"); s.type = "module"; s.src = root + "assets/js/scene3d.js"; document.head.appendChild(s);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
