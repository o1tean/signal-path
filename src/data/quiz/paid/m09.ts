/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm09-q01',
    q: 'Read shows nothing for your own remote. The Frequency Analyzer also shows nothing, even with the remote held against the left side of the Flipper and the button held down. What is the most useful conclusion?',
    options: [
      'The protocol is unknown, so switch to Read RAW',
      'It is a rolling code, so stop',
      'The problem is upstream of decoding: distance, the remote\'s battery, or a frequency far from the analyzer\'s list',
      'The preset is wrong, so try FM476',
    ],
    answer: 2,
    why: 'Read RAW, presets and protocol names all come after a signal reaches the radio. A blank analyzer means you have not proved that yet, so fix signal and frequency first.',
  },
  {
    id: 'm09-q02',
    q: 'The analyzer shows 433.92 MHz only while you hold the button. Read at 433.92 MHz on AM650 stays blank. What is the best single next change?',
    options: [
      'Keep the frequency and step the preset: AM270, then FM476, then FM238',
      'Turn on Hopping so Read searches the other frequencies while you keep pressing the remote',
      'Format the microSD card',
      'Change the frequency to 315 MHz and keep AM650',
    ],
    answer: 0,
    why: 'The press-and-release test already proved the frequency. Changing only the preset tests the modulation family, the next box in the decode tree.',
  },
  {
    id: 'm09-q03',
    q: 'The analyzer sees your remote, all four presets in Read stay silent, but Read RAW on AM650 records a clean burst on every press. What does that mean?',
    options: [
      'The remote is faulty',
      'The Flipper\'s radio is damaged, so it records bursts but can no longer decode any protocol',
      'It must be a rolling code',
      'The signal is fine; the firmware has no decoder for this protocol',
    ],
    answer: 3,
    why: 'RAW records demodulated pulses whether or not a decoder exists. Clean bursts that match your presses prove the radio side works, so the gap is in the protocol list.',
  },
  {
    id: 'm09-q04',
    q: 'Read names "Nice FloR-S", the Cnt field rises on every press, and there is no Save option. What is going on?',
    options: [
      'The capture is partial; press again from closer so Read sees the whole code word and offers Save',
      'It is a rolling code; official firmware decodes it but disables saving by design',
      'The SD card is full',
      'The preset is wrong for this remote',
    ],
    answer: 1,
    why: 'Flipper lists Nice FloR-S as a dynamic protocol: it decodes, and saving is disabled for security reasons. The rising counter is the rolling code doing its job.',
  },
  {
    id: 'm09-q05',
    q: 'With Hopping on, Read sometimes misses a short press from your own 433.92 MHz remote. Why?',
    options: [
      'Hopping changes the preset on every step',
      'Hopping lowers the receive sensitivity',
      'Hopping steps through six frequencies and only stops when a signal crosses the threshold, so a burst sent while it is elsewhere is missed',
      'Hopping only covers 868 MHz',
    ],
    answer: 2,
    why: 'Flipper\'s guide warns that signals sent mid-switch can be missed. For diagnosis, turn Hopping off and fix the frequency you measured.',
  },
  {
    id: 'm09-q06',
    q: 'The analyzer\'s number changes now and then while you are not pressing anything. What is the likely cause?',
    options: [
      'Another transmitter nearby is crossing the analyzer\'s threshold',
      'Your remote is transmitting on its own at intervals, which a weak battery can cause',
      'The firmware is corrupt',
      'NFC is interfering with the Sub-GHz radio',
    ],
    answer: 0,
    why: 'The analyzer reports the loudest signal above about −93 dBm, whoever sent it. Trust only readings that start and stop with your own button.',
  },
  {
    id: 'm09-q07',
    q: 'You edited a capture on your computer and copied it back, but it does not appear in Sub-GHz → Saved. What is the most likely reason?',
    options: [
      'The Key line has an odd number of bytes, so the Saved list skips the file without an error',
      'The file uses a RAW protocol',
      'The card is formatted exFAT',
      'The file ends in .sub.txt or is not inside the subghz folder',
    ],
    answer: 3,
    why: 'Saved only lists files ending in .sub inside the subghz folder. A wrong extension or location hides the file before any content check runs.',
  },
  {
    id: 'm09-q08',
    q: 'Opening a saved file shows "Cannot parse file". Which edit to a working Princeton file would cause exactly that message?',
    options: [
      'Changing Bit: 24 to Bit: 25',
      'Changing Version: 1 to Version: 2',
      'Renaming the file from door.sub to bell.sub',
      'Changing the Key to another valid 24-bit value',
    ],
    answer: 1,
    why: 'Header, frequency, preset and protocol name failures all give "Cannot parse file". A wrong bit count passes those and fails at the protocol fields with "Error in protocol parameters description".',
  },
  {
    id: 'm09-q09',
    q: 'Your 128 GB microSD card is formatted exFAT and the Flipper does not detect it. What should you do first?',
    options: [
      'Reformat it to FAT32 on a computer, because the Flipper needs FAT32 and cards no larger than 32 GB',
      'Buy a card of 32 GB or less',
      'Re-seat the card and clean the slot; exFAT and 128 GB are both supported',
      'Reinstall the firmware',
    ],
    answer: 2,
    why: 'Flipper supports FAT12, FAT16, FAT32 and exFAT on cards up to 256 GB. A loose card or dusty slot is the cheaper suspect, then a card without SPI support.',
  },
  {
    id: 'm09-q10',
    q: 'A sensor you own transmits at 330 MHz, inside the radio\'s 300–348 MHz band, but the analyzer never shows it correctly. Why, and what can you do on official firmware?',
    options: [
      '330 MHz is outside the CC1101\'s range; nothing can be done',
      'The analyzer only measures its 17 listed frequencies and ±300 kHz around the strongest; add a Frequency line in setting_user',
      'The analyzer needs FM presets for that band; switch Read to FM476',
      'The sensor is a rolling code; stop',
    ],
    answer: 1,
    why: 'The nearest listed frequencies are 318 and 390 MHz, too far for the fine pass to reach 330 MHz. Frequencies added in subghz/assets/setting_user feed the analyzer, Read and Read RAW.',
  },
];

export default questions;
