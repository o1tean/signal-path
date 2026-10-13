/* Free questions. Safe to ship to the client. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm00-q01',
    q: 'On the Flipper, what does the Sub-GHz "Read" item do?',
    options: [
      'Transmits the last signal you saved',
      'Listens on a set frequency and decodes signals from protocols it knows',
      'Formats the microSD card',
      'Shows the frequencies your region allows for transmission and greys out the ones it blocks',
    ],
    answer: 1,
    why: 'Read receives and decodes known protocols. Transmitting a saved file happens from Saved, and region limits live under Region Information.',
  },
  {
    id: 'm00-q02',
    q: 'Where does the Flipper store the signals you save?',
    options: [
      'As files on the microSD card',
      'In internal flash memory only',
      'In an online account linked to the mobile app',
      'Inside the remote you captured',
    ],
    answer: 0,
    why: 'Captures are ordinary files on the microSD card, which is also why the card is required for saving and for firmware updates.',
  },
  {
    id: 'm00-q03',
    q: 'What is Momentum?',
    options: [
      'A clip-on antenna that extends range',
      'The official firmware release channel',
      'A community firmware for the same Flipper hardware',
      'A paid subscription for extra protocols',
    ],
    answer: 2,
    why: 'Momentum is community firmware that adds options and may reorder menus. Every core lab in this course runs on official firmware.',
  },
  {
    id: 'm00-q04',
    q: 'Which Sub-GHz item records a signal even when the Flipper cannot name its protocol?',
    options: ['Read', 'Frequency Analyzer', 'Add Manually', 'Read RAW'],
    answer: 3,
    why: 'Read RAW stores the raw pulse timings in microseconds, so it works without a known protocol. Read only saves signals it can decode.',
  },
  {
    id: 'm00-q05',
    q: 'With nothing pressed, the Frequency Analyzer shows no frequency. What does that tell you?',
    options: [
      'There is no radio energy in the room',
      'The antenna is disconnected',
      'Nothing nearby is stronger than its threshold on the frequencies it scans',
      'The analyzer only starts measuring after you have run Read once on the same frequency since boot',
    ],
    answer: 2,
    why: 'The analyzer reports only signals above roughly -90 dBm. Weaker signals and the noise floor are still there; they just do not clear the bar.',
  },
  {
    id: 'm00-q06',
    q: 'Your doorbell remote reads 433.90 MHz on one press and 433.92 MHz on the next. What is the best explanation?',
    options: [
      'The analyzer is approximate and steps in 20 kHz increments',
      'The remote switches between two bands to avoid interference',
      'One of the presses came from a neighbour\'s device',
      'The battery is too weak and the remote is drifting out of band',
    ],
    answer: 0,
    why: 'The fine scan moves in 20 kHz steps and Flipper calls the result approximate. Two readings 20 kHz apart are the same remote on the same channel.',
  },
  {
    id: 'm00-q07',
    q: 'One reading is -60 dBm and another is -90 dBm. How much more power does the -60 dBm signal carry?',
    options: ['30 times', '3 times', '100 times', '1,000 times'],
    answer: 3,
    why: 'Every 10 dB is a factor of ten in power, so 30 dB is 10 x 10 x 10 = 1,000. Decibels add where power ratios multiply.',
  },
  {
    id: 'm00-q08',
    q: 'A .sub file contains "Frequency: 433920000". What is that value?',
    options: [
      '433,920,000 kHz',
      '433.92 MHz, written in hertz',
      'A channel number in the region table',
      'The code the remote sent',
    ],
    answer: 1,
    why: 'The file format stores frequency in hertz. 433,920,000 Hz divided by one million is 433.92 MHz. The code itself is on the Key line.',
  },
  {
    id: 'm00-q09',
    q: 'Region Information lists 433.05 to 434.79 MHz for your device. What does that list mean?',
    options: [
      'These are the ranges the firmware lets you transmit on; national rules still apply',
      'Any transmission inside these ranges is legal everywhere in the EU, whatever the power or duty cycle',
      'The Flipper can only receive inside these ranges',
      'These are the frequencies the Frequency Analyzer scans',
    ],
    answer: 0,
    why: 'Official firmware unlocks transmit ranges for the region set during the update. It is a guard rail, not a licence; the regulator\'s conditions still decide what is lawful.',
  },
  {
    id: 'm00-q10',
    q: 'Which of these belongs in your Module 0 radio box?',
    options: [
      'Your car key fob, to observe its rolling code',
      'A shared building gate remote you have access to',
      'A neighbour\'s doorbell button, with their verbal okay',
      'A wireless doorbell button you own',
    ],
    answer: 3,
    why: 'The course uses fixed-code devices you own. Car, gate, garage and alarm remotes are tied to systems others rely on and stay out of the labs; rolling codes are taught in simulation.',
  },
];

export default questions;
