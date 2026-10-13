/* Course skeleton ported from legacy/assets/js/data/course.js: module ids, order, slugs and badges (the learner
   store and its legacy keys depend on these), plus stage descriptions. Titles, weeks, minutes, access and each
   lesson's stage live in the lesson frontmatter; server code reads them through src/lib/lessons.ts. */

export type StageId = 'starter' | 'signals' | 'atlas' | 'build' | 'research' | 'wifi';

export interface CourseModule {
  id: string;
  n: number;
  slug: string;
  href: string;
  badge: string;
}

export interface Badge {
  id: string;
  ic: string;
  name: string;
  how: string;
}

export interface Stage {
  id: StageId;
  label: string;
  title: string;
  description: string;
  evidence: string;
}

export const modules: readonly CourseModule[] = [
  {
    "id": "m00",
    "n": 0,
    "slug": "00-setup",
    "href": "/learn/00-setup",
    "badge": "signal-seeker"
  },
  {
    "id": "m01",
    "n": 1,
    "slug": "01-frequency",
    "href": "/learn/01-frequency",
    "badge": "frequency-finder"
  },
  {
    "id": "m02",
    "n": 2,
    "slug": "02-modulation",
    "href": "/learn/02-modulation",
    "badge": "modulation-master"
  },
  {
    "id": "m03",
    "n": 3,
    "slug": "03-protocols",
    "href": "/learn/03-protocols",
    "badge": "protocol-reader"
  },
  {
    "id": "m04",
    "n": 4,
    "slug": "04-transmit",
    "href": "/learn/04-transmit",
    "badge": "clean-transmitter"
  },
  {
    "id": "m05",
    "n": 5,
    "slug": "05-raw-and-rolling",
    "href": "/learn/05-raw-and-rolling",
    "badge": "code-breaker"
  },
  {
    "id": "m06",
    "n": 6,
    "slug": "06-rfid",
    "href": "/learn/06-rfid",
    "badge": "tag-whisperer"
  },
  {
    "id": "m07",
    "n": 7,
    "slug": "07-nfc",
    "href": "/learn/07-nfc",
    "badge": "nfc-explorer"
  },
  {
    "id": "m08",
    "n": 8,
    "slug": "08-momentum",
    "href": "/learn/08-momentum",
    "badge": "momentum-pilot"
  },
  {
    "id": "m09",
    "n": 9,
    "slug": "09-troubleshooting",
    "href": "/learn/09-troubleshooting",
    "badge": "field-medic"
  },
  {
    "id": "m10",
    "n": 10,
    "slug": "10-capstone",
    "href": "/learn/10-capstone",
    "badge": "atlas-builder"
  },
  {
    "id": "m11",
    "n": 11,
    "slug": "11-infrared",
    "href": "/learn/11-infrared",
    "badge": "infrared"
  },
  {
    "id": "m12",
    "n": 12,
    "slug": "12-gpio",
    "href": "/learn/12-gpio",
    "badge": "gpio"
  },
  {
    "id": "m13",
    "n": 13,
    "slug": "13-usb-bluetooth",
    "href": "/learn/13-usb-bluetooth",
    "badge": "usb-bluetooth"
  },
  {
    "id": "m14",
    "n": 14,
    "slug": "14-contact-and-authentication",
    "href": "/learn/14-contact-and-authentication",
    "badge": "contact-and-authentication"
  },
  {
    "id": "m15",
    "n": 15,
    "slug": "15-app-development",
    "href": "/learn/15-app-development",
    "badge": "app-development"
  },
  {
    "id": "m16",
    "n": 16,
    "slug": "16-security-lab",
    "href": "/learn/16-security-lab",
    "badge": "security-lab"
  },
  {
    "id": "m17",
    "n": 17,
    "slug": "17-mastery",
    "href": "/learn/17-mastery",
    "badge": "mastery"
  },
  {
    "id": "m18",
    "n": 18,
    "slug": "18-wifi-devboard",
    "href": "/learn/18-wifi-devboard",
    "badge": "wifi-devboard"
  }
];

