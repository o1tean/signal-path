/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm14-q01',
    q: 'A reader opens for a DS1990 whose 8 ROM bytes are on its list. Does that prove the person is authorised?',
    options: [
      'Yes, because the serial number is unique to one chip',
      'Yes, as long as the CRC byte is valid',
      'No. The bytes name the key, and any copy presents the same bytes',
      'No, because the DS1990 encrypts its ROM with a reader key',
    ],
    answer: 2,
    why: 'An identifier names a device. The DS1990 sends the same eight bytes to every reader, so a reader that checks only those bytes accepts an emulation or a written blank just as readily.',
  },
  {
    id: 'm14-q02',
    q: 'What should be in place before you register a learning device as a second factor?',
    options: [
      'An independent sign-in method that you have tested',
      'A backup copy of the Flipper’s microSD card on another Flipper',
      'Your other security keys removed from the account',
      'qFlipper running, so the registration is synced',
    ],
    answer: 0,
    why: 'A wiped or swapped card ends the registration, so the account needs a tested way in that does not depend on the Flipper. A card copy does not help: the U2F files only work on the Flipper that made them.',
  },
  {
    id: 'm14-q03',
    q: 'Do all iButtons hold the same kind of data?',
    options: [
      'Yes, every iButton holds one 8-byte serial number',
      'Yes, they are all 13.56 MHz NFC tags in a steel can',
      'No, but every type holds a cryptographic key that the reader checks before it reads the ID',
      'No. A DS1990 holds only an ID; DS1992, DS1996 and DS1971 also hold memory',
    ],
    answer: 3,
    why: 'Flipper’s read guide lists UID only for DS1990, Cyfral and Metakom, and UID plus memory for DS1992, DS1996 and DS1971. "iButton" is a form factor and protocol family.',
  },
  {
    id: 'm14-q04',
    q: 'A DS1990 reads as 01 4E 2A 9C 10 00 00 A7. What is the last byte, A7?',
    options: [
      'The family code that says the chip is a DS1990',
      'A CRC-8 of the first seven bytes, used to catch a bad read',
      'A secret that proves the key is genuine',
      'A counter that goes up each time the key is read, so a reader can spot a copied key',
    ],
    answer: 1,
    why: 'Byte 0 is the family code (01) and bytes 1 to 6 are the serial number. The CRC is public arithmetic: it catches a wobbly contact, and any copy carries a valid one too.',
  },
  {
    id: 'm14-q05',
    q: 'How does the Flipper exchange data with a Dallas iButton?',
    options: [
      'Over a 125 kHz field, like an EM4100 card, at a few centimetres',
      'Over Bluetooth Low Energy, after pairing',
      'By contact, over 1-Wire: one data line plus ground',
      'Over a 13.56 MHz field, like NFC',
    ],
    answer: 2,
    why: 'The key’s lid touches the data pin and its rim touches ground. Nothing is radiated, so the key has to touch the pad.',
  },
  {
    id: 'm14-q06',
    q: 'What does the signature in a U2F sign-in response cover?',
    options: [
      'Your password and username, hashed together',
      'The app ID hash, the user-presence byte, the counter and the challenge',
      'The key handle and the attestation certificate, which together identify your Flipper to the site',
      'The Flipper’s serial number and the time of day',
    ],
    answer: 1,
    why: 'The FIDO raw message format lists those four fields in that order. The fresh challenge stops replay; the app ID hash ties the answer to one site.',
  },
  {
    id: 'm14-q07',
    q: 'You move your Flipper’s microSD card into a friend’s Flipper. What happens to your U2F registrations there?',
    options: [
      'They work, because the keys are on the card',
      'They fail, because the U2F files are encrypted with a key unique to your Flipper',
      'They work after you open qFlipper once',
      'They work, but only for the site registered most recently',
    ],
    answer: 1,
    why: 'The firmware encrypts key.u2f and cnt.u2f with a key unique to each Flipper’s processor, and Flipper’s guide says another device cannot sign in with them.',
  },
  {
    id: 'm14-q08',
    q: 'Someone records every byte of your U2F sign-in on Monday. Why does replaying it on Tuesday fail?',
    options: [
      'Tuesday’s challenge is new, and the recorded signature covers Monday’s',
      'The USB cable encrypts the traffic with a session key',
      'The Flipper wipes its keys after each sign-in',
      'It works, unless the site also checks the password',
    ],
    answer: 0,
    why: 'The site sends a fresh random challenge each time and checks the signature over it. Only the holder of the private key can sign the new one.',
  },
  {
    id: 'm14-q09',
    q: 'What does pressing OK on the Flipper during a U2F sign-in prove to the site?',
    options: [
      'That the Flipper has verified your fingerprint or PIN',
      'That the account’s password was typed on the Flipper',
      'That someone physically present approved this request',
      'That the Flipper is a certified hardware security key',
    ],
    answer: 2,
    why: 'U2F tests user presence only. It has no user verification, so your password remains the other factor.',
  },
  {
    id: 'm14-q10',
    q: 'Can the Flipper’s U2F app on firmware 1.4.3 store a passkey?',
    options: [
      'Yes, once you enable passkeys in Settings → Bluetooth on the Flipper',
      'Yes, but only on Android phones',
      'Only when qFlipper stays connected',
      'No. It handles U2F messages only and has no CTAP2 support',
    ],
    answer: 3,
    why: 'The firmware answers U2F register, authenticate and version (U2F_V2) and advertises no CBOR capability. Passkeys need CTAP2.',
  },
];

export default questions;
