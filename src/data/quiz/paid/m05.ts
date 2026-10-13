/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm05-q01',
    q: 'Read leaves your own remote unnamed, but the Frequency Analyzer shows a clear burst at 433.92 MHz. What do you do before you press REC in Read RAW?',
    options: [
      'Nothing. Read RAW finds the frequency and the modulation itself, because it records everything',
      'Wait for the Flipper to name the protocol, then press REC so the file gets a proper name',
      'Set the frequency and the modulation in Config first, because the Flipper is not an SDR',
      'Hold the remote against the Flipper, because Read RAW only works within a few centimetres',
    ],
    answer: 2,
    why: 'Read RAW records what the radio demodulates. The CC1101 only demodulates at the frequency and modulation you set, so a wrong setting records noise or nothing. It is not a software-defined radio that listens to everything at once.',
  },
  {
    id: 'm05-q02',
    q: 'A RAW file contains `RAW_Data: 340 -420 1020 -380`. What does the -420 mean?',
    options: [
      'A gap of 420 microseconds with the carrier off, between two pulses',
      'A pulse of 420 microseconds that was recorded weaker than the others',
      'A frequency offset of 420 Hz below the value on the Frequency line',
      'The bit value 0, repeated 420 times by the encoder',
    ],
    answer: 0,
    why: 'RAW_Data holds signed, non-zero durations in microseconds that alternate in sign. The first value is positive (demodulator output high, carrier on with an AM preset) and the sign flips for every low stretch (carrier off). Nothing in the line is a frequency, a power level or a decoded bit.',
  },
  {
    id: 'm05-q03',
    q: 'Your own fixed-code doorbell chimes every time you emulate the saved key. A rolling-code receiver behaves differently because...',
    options: [
      'it listens on a second frequency that a saved file does not include',
      'it only responds when the remote is closer than one metre to the receiver, which a replay from a Flipper rarely is',
      'it drops every message that arrives more than once within a second',
      'it expects a counter that moves forward, so a message that was already accepted is refused',
    ],
    answer: 3,
    why: 'A fixed code is identical on every press, so a faithful copy keeps working. A rolling code carries a counter inside an encrypted block, and the receiver only accepts values ahead of the last one it accepted. Distance and frequency are not part of the rule.',
  },
  {
    id: 'm05-q04',
    q: 'You press a Nice FloR-S remote near your Flipper in Read. According to the official supported-vendors page, what happens?',
    options: [
      'The remote is decoded and saved, and you can replay it once from Saved',
      'The remote is decoded, but saving is disabled for security reasons',
      'The remote is not recognised, so you have to switch to Read RAW and save it there',
      'The Flipper shows the encryption key so you can calculate the next code',
    ],
    answer: 1,
    why: 'Flipper documents Nice FloR-S as a dynamic (rolling) protocol: it can be decoded, and the save function is disabled. Switching to Read RAW is not a workaround for this question, and the page does not list any key display.',
  },
  {
    id: 'm05-q05',
    q: 'A receiver last accepted counter 20 and its forward window is 16 values. Which captured counter would it accept?',
    options: [
      '25, because it is ahead of 20 and inside the window',
      '20, because it matches the last accepted value exactly',
      '17, because it is close to the last accepted value',
      '60, because the receiver always catches up to a higher counter',
    ],
    answer: 0,
    why: 'The receiver accepts values ahead of the last accepted one and inside the window, so 21 to 36 here. 20 and 17 are used or behind it. 60 is beyond the window and would need a resynchronisation, which usually takes more than one press.',
  },
  {
    id: 'm05-q06',
    q: 'A capture of press 41 exists. The receiver later accepted press 42 from the real remote. Why can the capture of press 41 no longer be reused?',
    options: [
      'Its frequency drifted while the file sat on the SD card, so it no longer matches the band the receiver listens on',
      'Its cipher key expired when the real remote sent the next message',
      'Its waveform was recorded without the sign bits, so it plays back inverted',
      'Its counter is now behind the receiver\'s last accepted value, so the receiver treats it as already used',
    ],
    answer: 3,
    why: 'The rule is about order, not about the file. Once 42 is accepted, 41 is behind the stored counter and is refused. The file is unchanged and the cipher key does not expire, which is why the question has nothing to try on your own gate.',
  },
  {
    id: 'm05-q07',
    q: 'Why do rolling codes exist?',
    options: [
      'They extend the transmit range of a small battery-powered remote',
      'They shrink the message so the remote can run for years on one cell',
      'They let one remote work with many receivers without any pairing step',
      'They make a simple record-and-replay of one press unreliable as an attack',
    ],
    answer: 3,
    why: 'A fixed code can be copied once and replayed forever. A counter plus a cipher makes each press normally single-use, so a recording stops being useful. Range, battery life and pairing are separate design choices.',
  },
  {
    id: 'm05-q08',
    q: 'Which of these is the wrong target for Read RAW, according to the Flipper documentation?',
    options: [
      'A fixed-code doorbell you own, to compare its RAW file with the decoded one',
      'Your car key fob, because replaying a capture can de-sync the original key',
      'A garden light remote you own, when Read cannot name its protocol',
      'The simulator\'s sample file, to practise reading the sign pattern',
    ],
    answer: 1,
    why: 'The Read RAW page warns against using it with a car key fob. A modern fob sends a different code each time, and replaying a captured one can de-sync the original key. The other three are your own simple devices or a sample file.',
  },
  {
    id: 'm05-q09',
    q: 'While Read RAW records, a tall block of bars rises across the middle of the screen. What are those bars?',
    options: [
      'The demodulated pulses and gaps, drawn at microsecond scale',
      'The bits the Flipper has decoded so far, one bar per bit',
      'Received signal strength (RSSI) over time, drawn against your threshold line',
      'The battery level falling while the radio is busy',
    ],
    answer: 2,
    why: 'In firmware 1.4.3 the Read RAW screen plots one bar per RSSI reading, labelled RSSI. Strong bars show that something loud arrived, not that the preset made sense of it. The timings exist only in the saved file.',
  },
  {
    id: 'm05-q10',
    q: 'An HCS301 remote sends a 66-bit code word on every press. Which part is identical on two presses of the same button?',
    options: [
      'The 16-bit sync counter, because it is only sent once at pairing',
      'The 28-bit serial number, because it travels in the clear in the fixed portion',
      'The 32-bit encrypted block, because the key does not change',
      'None of it, because every one of the 66 bits is encrypted',
    ],
    answer: 1,
    why: 'The datasheet splits the word into 34 fixed bits (serial number, buttons, status) and 32 encrypted bits (counter, discrimination, buttons). The counter changes every press, so the encrypted block changes completely. The serial number stays the same and lets the receiver pick the right key.',
  },
];

export default questions;
