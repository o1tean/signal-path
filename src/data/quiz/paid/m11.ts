/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm11-q01',
    q: 'What does the 38 kHz figure for the Flipper\'s infrared receiver describe?',
    options: [
      'The wavelength of the infrared light itself, which sets the colour of the LED',
      'How fast the LED blinks inside each burst of the signal',
      'A Sub-GHz radio channel the Flipper listens on',
      'How many commands per second a remote can send',
    ],
    answer: 1,
    why: 'The light at 940 nm is about 319 THz. 38 kHz is the carrier: the rate at which the LED is switched on and off inside each mark.',
  },
  {
    id: 'm11-q02',
    q: 'Which is the clearest first test of a learned button?',
    options: [
      'Power, sent to every screen in the room',
      'A Universal Remotes sweep in a shop',
      'Repeated presses of the same button until something on the screen changes',
      'One volume-down send to your own TV, with a covered-port control',
    ],
    answer: 3,
    why: 'One expected change on one device you own makes the result attributable, and the covered-port send rules out coincidence.',
  },
  {
    id: 'm11-q03',
    q: 'The learn screen shows "Unknown" and a sample count. What does that mean?',
    options: [
      'The signal is encrypted',
      'The TV is guaranteed to accept the recording, because RAW keeps every pulse exactly',
      'No decoder matched, so the Flipper kept the mark and space durations',
      'The remote uses Bluetooth instead of infrared',
    ],
    answer: 2,
    why: 'RAW is a representation, not a verdict. It stores up to 1,024 timings in microseconds and can still replay well at short range.',
  },
  {
    id: 'm11-q04',
    q: 'Why does a learned RAW button always say "frequency: 38000" in its .ir file?',
    options: [
      'The receiver module strips the carrier, so the app writes the default it cannot measure',
      'Every infrared remote in the world uses exactly 38 kHz',
      'The Flipper measured the carrier and rounded it',
      'The .ir format cannot store any other value',
    ],
    answer: 0,
    why: 'The Flipper only sees the demodulated envelope. Firmware 1.4.3 fills RAW captures with the common 38 kHz and 0.33 duty cycle, and the format accepts other values.',
  },
  {
    id: 'm11-q05',
    q: 'In an NEC signal, what tells a 1 bit from a 0 bit?',
    options: [
      'The length of the mark at the start of each bit',
      'The length of the space after each 560 µs mark',
      'The carrier frequency of the burst',
      'The brightness of the LED',
    ],
    answer: 1,
    why: 'Every NEC bit starts with the same 560 µs mark. A 560 µs space means 0 and a 1,690 µs space means 1 (firmware 1.4.3 timings).',
  },
  {
    id: 'm11-q06',
    q: 'Why does every standard NEC frame last about 68 ms, whichever button you press?',
    options: [
      'The remote pads short commands with silence',
      'The receiver stretches every frame to the same length so it can check the timing',
      'The Flipper trims every capture to 68 ms',
      'The inverted bytes guarantee exactly 16 ones and 16 zeros in the 32 bits',
    ],
    answer: 3,
    why: 'Each inverted byte has a 1 wherever the original has a 0, so the bit lengths always sum to 16 × 1,120 + 16 × 2,250 µs, plus the 9 ms + 4.5 ms start and the stop mark.',
  },
  {
    id: 'm11-q07',
    q: 'You learn a Sony button and it decodes as SIRC. Which carrier does the Flipper use when it sends it back?',
    options: [
      '36 kHz',
      '38 kHz',
      '40 kHz',
      '433.92 MHz',
    ],
    answer: 2,
    why: 'A decoded protocol carries its own carrier: firmware 1.4.3 sends SIRC and Pioneer at 40 kHz and RC5 and RC6 at 36 kHz. A RAW capture would go out at 38 kHz.',
  },
  {
    id: 'm11-q08',
    q: 'A RAW capture of an NEC remote shows marks of 505 µs and 610 µs instead of 560 µs. What is the likely reason?',
    options: [
      'The receiver module varies each output pulse by up to about 5 carrier cycles',
      'The remote is faulty and should be replaced, because a healthy NEC remote holds its timing exactly',
      'The signal uses rolling codes',
      'The Flipper\'s clock is wrong',
    ],
    answer: 0,
    why: 'The Vishay datasheet allows ±5 carrier cycles, about ±132 µs at 38 kHz. Decoders allow for it; Flipper\'s NEC decoder accepts ±120 µs per bit timing.',
  },
  {
    id: 'm11-q09',
    q: 'In Lab 11.2 you cover the IR port, send, and nothing happens. What does this control establish?',
    options: [
      'That the TV does not support infrared',
      'That the volume change you see uncovered comes from the Flipper\'s light, not coincidence',
      'That the capture was RAW',
      'That the LEDs are damaged',
    ],
    answer: 1,
    why: 'Changing only the light path and seeing the response disappear and return ties the effect to the Flipper\'s transmission.',
  },
  {
    id: 'm11-q10',
    q: 'Why should you avoid Infrared → Universal Remotes in a shared office?',
    options: [
      'It permanently reprograms the screens it reaches',
      'It needs a licence from the radio regulator',
      'It only works with Bluetooth televisions',
      'It sends the same command for every model in its library, so any compatible screen in range may respond',
    ],
    answer: 3,
    why: 'Flipper\'s documentation says Universal Remotes iterates over a dictionary of known protocols. In a shared space that reaches devices you do not own. Infrared is light, so a radio licence is not the issue.',
  },
];

export default questions;
