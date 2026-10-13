/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm02-q01',
    q: 'What is modulation?',
    options: [
      'The frequency the carrier sits on',
      'The length of antenna the transmitter needs for its carrier, usually a quarter wavelength',
      'The deliberate change to a carrier that carries the bits',
      'The file format a capture is saved in',
    ],
    answer: 2,
    why: 'A bare carrier carries nothing. Modulation changes its strength (AM) or its frequency (FM) in a pattern the receiver reads back as bits.',
  },
  {
    id: 'm02-q02',
    q: 'An OOK remote sends a 0. What is its transmitter doing?',
    options: [
      'Its power amplifier is off, so nothing is transmitted',
      'It transmits slightly below the centre frequency, the same way a 2-FSK remote marks a 0',
      'It transmits at half power',
      'It transmits on a second channel',
    ],
    answer: 0,
    why: 'On-off keying turns the amplifier on for a 1 and off for a 0. A slightly lower frequency for a 0 is how 2-FSK works.',
  },
  {
    id: 'm02-q03',
    q: 'In 2-FSK as the CC1101 implements it, how is a 1 told apart from a 0?',
    options: [
      'A 1 is louder than a 0',
      'A 1 is a longer burst than a 0, and the receiver measures each burst against the preamble',
      'A 1 is sent on a different antenna',
      'A 1 sits above the centre frequency by the deviation, a 0 below it',
    ],
    answer: 3,
    why: 'The carrier never switches off in 2-FSK. The datasheet codes a 1 as plus the deviation and a 0 as minus the deviation from centre.',
  },
  {
    id: 'm02-q04',
    q: 'What does the 650 in AM650 describe?',
    options: [
      'The carrier frequency in MHz',
      'The receive filter width, about 650 kHz',
      'The transmit power in milliwatts',
      'The number of bits per second',
    ],
    answer: 1,
    why: 'For the AM presets the number is the receive filter bandwidth in kHz. AM650 listens to a 650 kHz slice of spectrum, AM270 to about 270 kHz.',
  },
  {
    id: 'm02-q05',
    q: 'What does the 476 in FM476 describe?',
    options: [
      'A 476 kHz receive filter, which is wide enough to catch remotes that drift with temperature',
      'A 476 MHz carrier',
      'A deviation of about 47.6 kHz, with a 270.8 kHz receive filter',
      'A signal strength of -47.6 dBm',
    ],
    answer: 2,
    why: 'For FM presets the number is the deviation with the decimal point dropped. FM476 and FM238 both use the same 270.8 kHz filter.',
  },
  {
    id: 'm02-q06',
    q: 'Your remote decodes on AM650 and shows nothing on FM238 at the same frequency. What is the best explanation?',
    options: [
      'It uses OOK, and an FSK detector looks for two tones that are not there',
      'The remote has a flat battery',
      'The frequency must be wrong',
      'FM238 has a narrower filter than the remote needs, so its signal is clipped before it can be decoded',
    ],
    answer: 0,
    why: 'The frequency was already right, because AM650 decoded it. Only the modulation changed, and an OOK signal has no frequency shift for an FSK detector to read.',
  },
  {
    id: 'm02-q07',
    q: 'An OOK remote decodes on AM650 but the list fills with noisy extra entries. What is a sensible next try?',
    options: [
      'Switch to FM476',
      'Turn Hopping on',
      'Switch to Read RAW, which ignores the preset',
      'Stay at the same frequency and try AM270, a narrower filter',
    ],
    answer: 3,
    why: 'AM270 keeps the OOK detector and narrows the filter from 650 to 270.8 kHz, so less noise gets in.',
  },
  {
    id: 'm02-q08',
    q: 'A remote of yours stays silent in Read on all presets at the frequency the Analyzer showed. Which conclusion is NOT supported?',
    options: [
      'The remote may be too far away or its battery weak',
      'The remote must use rolling codes',
      'Its protocol may not be one the firmware can name',
      'The frequency is worth checking again',
    ],
    answer: 1,
    why: "Read decodes many rolling-code remotes; Flipper's vendor table lists them as decodable with saving disabled. Silence points to distance, frequency or an unknown protocol.",
  },
  {
    id: 'm02-q09',
    q: 'Does Read RAW avoid the need to pick the right modulation?',
    options: [
      'Yes, it records the raw spectrum like an SDR',
      'Yes, it tries every preset in turn',
      'No, it demodulates with the preset set in Config',
      'No, it only works with FM presets',
    ],
    answer: 2,
    why: "Flipper's docs say the Flipper is not an SDR and that Read RAW demodulates according to the modulation settings. A wrong preset gives a wrong recording.",
  },
  {
    id: 'm02-q10',
    q: 'After AM650 decodes your remote, why switch to an FM preset and press again?',
    options: [
      'It is a control: the signal should vanish, showing the result depends on the preset and not on chance',
      'FM presets give a cleaner, error-checked decode of the same remote, so the saved file is more reliable later',
      'The Flipper needs both presets to save a file',
      'It raises the transmit power for the next press',
    ],
    answer: 0,
    why: 'A control that fails on purpose shows your positive result was caused by the setting you changed. Switching back should bring the signal back.',
  },
];

export default questions;
