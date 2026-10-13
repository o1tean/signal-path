/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm17-q01',
    q: 'Which result statement is the strongest one to put in a lab report?',
    options: [
      'It always works',
      'Five of five trials succeeded, so the failure rate is zero under any conditions',
      'Five of five trials succeeded at a recorded distance, aim and battery level',
      'It worked the one time I tried it from across the room',
    ],
    answer: 2,
    why: 'A bounded observation with its conditions can be checked and repeated. "Always" and single tries cannot.',
  },
  {
    id: 'm17-q02',
    q: 'A payload changes every time you press the button. What does that prove?',
    options: [
      'Only that the payload changed; what it means needs more evidence',
      'That the remote uses a rolling code, because only rolling codes change on every press',
      'That the signal is encrypted',
      'That the battery is running low',
    ],
    answer: 0,
    why: 'Sensors, counters, checksums and security schemes can all change a payload. You need the protocol and an advancing counter before calling it rolling.',
  },
  {
    id: 'm17-q03',
    q: 'You get 8 of 10 at 3 m and 8 of 10 at 5 m. What can you claim?',
    options: [
      'Distance made no difference at all',
      'Five metres is twice as reliable as three',
      'No difference was seen between these two conditions at this sample size; ten trials each cannot rule out a modest one',
      'The result is invalid because it contains failures',
    ],
    answer: 2,
    why: 'Equal counts show no observed difference, not proof of none. Small samples leave wide uncertainty, and the failures are data you keep.',
  },
  {
    id: 'm17-q04',
    q: 'A report says "volume-down works up to 6 m" and the log shows one send at 6 m. Which fix makes the claim honest?',
    options: [
      'Report the count at 6 m, for example 4 of 10, with the conditions and the clock time',
      'Delete the sentence and keep only the 1 m result',
      'Send once more at 6 m and report the better of the two',
      'Add "usually" before "works"',
    ],
    answer: 0,
    why: 'A claim needs a count per condition. One try cannot support a range, and choosing the better result hides the failures.',
  },
  {
    id: 'm17-q05',
    q: 'Roughly how many clean trials do you need before the 95 % upper bound on the failure rate drops to about 10 %?',
    options: [
      '5',
      '10',
      '30',
      '300',
    ],
    answer: 2,
    why: 'The rule of three puts the bound near 3 ÷ n, so 3 ÷ 30 = 10 %. The exact figure for 30 trials is 9.5 %.',
  },
  {
    id: 'm17-q06',
    q: 'The Frequency Analyzer shows 433.92 MHz while you press a remote. What has it measured?',
    options: [
      'The listed frequency with the strongest RSSI above −90 dBm, as an approximate reading',
      'The exact carrier frequency, calibrated to 1 Hz',
      'The full spectrum of the remote, including its bandwidth and every harmonic it radiates',
      'The protocol the remote uses',
    ],
    answer: 0,
    why: 'It scans the frequencies in its list and reports the strongest one above the threshold. Flipper describes the result as approximate; it is not a calibrated spectrum analyzer.',
  },
  {
    id: 'm17-q07',
    q: 'What does the RAW_Data in a Read RAW .sub file contain?',
    options: [
      'Complex I/Q samples you can re-demodulate later with a different preset or in an SDR tool',
      'The decoded key and bit count',
      'An audio recording of the signal',
      'Demodulated pulse timings in microseconds, shaped by the preset you chose',
    ],
    answer: 3,
    why: 'The Flipper is not an SDR. It demodulates with the chosen preset and stores the resulting timings, so a wrong preset records the wrong thing.',
  },
  {
    id: 'm17-q08',
    q: 'You test 1 m in the lounge and 5 m in the hallway, and success drops. What is wrong with the conclusion "distance reduces success"?',
    options: [
      'Nothing; the 5 m result was lower',
      'Two factors changed, distance and room, so the cause cannot be attributed',
      'You should have used a higher-power transmitter so distance could not affect the result',
      'Infrared range never depends on distance',
    ],
    answer: 1,
    why: 'A fair comparison changes one factor. Walls, reflections and lighting differ between rooms, so either change could explain the drop.',
  },
  {
    id: 'm17-q09',
    q: 'You read the UID of your unenrolled NFC training card. What does that UID tell you?',
    options: [
      'Which doors the card opens',
      'That the card cannot be copied, because a UID is burned into the chip at the factory',
      'An identifier the card returned, and nothing about what any reader grants it',
      'The owner of the card',
    ],
    answer: 2,
    why: "Access decisions live in the reader's system. A UID is what the card answered, which is why reports redact it and never infer rights from it.",
  },
  {
    id: 'm17-q10',
    q: 'In Lab 17.1 you cover the infrared window and send five times. What is that control for?',
    options: [
      'To lower the infrared dose the TV receives',
      'To check that the TV\'s own remote still works',
      'To reset the TV receiver before each block of sends',
      'To show the volume changes only when the Flipper\'s signal reaches the TV, not for some other reason',
    ],
    answer: 3,
    why: 'If the volume still changes with the window covered, something else is causing it and the other results cannot be trusted. A control should fail on purpose.',
  },
];

export default questions;
