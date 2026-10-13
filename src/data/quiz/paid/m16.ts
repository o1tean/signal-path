/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm16-q01',
    q: 'Another learner wants to repeat your accepted replay from your notebook entry alone. Which record helps them most?',
    options: [
      'A photo of the Flipper screen after Send',
      'The brand and model printed on the chime box',
      'What the receiver had learned, its code setting, the distance and the exact file you sent',
      'A note that the result surprised you',
    ],
    answer: 2,
    why: 'A repeat needs every condition that could change the result: the receiver state, the geometry and the exact file. A screen photo only shows that the Flipper transmitted, and the box label does not say how the receiver was set.',
  },
  {
    id: 'm16-q02',
    q: 'A receiver decrypts every message correctly but stores no counter. What happens when it receives a recording of an earlier valid message?',
    options: [
      'It rejects it, because encrypted messages cannot be recorded',
      'It accepts it, because nothing tells it the message is old',
      'It rejects it, because the ciphertext changes in transit',
      'It accepts it only if the recording was made within the last minute',
    ],
    answer: 1,
    why: 'Encryption stops forgery of new messages. Rejecting old ones needs a counter or challenge that the receiver remembers, which is a separate design goal.',
  },
  {
    id: 'm16-q03',
    q: 'Why present a never-enrolled training tag as a negative control?',
    options: [
      'To check whether acceptance depends on the credential under test at all',
      'To raise the reader\'s sensitivity before the real trial, so the emulated tag reads first time',
      'To enrol a second tag in case the first fails',
      'To find other readers nearby that accept it',
    ],
    answer: 0,
    why: 'If a tag the reader has never seen is also accepted, the reader is accepting things it should not, and the copied tag being accepted proves nothing about the copy.',
  },
  {
    id: 'm16-q04',
    q: 'Your standalone reader accepted an emulated copy of your training tag and refused a second, unenrolled tag. What can you claim?',
    options: [
      'Every 125 kHz access system can be opened with a Flipper that has emulated an enrolled tag once',
      'The tag\'s manufacturer has a vulnerability',
      'All readers of that model are insecure',
      'This reader, in this configuration, accepts that ID without further proof',
    ],
    answer: 3,
    why: 'One trial with controls supports a claim about the rig you tested. Model, brand and other installations were not tested, so they stay out of the finding.',
  },
  {
    id: 'm16-q05',
    q: 'A card is relayed from 50 m away instead of sitting 5 cm from the reader. Light travels about 0.3 m per nanosecond. Roughly how much extra round-trip time does the distance alone add?',
    options: [
      'About 333 nanoseconds',
      'About 33 nanoseconds',
      'About 167 microseconds',
      'None, because radio arrives instantly',
    ],
    answer: 0,
    why: 'The round trip grows by about 100 m, and 100 / 0.3 is about 333 ns. That is far too small for a reader that only checks the answer, which is why distance bounding times the physical layer.',
  },
  {
    id: 'm16-q06',
    q: 'Your positive control fails: the genuine remote does not ring your chime. What do you write about the replay you planned?',
    options: [
      'That the chime is immune to replay',
      'That the Flipper\'s replay would also fail, since it sends the same signal as the remote',
      'Nothing yet; the rig cannot say yes, so fix it before testing',
      'That the remote uses a rolling code',
    ],
    answer: 2,
    why: 'Without a working positive control, a failed trial and a broken rig look the same. Check the battery, range and receiver setup first.',
  },
  {
    id: 'm16-q07',
    q: 'Which of these can one bench session on your own equipment actually test?',
    options: [
      'My doorbell is secure',
      'Fixed-code chimes are insecure',
      'Brand X has a replay vulnerability',
      'My chime, paired to one remote, rings for one replay of its button from 1 m',
    ],
    answer: 3,
    why: 'It names the target and its configuration, the capability and an outcome you can predict and observe. The others name no observable, or cover devices you will never put on your bench.',
  },
  {
    id: 'm16-q08',
    q: 'You fit a rolling-code receiver to rig A and re-run the same three tests: the genuine remote rings it, the replay is refused, the non-matching file is refused. How should the write-up describe the mitigation?',
    options: [
      'Proven for every rolling-code product on the market',
      'Untested, because a mitigation cannot be checked on a bench',
      'Tested on this rig: it restored freshness against this replay',
      'Unnecessary, because the original finding must have been wrong',
    ],
    answer: 2,
    why: 'A mitigation is a second claim, tested with the same controls. The positive control still passing shows the refusal comes from the fix rather than a broken rig, and the claim stays as narrow as the rig.',
  },
  {
    id: 'm16-q09',
    q: 'Why does this course keep interference-assisted capture in the simulator even when you own the receiver?',
    options: [
      'Jamming blocks every other user of that band nearby, and radio does not stop at your wall',
      'The Flipper cannot receive while another device transmits',
      'Rolling codes cannot be captured at all',
      'The simulator gives more accurate results than hardware',
    ],
    answer: 0,
    why: 'Owning the receiver does not give you the shared spectrum. The model shows the mechanism, a fresh unheard counter, without disrupting anyone.',
  },
  {
    id: 'm16-q10',
    q: 'Your fixed-code chime accepted a replay and refused a non-matching button. Which mitigation addresses that finding?',
    options: [
      'A longer antenna on the receiver',
      'Messages with a rolling counter or fresh challenge that the receiver checks',
      'Encrypting the fixed code so it looks random to anyone who records it from the air',
      'Moving the chime to a different frequency',
    ],
    answer: 1,
    why: 'The finding is a missing freshness check, so the fix adds one. An encrypted code that never changes replays just as well, and a new frequency only moves the problem.',
  },
];

export default questions;
