/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm04-q01',
    q: 'You choose Emulate on a saved Princeton key file and press Send. What does the Flipper transmit?',
    options: [
      'A sound recording of the original press',
      'Nothing; Emulate only displays the key',
      'Pulses rebuilt from the file\'s Protocol, Bit, Key and TE, at its Frequency and Preset',
      'A request asking the receiver for its current code, which it answers before the Flipper sends a matching one',
    ],
    answer: 2,
    why: 'For a decoded key file the protocol encoder regenerates the on/off timings from the text fields, and the radio sends them at the saved frequency and preset. Only RAW (and BinRAW) files replay captured data.',
  },
  {
    id: 'm04-q02',
    q: 'In official firmware, which path sends a saved signal?',
    options: [
      'Sub-GHz → Saved → your file → Emulate → Send',
      'Sub-GHz → Read → Config → Send',
      'Sub-GHz → Read RAW → Saved → Send',
      'Sub-GHz → Saved → your file → Send, with no Emulate step',
    ],
    answer: 0,
    why: 'Flipper\'s documentation: select the signal in Saved, press Emulate, then press Send. Transmission starts when you press OK and stops when you release it.',
  },
  {
    id: 'm04-q03',
    q: 'A Princeton file has TE: 400. In firmware 1.4.3, how is a single 1 bit sent?',
    options: [
      'Carrier on 400 µs, off 1,200 µs',
      'Carrier on 800 µs, off 800 µs',
      'Carrier on 400 µs, off 400 µs, then on 800 µs',
      'Carrier on 1,200 µs, off 400 µs',
    ],
    answer: 3,
    why: 'The Princeton encoder sends a 1 as 3 TE on and 1 TE off, and a 0 as 1 TE on and 3 TE off. The receiver reads where the falling edge sits inside each 4 TE bit.',
  },
  {
    id: 'm04-q04',
    q: 'One Princeton frame is 24 bits of 4 TE each, a 1 TE stop pulse and a 30 TE guard. At TE 400 µs, how long is one frame on the air?',
    options: [
      'About 10 ms',
      'About 50.8 ms',
      'About 508 ms',
      'About 5 s',
    ],
    answer: 1,
    why: '24 × 4 + 1 + 30 = 127 TE, and 127 × 400 µs = 50.8 ms. Emulate repeats the frame while you hold OK, up to 200 times (about 10 s), so tap rather than hold.',
  },
  {
    id: 'm04-q05',
    q: 'Why does a straight replay keep working on your own fixed-code doorbell?',
    options: [
      'The same code is valid on every press, so the receiver cannot tell a copy from the original',
      'The Flipper derives a new key each time it sends',
      'Receivers ignore the preset and accept any frequency',
      'The receiver learns the Flipper as a second remote after the first press and stores it in its memory',
    ],
    answer: 0,
    why: 'A fixed code never changes, so a faithful copy matches the original on frequency, modulation, bits and timing. That convenience is also why fixed codes are weak.',
  },
  {
    id: 'm04-q06',
    q: 'In the Rolling Code Sim the receiver has already accepted Cnt 7. You replay a capture of Cnt 7. What happens?',
    options: [
      'Accepted, because the code was valid once',
      'Accepted after a second press, as a resync',
      'Rejected, because the counter is not ahead of the stored value',
      'The receiver resets its counter to 7',
    ],
    answer: 2,
    why: 'A rolling-code receiver only accepts counters ahead of the last one it stored, within a window (16 codes in Microchip\'s HCS301 example). Replaying an old code never moves the counter back.',
  },
  {
    id: 'm04-q07',
    q: 'Your replay chimes your doorbell at 1 m but not from the next room, where the real remote still works. What should you do first?',
    options: [
      'Switch to an FM preset',
      'Conclude the doorbell uses a rolling code, since a rolling receiver ignores replays sent from further away',
      'Re-capture the signal as RAW',
      'Move closer, clear the line of sight and rotate the Flipper',
    ],
    answer: 3,
    why: 'The message is identical. The Flipper\'s small antenna, the wall and the orientation are the likely limit. Range and orientation come before theories about the file. Press the real remote from the same spot to rule out a dead spot.',
  },
  {
    id: 'm04-q08',
    q: 'Official firmware shows "Transmission is Blocked!" for a file. What does that tell you?',
    options: [
      'The file is corrupt',
      'The frequency is outside your region\'s firmware transmit list',
      'The target device uses a rolling code',
      'The battery is too low to transmit',
    ],
    answer: 1,
    why: 'The firmware checks each transmit frequency against the regional list set during an update. Being inside that list is still not a legal permission on its own.',
  },
  {
    id: 'm04-q09',
    q: 'Under ANCOM RO-IR SRD-01-17b, what applies to a generic short-range device at 433.05–434.79 MHz?',
    options: [
      '10 mW e.r.p. and a duty cycle of at most 10%',
      '25 mW e.r.p. and a duty cycle of at most 1%',
      '1 mW e.r.p. and no other rule, whatever the device is',
      '10 mW e.r.p. and a duty cycle of at most 100%',
    ],
    answer: 0,
    why: 'Interface 17b sets 10 mW e.r.p. and ≤10% duty cycle; the separate interface 17a allows 1 mW e.r.p. Owning the transmitter does not exempt you from either.',
  },
  {
    id: 'm04-q10',
    q: 'A fork lets your Flipper transmit on frequencies outside the official regional list. What does that change?',
    options: [
      'It makes those frequencies legal where you are, because the firmware now reports them as allowed in your region',
      'It raises the transmit power',
      'Only what the device can do; the rules where you live still decide what you may transmit',
      'It removes the need to own the target device',
    ],
    answer: 2,
    why: 'Momentum\'s README lists extended ranges such as 378–481 MHz. A firmware capability is not a licence, so this course keeps the official region list.',
  },
];

export default questions;
