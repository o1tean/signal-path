/* Course catalog. Load before site.js. Stage grouping is navigation, not access control. */
window.SP_COURSE = {
  modules: [
    { id: "m00", n: 0, week: "Week 0", title: "Meet your radio lab", href: "modules/00-setup.html", badge: "signal-seeker" },
    { id: "m01", n: 1, week: "Week 1", title: "Find the frequency", href: "modules/01-frequency.html", badge: "frequency-finder" },
    { id: "m02", n: 2, week: "Week 1", title: "Hear the signal: AM vs FM", href: "modules/02-modulation.html", badge: "modulation-master" },
    { id: "m03", n: 3, week: "Week 2", title: "Decode a real protocol", href: "modules/03-protocols.html", badge: "protocol-reader" },
    { id: "m04", n: 4, week: "Week 2", title: "Your first legal replay", href: "modules/04-transmit.html", badge: "clean-transmitter" },
    { id: "m05", n: 5, week: "Week 3", title: "Raw signals & rolling codes", href: "modules/05-raw-and-rolling.html", badge: "code-breaker" },
    { id: "m06", n: 6, week: "Week 4", title: "125 kHz RFID", href: "modules/06-rfid.html", badge: "tag-whisperer" },
    { id: "m07", n: 7, week: "Week 4", title: "NFC at 13.56 MHz", href: "modules/07-nfc.html", badge: "nfc-explorer" },
    { id: "m08", n: 8, week: "Week 5", title: "Firmware, apps & Momentum", href: "modules/08-momentum.html", badge: "momentum-pilot" },
    { id: "m09", n: 9, week: "Week 5", title: "Troubleshooting field guide", href: "modules/09-troubleshooting.html", badge: "field-medic" },
    { id: "m10", n: 10, week: "Week 6", title: "Foundation project: your signal atlas", href: "modules/10-capstone.html", badge: "atlas-builder" },
    { id: "m11", n: 11, week: "Week 7", title: "Infrared: build your own remote", href: "modules/11-infrared.html", badge: "infrared" },
    { id: "m12", n: 12, week: "Week 8", title: "GPIO: signals you can touch", href: "modules/12-gpio.html", badge: "gpio" },
    { id: "m13", n: 13, week: "Week 8", title: "USB and Bluetooth: understand trust", href: "modules/13-usb-bluetooth.html", badge: "usb-bluetooth" },
    { id: "m14", n: 14, week: "Week 9", title: "iButton and U2F: identity is not authentication", href: "modules/14-contact-and-authentication.html", badge: "contact-and-authentication" },
    { id: "m15", n: 15, week: "Week 10", title: "Build your first Flipper app", href: "modules/15-app-development.html", badge: "app-development" },
    { id: "m16", n: 16, week: "Week 11", title: "Authorized security research: test the claim", href: "modules/16-security-lab.html", badge: "security-lab" },
    { id: "m17", n: 17, week: "Week 11–12", title: "Mastery project: explain, measure, teach", href: "modules/17-mastery.html", badge: "mastery" },
    { id: "m18", n: 18, week: "Hardware extension", title: "Wi-Fi Devboard & firmware", href: "modules/18-wifi-devboard.html", badge: "wifi-devboard" }
  ],
  badges: [
    { id: "signal-seeker", ic: "◎", name: "Signal Seeker", how: "Finish Module 0" },
    { id: "frequency-finder", ic: "∿", name: "Frequency Finder", how: "Finish Module 1" },
    { id: "modulation-master", ic: "⌇", name: "Modulation Master", how: "Finish Module 2" },
    { id: "protocol-reader", ic: "⌗", name: "Protocol Reader", how: "Finish Module 3" },
    { id: "clean-transmitter", ic: "⇡", name: "Clean Transmitter", how: "Finish Module 4" },
    { id: "code-breaker", ic: "⟳", name: "Rolling-Code Realist", how: "Finish Module 5" },
    { id: "tag-whisperer", ic: "◌", name: "Tag Whisperer", how: "Finish Module 6" },
    { id: "nfc-explorer", ic: "◍", name: "NFC Explorer", how: "Finish Module 7" },
    { id: "momentum-pilot", ic: "➤", name: "Firmware Pilot", how: "Finish Module 8" },
    { id: "field-medic", ic: "✚", name: "Field Medic", how: "Finish Module 9" },
    { id: "atlas-builder", ic: "★", name: "Atlas Builder", how: "Finish the capstone" },
    { id: "infrared", ic: "◇", name: "Infrared", how: "Finish Module 11" },
    { id: "gpio", ic: "◇", name: "GPIO", how: "Finish Module 12" },
    { id: "usb-bluetooth", ic: "◇", name: "USB and Bluetooth", how: "Finish Module 13" },
    { id: "contact-and-authentication", ic: "◇", name: "iButton and U2F", how: "Finish Module 14" },
    { id: "app-development", ic: "◇", name: "Build your first Flipper app", how: "Finish Module 15" },
    { id: "security-lab", ic: "◇", name: "Authorized security research", how: "Finish Module 16" },
    { id: "mastery", ic: "◇", name: "Mastery project", how: "Finish Module 17" },
    { id: "wifi-devboard", ic: "◉", name: "Wi-Fi Explorer", how: "Finish Module 18" },
    { id: "tuned-in", ic: "◉", name: "Tuned In", how: "Score 5 in the Tune In game" },
    { id: "wave-rider", ic: "≈", name: "Wave Rider", how: "Encode a message in the Wave Lab" },
    { id: "out-of-sync", ic: "⊘", name: "Out of Sync", how: "Watch a replay fail in the Rolling Code Sim" },
    { id: "perfect-quiz", ic: "✓", name: "Perfect Quiz", how: "Score 100% on any quiz" },
    { id: "all-clear", ic: "◆", name: "All Clear", how: "Complete every module" }
  ],
  stages: [
    {
      id: "starter",
      label: "Start here · Weeks 0–1",
      title: "Set up your lab",
      modules: ["m00","m01"],
      description: "Meet the device, set your lab scope, and learn to find a frequency.",
      evidence: "A setup record and one explained synthetic signal observation."
    },
    {
      id: "signals",
      label: "Stage 1 · Weeks 1–3",
      title: "Read and reason about signals",
      modules: ["m02","m03","m04","m05"],
      description: "Connect modulation, protocols, controlled replay, and rolling-code limits.",
      evidence: "An annotated capture and an explanation of when replay fails."
    },
    {
      id: "atlas",
      label: "Stage 2 · Weeks 4–6",
      title: "Build your signal atlas",
      modules: ["m06","m07","m08","m09","m10"],
      description: "Classify training tags, understand firmware choices, and troubleshoot a known setup.",
      evidence: "A foundation atlas with observations, limits, and a recovery procedure."
    },
    {
      id: "build",
      label: "Stage 3 · Weeks 7–10",
      title: "Build across interfaces",
      modules: ["m11","m12","m13","m14","m15"],
      description: "Explore IR, GPIO, USB/BLE, and authentication, then compile a small Flipper app.",
      evidence: "A documented interface experiment and an app build with its test results."
    },
    {
      id: "research",
      label: "Stage 4 · Weeks 11–12",
      title: "Demonstrate independent work",
      modules: ["m16","m17"],
      description: "Test a bounded security claim with controls, mitigations, and reproducible evidence.",
      evidence: "A final portfolio another learner can follow and critique."
    },
    {
      id: "wifi",
      label: "Optional extension · After Modules 8, 12 & 15",
      title: "Take the Wi-Fi path",
      modules: ["m18"],
      description: "Use the official Devboard for firmware, debugging, recovery, and controlled AP measurements. Allow 3–4 extra sessions.",
      evidence: "A firmware/recovery record and a repeatable test on your own lab AP."
    }
  ]
};
