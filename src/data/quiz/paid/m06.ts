/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm06-q01',
    q: 'Why does a 125 kHz fob couple to the reader through a coil instead of radiating like a Sub-GHz remote?',
    options: [
      'It only transmits while its battery is charged',
      'Walls block 125 kHz, so it has to stay close',
      'Its wavelength is about 2.4 km, far too long for any antenna that fits in a fob',
      'It shares the Sub-GHz antenna and borrows its range, so it couples only when that radio is switched off',
    ],
    answer: 2,
    why: 'λ = c / f gives 2,398 m at 125 kHz. A fob coil is a tiny fraction of that, so the system works through the magnetic near field between two coils.',
  },
  {
    id: 'm06-q02',
    q: 'A passive 125 kHz tag has no battery. How does it send its ID back to the reader?',
    options: [
      'It switches a load across its coil, changing how much energy it draws from the reader field',
      'It runs a small 125 kHz transmitter from a capacitor that was charged once at the factory and lasts for years',
      'It reflects the reader signal back at 433.92 MHz',
      'It answers on 13.56 MHz while the reader listens on 125 kHz',
    ],
    answer: 0,
    why: 'This is load modulation. The reader sees the small changes in its own coil and decodes them; the tag never transmits a signal of its own.',
  },
  {
    id: 'm06-q03',
    q: "On the axis of a 2 cm radius reader coil, a tag moves from 2 cm to 4 cm away. Using AN710's field equation, the field at the tag drops to about...",
    options: [
      'the same value, because the coil is tuned',
      'half the value at 2 cm',
      'a quarter of the value at 2 cm',
      'a hundredth of the value at 2 cm',
    ],
    answer: 2,
    why: 'Relative to the coil face the field is about 35% at 2 cm and 9% at 4 cm, so roughly a quarter. Further out the falloff approaches 1/r³, an eighth per doubling.',
  },
  {
    id: 'm06-q04',
    q: 'What is inside one EM4100 frame as the Flipper decodes it?',
    options: [
      '26 bits: two parity bits around a facility code and card number',
      '64 bits: a nine-1 header, 40 data bits in ten rows with row parity, four column parity bits and a stop bit',
      'a 128-bit block protected by a key',
      'a variable-length string set by the door controller',
    ],
    answer: 1,
    why: '9 + 10 × (4 + 1) + 4 + 1 = 64 bits. The 40 data bits are the tag ID, shown as 5 hex bytes.',
  },
  {
    id: 'm06-q05',
    q: 'After reading your EM4100 training tag the Flipper shows "FC: 069" and "Card: 26505 (RF/64)". Where does the FC value come from?',
    options: [
      'A facility field the building programs into every EM4100 tag when the door controller enrols it on site',
      'It proves the tag is really an HID card',
      'RF/64 means the tag runs at 64 kHz, and FC is its channel',
      'The Flipper splits the last three bytes of the flat 40-bit ID into FC and card for display',
    ],
    answer: 3,
    why: 'Firmware 1.4.3 prints the third byte as FC and the last two as Card. The EM4100 chip itself stores one 40-bit number with no facility field.',
  },
  {
    id: 'm06-q06',
    q: 'How is an HID H10301 card number laid out?',
    options: [
      'Even parity bit, 8-bit facility code, 16-bit card number, odd parity bit: 26 bits',
      'A 40-bit ID with row and column parity, read in ten rows of four bits after a nine-bit header',
      'A 7-byte UID followed by encrypted sectors',
      'A rolling counter and a serial number',
    ],
    answer: 0,
    why: 'HID documents H10301 as an open 26-bit format. The facility code tops out at 255 and the card number at 65,535.',
  },
  {
    id: 'm06-q07',
    q: 'Why does 125 kHz RFID → Read alternate between an ASK pass and a PSK pass?',
    options: [
      'ASK is faster, so it is tried twice as often',
      'The Flipper changes carrier frequency between passes',
      'Alternating avoids interfering with nearby NFC cards',
      'Some formats such as Indala 26 use PSK, which needs a different demodulator from EM4100 and the FSK formats',
    ],
    answer: 3,
    why: 'In firmware 1.4.3, EM4100 and H10301 are decoded in the ASK pass and Indala26 only in the PSK pass. Extra Actions (Read ASK or Read PSK) lets you force one of them.',
  },
  {
    id: 'm06-q08',
    q: 'What makes a T5577 blank useful in a training lab?',
    options: [
      'It is a read-only tag with a factory-fused ID, so every lab starts from the same known number it cannot change',
      'Its configuration block sets data rate and coding, so it can present formats such as EM4100 or H10301',
      'It is a 13.56 MHz card that also answers at 125 kHz',
      'It generates rolling codes',
    ],
    answer: 1,
    why: 'The ATA5577C datasheet lists RF/2 to RF/128 and Manchester, biphase, FSK, PSK and NRZ coding. Write only training IDs to blanks you own.',
  },
  {
    id: 'm06-q09',
    q: 'What is the practical difference between Emulate and Write?',
    options: [
      'Emulate presents the ID only while the Emulate screen is open; Write leaves it on a blank that keeps working afterwards',
      'Emulate needs a T5577; Write does not',
      'They do the same thing with different names',
      'Write only changes the file on the microSD card',
    ],
    answer: 0,
    why: 'Emulation stops when you press Back. A written T5577 is a physical credential until it is rewritten, which is why only training IDs go on blanks.',
  },
  {
    id: 'm06-q10',
    q: 'A card you own and suspect is 13.56 MHz never reads in the 125 kHz app, through several ASK and PSK passes, flat on the back. What should you try first?',
    options: [
      'Hold it further away so the field is gentler',
      'Open the NFC app; it may be a 13.56 MHz card',
      'Write a T5577 first and read that instead',
      'Change the Sub-GHz preset to FM476',
    ],
    answer: 1,
    why: "Flipper's reading guide suggests the NFC app when a card does not read at 125 kHz. Frequency is the first fork in any RFID question.",
  },
];

export default questions;
