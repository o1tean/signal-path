/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm07-q01',
    q: 'NFC cards and tags work at which frequency?',
    options: ['125 kHz', '13.56 MHz', '433.92 MHz', '2.4 GHz'],
    answer: 1,
    why: 'NFC is high frequency (HF) at 13.56 MHz, about 108 times above 125 kHz LF RFID and well below the Sub-GHz remote bands.',
  },
  {
    id: 'm07-q02',
    q: 'Why does a Flipper read an NFC card at a few centimetres and not across a room?',
    options: [
      'The firmware limits the reader to a few centimetres by law',
      'Cards only answer readers that know their UID',
      '13.56 MHz cannot travel through air beyond a few centimetres',
      'The card has no battery and couples through a magnetic near field that weakens steeply with distance',
    ],
    answer: 3,
    why: 'The card takes its power from the reader’s field and answers by loading it. At a few centimetres you are about a hundred times inside the 3.5 m near-field boundary, where the coupling falls off fast.',
  },
  {
    id: 'm07-q03',
    q: 'A passive type A card answers the reader by…',
    options: [
      'switching a load on its coil, so the reader sees its own field change on an 847.5 kHz subcarrier',
      'transmitting its own 13.56 MHz carrier from a small radio',
      'reflecting the reader’s signal back at a higher frequency',
      'waiting for the reader to cut its field, then sending a burst',
    ],
    answer: 0,
    why: 'This is load modulation: the card changes how much energy it draws, at 13.56 MHz ÷ 16 = 847.5 kHz, and the reader detects the dip. The card has no transmitter of its own.',
  },
  {
    id: 'm07-q04',
    q: 'Which statement about a type A card’s UID is correct?',
    options: [
      'It is encrypted with the card’s sector keys',
      'It proves the card is genuine',
      'Any reader receives it before a key is used, and some cards send a random one',
      'It can only be read by the reader that issued the card, because the card checks the reader\'s ID first',
    ],
    answer: 2,
    why: 'The UID is exchanged during anticollision, before any authentication. A 4-byte UID starting 08 is a Random ID, and magic cards let you set the UID, so it proves nothing on its own.',
  },
  {
    id: 'm07-q05',
    q: 'The Flipper shows SAK: 20 for a card. What does that tell you?',
    options: [
      'The card speaks ISO 14443-4, so applications such as DESFire or EMV come next',
      'It is a MIFARE Classic 1K',
      'It is an NTAG with open pages, because SAK 20 marks the NTAG family on a type A card',
      'The card is a 125 kHz fob',
    ],
    answer: 0,
    why: 'The 20 bit in the SAK flags ISO 14443-4 support. MIFARE Classic 1K sends 08 and Ultralight/NTAG send 00. NXP warns that SAK is only a first guess at the card type.',
  },
  {
    id: 'm07-q06',
    q: 'A MIFARE Classic read ends with Keys Found: 20/32 and Sectors Read: 10/16. What will emulating the saved file give a reader?',
    options: [
      'All 16 sectors, rebuilt from the UID',
      'Nothing, because partial reads cannot be saved',
      'All 16 sectors, since 20 keys are enough for a 1K',
      'Only the 10 sectors that were unlocked',
    ],
    answer: 3,
    why: 'Flipper emulates only the sectors it unlocked. If the real reader checks a locked sector, the copy fails.',
  },
  {
    id: 'm07-q07',
    q: 'A DESFire badge shows “Auth required to read apps!”. What can the Flipper emulate from it?',
    options: [
      'The full card, after a few minutes of dictionary attack',
      'Only the UID',
      'The applications, but not the files inside them',
      'Nothing at all, not even the UID',
    ],
    answer: 1,
    why: 'Flipper reads only unprotected DESFire applications and files, and emulation covers the UID only. The protected data stays behind AES-128 or 3DES keys.',
  },
  {
    id: 'm07-q08',
    q: 'You want to write a saved NTAG215 capture to a blank. Which blank will work?',
    options: [
      'Any 13.56 MHz card, including MIFARE Classic, since the Flipper rewrites the card type when it writes',
      'A T5577 from Module 6',
      'An unlocked NTAG215 with the default password and no lock bits set',
      'An NTAG213, because it is smaller',
    ],
    answer: 2,
    why: 'Flipper writes NTAG data only to the same type, with default password and PACK, AUTH0 disabled and zero lock bits. Lock bits are irreversible, so keep practice tags unlocked.',
  },
  {
    id: 'm07-q09',
    q: 'Why can an emulated copy of a contactless bank card never pay?',
    options: [
      'Each payment needs a one-time cryptogram computed with a key that never leaves the chip',
      'Terminals check that the card is made of plastic',
      'The Flipper cannot transmit at 13.56 MHz',
      'Bank cards use 125 kHz for payments',
    ],
    answer: 0,
    why: 'EMV contactless generates a fresh security code for every transaction. A copy of the public fields cannot compute one, so the issuer rejects it.',
  },
  {
    id: 'm07-q10',
    q: 'You read a card on official firmware 1.4.3 and see only UID, ATQA, SAK and ATS. Read with a fork, the same card shows a card number and expiry. What changed?',
    options: [
      'The fork broke the card’s encryption',
      'The fork added an EMV parser that asks the card for the public fields it gives any terminal',
      'The card was switched into an insecure test mode by the fork, which then read the fields it normally hides',
      'The fork read the card’s secret keys',
    ],
    answer: 1,
    why: 'Release 1.4.3 has no EMV reader, so a bank card appears as a generic ISO 14443-4 card. A fork’s parser requests the public payment records; the keys and PIN never leave the chip.',
  },
];

export default questions;
