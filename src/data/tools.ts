/* The 10 browser tools (src/widgets/<id>.ts). `free` tools are public on /tools and in the starter lessons.
   Copy: docs/v2/copy/tools.md (label = eyebrow, line = subheadline, locked = locked-state CTA). */

export interface ToolInfo {
  id: string;
  name: string;
  /** where the tool is taught and whether it is free (the copy's eyebrow) */
  label: string;
  /** one line, what the learner does with it */
  line: string;
  /** module ids that mount it */
  usedIn: string[];
  free: boolean;
  /** link shown when the tool is locked on /tools */
  locked?: { label: string; href: string };
}

const seeComplete = { label: 'See what Complete includes', href: '/pricing' };

export const tools: readonly ToolInfo[] = [
  {
    id: 'tune-in',
    name: 'Tune In',
    label: 'Module 1 · Free',
    line: 'A mystery device transmits. Read the peak and name its frequency; five right in a row earns the Tuned In badge.',
    usedIn: ['m01'],
    free: true,
  },
  {
    id: 'wave-lab',
    name: 'Wave Lab',
    label: 'Free demo · Used in Module 2',
    line: 'Type bits, choose OOK or FSK, and watch the data change the carrier.',
    usedIn: ['m02'],
    free: true,
  },
  {
    id: 'spectrum-scope',
    name: 'Spectrum Scope',
    label: 'Module 1 · Free',
    line: 'A simulated spectrum analyser with an animated noise floor. Press a remote and watch its peak rise.',
    usedIn: ['m01'],
    free: true,
  },
  {
    id: 'rf-calc',
    name: 'RF Calculator',
    label: 'Module 1 and the primer · Open in the free Module 1',
    line: 'Wavelength and quarter-wave antenna length from a frequency, and dBm to milliwatts in both directions.',
    usedIn: ['m01'],
    free: false,
    locked: { label: 'Use it in Module 1, free', href: '/learn/01-frequency' },
  },
  {
    id: 'pulse-decoder',
    name: 'Pulse Decoder',
    label: 'Module 3 · In Signal Path Complete',
    line: "Turn a pulse train into bits the way the Flipper's Read mode does.",
    usedIn: ['m03'],
    free: false,
    locked: seeComplete,
  },
  {
    id: 'rolling-sim',
    name: 'Rolling Code Sim',
    label: 'Modules 4 and 5 · In Signal Path Complete',
    line: 'A remote, a receiver with an acceptance window and a Flipper that captures and replays. See why a copied code is accepted once at most.',
    usedIn: ['m04', 'm05'],
    free: false,
    locked: seeComplete,
  },
  {
    id: 'flipper-sim',
    name: 'Flipper Sim',
    label: 'Module 0 · Open in the free Module 0',
    line: 'Drive the Sub-GHz menus with an on-screen D-pad and learn the menu tree before you hold the device.',
    usedIn: ['m00'],
    free: false,
    locked: { label: 'Use it in Module 0, free', href: '/learn/00-setup' },
  },
  {
    id: 'signal-atlas',
    name: 'Signal Atlas',
    label: 'Module 10 · In Signal Path Complete',
    line: 'Log the devices you own by frequency, modulation, protocol and code type, then export the list as JSON or CSV.',
    usedIn: ['m10'],
    free: false,
    locked: seeComplete,
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    label: 'Glossary · In Signal Path Complete',
    line: 'The glossary as flip cards. Space flips a card and the arrow keys move between them.',
    usedIn: [],
    free: false,
    locked: seeComplete,
  },
  {
    id: 'tool-picker',
    name: 'Tool Picker',
    label: 'Modules 5 and 9 · In Signal Path Complete',
    line: "Read a scenario and choose Read, Read RAW, the Frequency Analyzer, or stop because it's a rolling code.",
    usedIn: ['m05', 'm09'],
    free: false,
    locked: seeComplete,
  },
];

export const freeTools = () => tools.filter((t) => t.free);
export const toolById = (id: string) => tools.find((t) => t.id === id);
