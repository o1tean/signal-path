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