export const badges: readonly Badge[] = [
  {
    "id": "signal-seeker",
    "ic": "◎",
    "name": "Signal Seeker",
    "how": "Finish Module 0"
  },
  {
    "id": "frequency-finder",
    "ic": "∿",
    "name": "Frequency Finder",
    "how": "Finish Module 1"
  },
  {
    "id": "modulation-master",
    "ic": "⌇",
    "name": "Modulation Master",
    "how": "Finish Module 2"
  },
  {
    "id": "protocol-reader",
    "ic": "⌗",
    "name": "Protocol Reader",
    "how": "Finish Module 3"
  },
  {
    "id": "clean-transmitter",
    "ic": "⇡",
    "name": "Clean Transmitter",
    "how": "Finish Module 4"
  },
  {
    "id": "code-breaker",
    "ic": "⟳",
    "name": "Rolling-Code Realist",
    "how": "Finish Module 5"
  },
  {
    "id": "tag-whisperer",
    "ic": "◌",
    "name": "Tag Whisperer",
    "how": "Finish Module 6"
  },
  {
    "id": "nfc-explorer",
    "ic": "◍",
    "name": "NFC Explorer",
    "how": "Finish Module 7"
  },
  {
    "id": "momentum-pilot",
    "ic": "➤",
    "name": "Firmware Pilot",
    "how": "Finish Module 8"
  },
  {
    "id": "field-medic",
    "ic": "✚",
    "name": "Field Medic",
    "how": "Finish Module 9"
  },
  {
    "id": "atlas-builder",
    "ic": "★",
    "name": "Atlas Builder",
    "how": "Finish the capstone"
  },
  {
    "id": "infrared",
    "ic": "◇",
    "name": "Infrared",
    "how": "Finish Module 11"
  },
  {
    "id": "gpio",
    "ic": "◇",
    "name": "GPIO",
    "how": "Finish Module 12"
  },
  {
    "id": "usb-bluetooth",
    "ic": "◇",
    "name": "USB and Bluetooth",
    "how": "Finish Module 13"
  },
  {
    "id": "contact-and-authentication",
    "ic": "◇",
    "name": "iButton and U2F",
    "how": "Finish Module 14"
  },
  {
    "id": "app-development",
    "ic": "◇",
    "name": "Build your first Flipper app",
    "how": "Finish Module 15"
  },
  {
    "id": "security-lab",
    "ic": "◇",
    "name": "Authorized security research",
    "how": "Finish Module 16"
  },
  {
    "id": "mastery",
    "ic": "◇",
    "name": "Mastery project",
    "how": "Finish Module 17"
  },
  {
    "id": "wifi-devboard",
    "ic": "◉",
    "name": "Wi-Fi Explorer",
    "how": "Finish Module 18"
  },
  {
    "id": "tuned-in",
    "ic": "◉",
    "name": "Tuned In",
    "how": "Score 5 in the Tune In game"
  },
  {
    "id": "wave-rider",
    "ic": "≈",
    "name": "Wave Rider",
    "how": "Encode a message in the Wave Lab"
  },
  {
    "id": "out-of-sync",
    "ic": "⊘",
    "name": "Out of Sync",
    "how": "Watch a replay fail in the Rolling Code Sim"
  },
  {
    "id": "perfect-quiz",
    "ic": "✓",
    "name": "Perfect Quiz",
    "how": "Score 100% on any quiz"
  },
  {
    "id": "all-clear",
    "ic": "◆",
    "name": "All Clear",
    "how": "Complete every module"
  }
];

export const stages: readonly Stage[] = [
  {
    "id": "starter",
    "label": "Start here · Weeks 0–1",
    "title": "Set up your lab",
    "description": "Meet the device, set your lab scope, and learn to find a frequency.",
    "evidence": "A setup record and one explained synthetic signal observation."
  },
  {
    "id": "signals",
    "label": "Stage 1 · Weeks 1–3",
    "title": "Read and reason about signals",
    "description": "Connect modulation, protocols, controlled replay, and rolling-code limits.",
    "evidence": "An annotated capture and an explanation of when replay fails."
  },
  {
    "id": "atlas",
    "label": "Stage 2 · Weeks 4–6",
    "title": "Build your signal atlas",
    "description": "Classify training tags, understand firmware choices, and troubleshoot a known setup.",
    "evidence": "A foundation atlas with observations, limits, and a recovery procedure."
  },
  {
    "id": "build",
    "label": "Stage 3 · Weeks 7–10",
    "title": "Build across interfaces",
    "description": "Explore IR, GPIO, USB/BLE, and authentication, then compile a small Flipper app.",
    "evidence": "A documented interface experiment and an app build with its test results."
  },
  {
    "id": "research",
    "label": "Stage 4 · Weeks 11–12",
    "title": "Demonstrate independent work",
    "description": "Test a bounded security claim with controls, mitigations, and reproducible evidence.",
    "evidence": "A final portfolio another learner can follow and critique."
  },
  {
    "id": "wifi",
    "label": "Optional extension · After Modules 8, 12 & 15",
    "title": "Take the Wi-Fi path",
    "description": "Use the official Devboard for firmware, debugging, recovery, and controlled AP measurements. Allow 3–4 extra sessions.",
    "evidence": "A firmware/recovery record and a repeatable test on your own lab AP."
  }
];

export const moduleById = (id: string) => modules.find((m) => m.id === id);
export const badgeById = (id: string) => badges.find((b) => b.id === id);
