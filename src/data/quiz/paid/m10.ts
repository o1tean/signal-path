/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm10-q01',
    q: 'You pick up an unknown remote you own. What is the sensible order of tools?',
    options: [
      'Read RAW first, then the Frequency Analyzer, then Read',
      'Read with Hopping on, then guess the preset from the protocol name',
      'Frequency Analyzer for the frequency, then Read with a preset sweep, then Read RAW if nothing decodes',
      'Read on every preset at 433.92 MHz, then the Frequency Analyzer to confirm',
    ],
    answer: 2,
    why: 'Fix the frequency first, then the preset, because Read needs both dials right. Read RAW uses the same preset, so it comes last, for protocols the firmware cannot name.',
  },
  {
    id: 'm10-q02',
    q: 'Read decodes a rolling-code remote you own and names a dynamic protocol, but there is no Save option. What does that tell you?',
    options: [
      'Official firmware decodes dynamic protocols but disables saving them on purpose',
      'The capture was incomplete and you should press again',
      'The SD card is full or missing',
      'The remote is on a frequency your region blocks, so the firmware hides the Save option for it',
    ],
    answer: 0,
    why: "Flipper's supported-vendors table calls these protocols encrypted (this course says dynamic) and says they can be decoded, but the save function is disabled for security reasons. Write the fields into your notebook instead.",
  },
  {
    id: 'm10-q03',
    q: 'Your doorbell is labelled 433.92 MHz. Over three presses the Frequency Analyzer shows 433.905, 433.918 and 433.912. What should your atlas say?',
    options: [
      'Three different doorbells are transmitting nearby',
      'The doorbell is faulty and drifts by more than its band allows',
      'The analyzer is broken, because it should show exactly 433.920',
      'One remote near 433.92 MHz; the analyzer resolves to a 20 kHz grid and smooths its readings',
    ],
    answer: 3,
    why: 'In firmware 1.4.3 the fine pass steps 20 kHz around the strongest list frequency and the result is averaged, so readings a few kHz apart are the same remote. Set Read to 433.92 MHz.',
  },
  {
    id: 'm10-q04',
    q: 'A 433.92 MHz remote decodes as Princeton 24-bit on AM650 and gives the same Key on every press. How do you record it?',
    options: [
      'A rolling-code FSK remote',
      'A 24-bit fixed-code OOK remote',
      'An unknown remote, because Princeton has no counter field',
      'A 125 kHz LF fob, because 24 bits is an RFID length',
    ],
    answer: 1,
    why: 'AM650 decoding means OOK, the repeated Key means a fixed code, and the bit count gives the length. Princeton is a static protocol in Flipper\'s vendor table.',
  },
  {
    id: 'm10-q05',
    q: 'You hold a remote right against the Flipper and the Frequency Analyzer stays blank. Which note is the most defensible?',
    options: [
      'The remote uses a rolling code, so the analyzer cannot see it',
      'Nothing was transmitted, so the remote is broken',
      'No peak above the threshold near the list frequencies; check the battery, then consider a frequency far from the list',
      'The remote must be FSK, which the analyzer ignores',
    ],
    answer: 2,
    why: 'The analyzer only scans near its 17 list frequencies and only reports signals above about −90 dBm (the docs say −90, the 1.4.3 source constant is −93). Code type and modulation do not hide a remote from it.',
  },
  {
    id: 'm10-q06',
    q: 'On a KeeLoq remote you own, Hop changes completely on each press while Fix stays the same. What is in Fix?',
    options: [
      'The 16-bit counter in plain text',
      'The manufacturer key',
      'The encrypted part of the code word, which only changes when you re-pair the remote',
      'The serial number and the button bits',
    ],
    answer: 3,
    why: "The HCS301 sends 32 encrypted bits, which change every press, and 34 fixed bits: the 28-bit serial, 4 button bits and 2 status bits. Flipper's Fix field holds the serial and button bits.",
  },
  {
    id: 'm10-q07',
    q: "A sensor you own sends a different payload every few minutes. Its protocol is not marked dynamic and you have no documentation. What goes in the code type column?",
    options: [
      'Unknown, payload changes',
      'Rolling, because the value changes',
      'Fixed, because the protocol is not marked dynamic',
      'Leave the row out until it decodes as a known remote',
    ],
    answer: 0,
    why: 'A changing payload can be ordinary data such as a temperature. Rolling needs evidence of a counter, from the vendor table or the documentation.',
  },
  {
    id: 'm10-q08',
    q: 'Your replay of a fixed-code doorbell in Module 4 worked every time from one recording. What exactly does that show?',
    options: [
      'That every doorbell of that model is insecure',
      'That your receiver accepts a repeated message, which is what a fixed code allows',
      'That the doorbell uses KeeLoq with a short counter',
      'That the replay would work on a neighbour\'s identical doorbell, because the code comes from the model',
    ],
    answer: 1,
    why: 'A test result describes your receiver under your conditions. Write what you observed and the reason; it says nothing about devices you did not test.',
  },
  {
    id: 'm10-q09',
    q: 'You hold your NTAG practice card against the Flipper in 125 kHz RFID → Read, and nothing happens. What does that control show?',
    options: [
      'The card is damaged',
      'The card is protected by a key',
      'The 125 kHz app and coil do not talk to 13.56 MHz cards, as expected',
      'You need to move the card further away, because 125 kHz coils saturate on a card held flat against them',
    ],
    answer: 2,
    why: 'LF and NFC are separate bands with separate coils and apps. A card that reads in one and is ignored by the other is the expected, healthy result.',
  },
  {
    id: 'm10-q10',
    q: "While you scan your own doorbell, the analyzer also picks up a neighbour's gate remote. What do you do with it?",
    options: [
      'Classify it too, as long as you only listen',
      'Leave it out of your atlas and do not investigate it',
      'Add it with an alias so nobody can identify it, then classify it like your own devices',
      'Record it as Unknown and test it later',
    ],
    answer: 1,
    why: 'The course works only on devices you own or have written permission to test. Listening to someone else\'s system is still outside that scope, so it does not go in your atlas.',
  },
];

export default questions;
