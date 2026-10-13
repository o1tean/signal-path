/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm03-q01',
    q: 'In a saved .sub key file, what does the `Protocol:` line tell you?',
    options: [
      'The modulation and receive filter the radio used, such as AM650, so the file can be read back',
      'The frequency the file will transmit on',
      'The rule that turns the key and timing back into pulses, such as Princeton',
      'The firmware version that saved the file',
    ],
    answer: 2,
    why: 'Protocol names the decoding rule Flipper matched. Modulation and filter belong to the Preset line, and the frequency has its own line.',
  },
  {
    id: 'm03-q02',
    q: 'A .sub file contains `Bit: 24`. How many different code words can a 24-bit message hold?',
    options: ['16,777,216 (2 to the power 24)', '24', '576 (24 times 24)', 'About 240 million'],
    answer: 0,
    why: 'Each bit doubles the count, so 24 bits give 2^24 = 16,777,216 values. Counting values says nothing about whether a fixed code can be copied.',
  },
  {
    id: 'm03-q03',
    q: 'The line `TE: 400` in a decoded Princeton file means...',
    options: [
      'the remote sends 400 bits per second, which sets how long each press lasts on the air',
      'the transmitter power is 400 microwatts',
      'the capture lasted 400 milliseconds',
      'the base time unit is 400 microseconds, and every pulse is a multiple of it',
    ],
    answer: 3,
    why: 'TE is the quantization interval in microseconds. A Princeton bit lasts 4 TE, so at TE 400 one bit takes 1,600 microseconds.',
  },
  {
    id: 'm03-q04',
    q: 'At TE 400, how long is the carrier on for a Princeton 1 bit?',
    options: ['400 microseconds', '1,200 microseconds', '1,600 microseconds', '4 milliseconds'],
    answer: 1,
    why: 'A 1 is on for 3 TE and off for 1 TE. 3 x 400 = 1,200 microseconds on, then 400 off, which makes 4 TE or 1,600 microseconds per bit.',
  },
  {
    id: 'm03-q05',
    q: 'A saved file begins `Filetype: Flipper SubGhz RAW File` and says `Protocol: RAW`. What does that tell you?',
    options: [
      'Flipper decoded a Princeton key and stored it twice',
      'The file is corrupt',
      'Flipper stored pulse timings without decoding a key',
      'The remote uses a rolling code',
    ],
    answer: 2,
    why: 'Key files start with `Flipper SubGhz Key File` and hold a decoded protocol. A RAW file holds timings only. That does not tell you whether the code rolls.',
  },
  {
    id: 'm03-q06',
    q: 'Which statement about the Preset and Protocol lines is right?',
    options: [
      'Preset decides whether clean pulses are heard; Protocol decides what the pulses mean',
      'Preset names the remote model the file came from; Protocol names the frequency it was saved on',
      'Protocol sets the filter width; Preset sets the bit count',
      'They are two names for the same setting',
    ],
    answer: 0,
    why: 'With the wrong preset there are no clean pulses to decode. With the right preset and an unknown protocol you get pulses but no name.',
  },
  {
    id: 'm03-q07',
    q: 'You press one remote four times. Read shows a different Key each time and a Cnt value that climbs. What is it most likely?',
    options: [
      'A fixed code with a noisy receiver',
      'A Princeton remote on the wrong preset',
      'A decoding bug in the firmware',
      'A rolling code, so this is a case for Module 5',
    ],
    answer: 3,
    why: 'A fixed code repeats exactly. A changing Key with a counter that steps up points to a rolling code.',
  },
  {
    id: 'm03-q08',
    q: 'Flipper decodes a Princeton key and shows `TE: 380`. Your notes from another remote with the same chip say `TE: 410`. What does that tell you?',
    options: [
      'One of the two captures is corrupt and should be deleted',
      'Nothing is wrong: TE is measured from each remote, and both sit inside the range Princeton accepts',
      'The two remotes must use different protocols',
      'The remote with TE 410 is transmitting on a higher frequency, because a longer time unit means a higher carrier',
    ],
    answer: 1,
    why: 'TE is averaged from the pulses Flipper actually heard. Firmware 1.4.3 expects a Princeton short pulse near 390 microseconds and accepts a spread around it, so small differences between remotes are normal.',
  },
  {
    id: 'm03-q09',
    q: "On Flipper's supported-vendors page, which statement about the Nice family is correct?",
    options: [
      'Nice FLO is a fixed-code protocol Flipper can save; Nice FLOR-S is a rolling-code one it will not save',
      'Both are fixed codes from the same vendor, so Flipper saves and emulates either one the way it saves Princeton',
      'Nice FLO is rolling; Nice FLOR-S is fixed',
      'Neither protocol is decoded by Flipper',
    ],
    answer: 0,
    why: 'Nice FLO is listed as static, with 12 or 24 bits. Nice FLOR-S is listed as dynamic: Flipper decodes it but disables saving.',
  },
  {
    id: 'm03-q10',
    q: 'A 24-bit fixed code has about 16.8 million values. Why can it still be copied by anyone who records one press?',
    options: [
      'The key is encrypted with a weak cipher',
      'The receiver accepts any 24-bit value',
      'The message never changes, so one clean capture holds everything needed, with no guessing',
      '24 bits is too short for a radio to send reliably',
    ],
    answer: 2,
    why: 'The number of possible values measures guessing, not copying. A fixed code sends the same message every press, so one recording is a complete copy. Rolling codes close that gap.',
  },
];

export default questions;
