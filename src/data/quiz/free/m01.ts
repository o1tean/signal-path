/* Free questions. Safe to ship to the client. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm01-q01',
    q: 'A friend\'s LED-strip remote shows nothing on the Frequency Analyzer at 1 cm, with a fresh cell, while the button is held. What is the most useful next check?',
    options: [
      'Read the label for an infrared window or a 2.4 GHz mark, since neither can appear on a Sub-GHz analyzer',
      'Press the button faster so the analyzer has more bursts to average',
      'Run the analyzer from one metre so the signal is not too strong',
      'Reset the Flipper region first, since a wrong region setting hides every Sub-GHz remote from the analyzer',
    ],
    answer: 0,
    why: 'A blank at close range with a fresh cell often means the remote is not Sub-GHz radio at all. Infrared and 2.4 GHz remotes are invisible to the CC1101 windows.',
  },
  {
    id: 'm01-q02',
    q: 'A .sub file stores the frequency as an integer in hertz. How is 433.92 MHz written there?',
    options: ['433920', '4339200', '433920000', '43392000'],
    answer: 2,
    why: 'Mega means million, so 433.92 MHz is 433,920,000 Hz. The file line reads "Frequency: 433920000".',
  },
  {
    id: 'm01-q03',
    q: "Which ranges can the Flipper's CC1101 Sub-GHz radio receive?",
    options: [
      '300–464 MHz as one continuous window',
      '387–464 and 464–779 MHz, then 779–928 MHz',
      '300–348, 387–464 and 779–928 MHz',
      '433–434 and 868–870 MHz only',
    ],
    answer: 2,
    why: 'The CC1101 and the Flipper antenna cover those three windows. Every common remote frequency, from 315 to 915 MHz, sits inside one of them.',
  },
  {
    id: 'm01-q04',
    q: 'What does the Frequency Analyzer actually do?',
    options: [
      "Decodes the signal's protocol and key from the strongest burst it hears",
      'Measures signal strength across its frequency list and shows the strongest one above about −90 dBm',
      'Transmits a short test tone on each list entry and times the echo to measure the range of nearby receivers',
      "Listens on every frequency from 300 to 928 MHz in 20 kHz steps with equal precision",
    ],
    answer: 1,
    why: 'It sweeps the configured list, then refines around the loudest entry in 20 kHz steps. Naming the protocol is the job of Read.',
  },
  {
    id: 'm01-q05',
    q: "You do not know your remote's frequency. What is the best first move?",
    options: [
      'Hold the remote almost touching the Flipper and keep its button pressed while the Frequency Analyzer runs',
      'Open Read RAW, press the remote once from across the room and save whatever trace appears',
      'Cycle through every preset in Read, pressing the remote once on each until a decoded name appears on the screen',
      'Run the analyzer from across the room so it can see the whole signal of the remote',
    ],
    answer: 0,
    why: 'The analyzer reports the loudest signal in range. Close and pressed makes your remote the loudest by a wide margin.',
  },
  {
    id: 'm01-q06',
    q: 'Your analyzer reads 315.000 MHz from a garage remote. Where was that remote most likely sold?',
    options: ['Romania', 'Germany', 'The United Kingdom', 'The United States'],
    answer: 3,
    why: '315 MHz is a North American remote frequency used under FCC Part 15.231. European remotes mostly use 433.92 or 868 MHz.',
  },
  {
    id: 'm01-q07',
    q: 'Two readings of the same remote: −45 dBm and −85 dBm. Which is true?',
    options: [
      '−85 dBm is stronger because the number is bigger',
      'They are about the same strength',
      '−45 dBm is stronger, by a factor of about 10,000 in power',
      'dBm measures frequency, so they cannot be compared',
    ],
    answer: 2,
    why: 'dBm is logarithmic and closer to zero is stronger. 40 dB is four factors of ten, so 10,000 times the power.',
  },
  {
    id: 'm01-q08',
    q: 'Three close-up readings of your doorbell are 433.900, 433.920 and 433.940 MHz. What is the sensible conclusion?',
    options: [
      'The doorbell is faulty because the frequency should not move',
      'The remote hops between three channels on purpose',
      'It is a 433.92 MHz remote, and the spread is the analyzer\'s 20 kHz step',
      'It is three different remotes in range at once',
    ],
    answer: 2,
    why: 'The fine pass steps in 20 kHz, so repeat readings of one remote scatter by a step or two. A shift of hundreds of kilohertz would be a different story.',
  },
  {
    id: 'm01-q09',
    q: 'A quarter-wave antenna for 433.92 MHz is about 17.3 cm. Roughly how long is one for 868 MHz?',
    options: ['About 8.6 cm', 'About 17.3 cm', 'About 34.5 cm', 'About 69 cm'],
    answer: 0,
    why: 'Wavelength is c divided by f. Doubling the frequency halves the wavelength, and so halves the antenna.',
  },
  {
    id: 'm01-q10',
    q: 'You hold a rolling-code car fob you own 1 cm from the Flipper and press it. What does the Frequency Analyzer do?',
    options: [
      'Shows nothing at all, because rolling codes stay hidden from an energy measurement until they are decoded',
      'Shows a frequency like any other remote, because it measures energy, not codes',
      'Shows the rolling code itself, which changes on every press',
      'Blocks the reading, because the region setting forbids measuring car fobs',
    ],
    answer: 1,
    why: 'The analyzer only measures signal strength. Rolling codes change what the fob says, which matters when you try to replay in Module 5.',
  },
];

export default questions;
