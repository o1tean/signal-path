/* Free questions. Safe to ship to the client. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'primer-q01',
    q: 'What does "RF" actually stand for, and what is it?',
    options: [
      'Radio Frequency: invisible electromagnetic waves that carry signals through the air',
      'Rapid Firmware, the code that boots the Flipper and loads every app from the microSD card',
      'Rolling Function, the way garage codes change',
      'Remote Field, the range of a transmitter',
    ],
    answer: 0,
    why: 'RF means radio frequency: waves that move information wirelessly, from remotes to Wi-Fi.',
  },
  {
    id: 'primer-q02',
    q: 'How do different wireless devices mostly avoid talking over each other?',
    options: [
      'By using different colors of light',
      'By taking turns, with the device that has the strongest battery always transmitting first',
      'By using different frequencies, like separate stations on a dial',
      'By using different file formats',
    ],
    answer: 2,
    why: 'Frequency is the channel. Devices on different frequencies simply do not hear each other.',
  },
  {
    id: 'primer-q03',
    q: 'In one sentence, what is modulation?',
    options: [
      'The physical length of the antenna',
      'The process of charging the battery',
      'The compression a receiver uses to shrink a saved capture before writing it to a file',
      'The way information is stamped onto a plain carrier wave',
    ],
    answer: 3,
    why: 'Modulation is how bits ride the carrier, by changing its amplitude (AM) or its frequency (FM).',
  },
  {
    id: 'primer-q04',
    q: 'A "protocol" in radio is best described as...',
    options: [
      'The frequency the device transmits on, written as a number of megahertz on its label',
      'The agreed language and structure both sides use to understand the bits',
      'The brand of the antenna',
      'The plastic case around the electronics',
    ],
    answer: 1,
    why: 'The protocol is the shared rulebook: how the bits are arranged and timed so a receiver can read them.',
  },
  {
    id: 'primer-q05',
    q: 'What is the key difference between a fixed code and a rolling code?',
    options: [
      'Fixed codes are a different color on screen',
      'Fixed codes are used by NFC cards, and rolling codes are used only by low-frequency RFID tags',
      'A fixed code sends the same value every press; a rolling code sends a new value each press',
      'Rolling codes are simply louder',
    ],
    answer: 2,
    why: 'Fixed codes repeat, so a recording replays forever. Rolling codes change each time, so old recordings stop working.',
  },
  {
    id: 'primer-q06',
    q: 'Why are "listening" to a signal and "transmitting" one treated so differently?',
    options: [
      'Listening is passive receiving; transmitting actively emits RF and is legally regulated',
      'They are actually identical operations',
      'Listening drains far more battery than transmitting, so the firmware limits how long you can listen',
      'Transmitting is always safe and never regulated',
    ],
    answer: 0,
    why: 'Reception can involve protected data. Transmission also requires compliant radio conditions; ownership alone is insufficient.',
  },
  {
    id: 'primer-q07',
    q: 'A remote works at 433.92 MHz. What does that number tell you?',
    options: [
      'The remote sends its data 433.92 times per second, which sets how fast each button press repeats',
      'Its radio field wiggles about 434 million times every second',
      'The signal travels 433 metres before fading',
      'The remote has used 433 codes so far',
    ],
    answer: 1,
    why: 'Frequency counts wiggles per second. One megahertz is a million cycles, so 433.92 MHz is roughly 434 million cycles every second.',
  },
  {
    id: 'primer-q08',
    q: 'Your Flipper is tuned to the right frequency but shows nothing while you press a remote that is clearly transmitting. What is the most likely cause?',
    options: [
      'The remote is using a rolling code',
      'The antenna is longer than the wavelength, so the signal cancels itself out before the receiver sees it',
      'The frequency analyzer only works indoors',
      'The preset expects a different style of modulation than the remote uses',
    ],
    answer: 3,
    why: 'Frequency picks the channel; modulation is the style of speaking on it. Listening for FM wobbles when the remote sends AM blinks means you hear nothing, so try another preset such as AM650.',
  },
  {
    id: 'primer-q09',
    q: 'You capture a rolling-code remote, then replay it twice. The first replay may work. Why does the second one fail?',
    options: [
      'The receiver has moved its counter past that message and treats it as stale',
      'The Flipper erases a capture after one transmission',
      'Rolling codes only work within one metre',
      'The preamble gets longer on every replay',
    ],
    answer: 0,
    why: 'Remote and receiver share a counter. Once a message is accepted, the receiver refuses that number again, which is exactly the job rolling code was invented to do.',
  },
  {
    id: 'primer-q10',
    q: 'Which statement about sending a Sub-GHz signal is correct?',
    options: [
      'Any frequency the Flipper can tune is legal to transmit on',
      'It is fine if the signal is only a replay of someone else\'s remote',
      'It is regulated because your signal shares the band with everyone else, so you transmit only to your own devices in a space you control',
      'Region unlocks in custom firmware make any frequency legal where you live',
    ],
    answer: 2,
    why: 'Hardware range and legal permission are different things. Wrong time, power or band can jam a neighbour\'s gate or break the law, so knowing local rules is your job.',
  },
];

export default questions;
