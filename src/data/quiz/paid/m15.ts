/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm15-q01',
    q: 'What is a .fap file?',
    options: [
      'An executable with metadata that the loader copies from the microSD card into RAM and runs',
      'A complete firmware image that replaces what is in internal flash when you open it from the card',
      'A Sub-GHz recording saved by the Read RAW screen',
      'A Python script that uFBT runs on the Flipper',
    ],
    answer: 0,
    why: 'A FAP is an ELF executable plus metadata and resources. The processor cannot run code from the card, so the loader checks it, copies it into RAM and links it to the firmware functions it calls.',
  },
  {
    id: 'm15-q02',
    q: 'Your Flipper runs official 1.4.3 (API 87.1). You build an app after running ufbt update --channel=rc, which gives the 1.5.1-rc SDK (API 88.2). What happens when you start the app?',
    options: [
      'It runs, because the minor numbers are close enough for the loader',
      'It runs, but any radio functions are disabled',
      'The loader refuses it with "Outdated Firmware"',
      'The loader refuses it with "Outdated App"',
    ],
    answer: 2,
    why: 'The loader compares API major numbers. The app needs 88 and the firmware offers 87, so the firmware is the one that is behind. Switching the SDK back to the release channel fixes it without touching the firmware.',
  },
  {
    id: 'm15-q03',
    q: 'What does a successful ufbt build prove?',
    options: [
      'That the app will draw correctly and exit cleanly on the device, since the build runs it once',
      'That the source compiled against that SDK\'s headers and API list',
      'That the app frees every byte it allocates',
      'That the app will run on every firmware fork',
    ],
    answer: 1,
    why: 'A build checks the source against the SDK. Screen layout, button handling and cleanup only show up when the app runs on the device, which is why Lab 15.2 exists.',
  },
  {
    id: 'm15-q04',
    q: 'Why does signal_path_input copy the event into a queue with a timeout of 0 and return at once?',
    options: [
      'Because the queue can only ever hold one event',
      'Because a timeout of 0 makes the Flipper save battery',
      'Because the input callback runs on the app thread and must not wait for itself, or the app would deadlock',
      'Because it runs on the GUI thread, and waiting there would stall the screen and buttons for everyone',
    ],
    answer: 3,
    why: 'view_port.h marks input and draw callbacks "called from GUI thread". The callback hands the event over without waiting, and the app thread does the real work in its own loop.',
  },
  {
    id: 'm15-q05',
    q: 'With the companion app open, you hold Back for two seconds and then release it. What should happen?',
    options: [
      'The app stays open, because only an InputTypeShort Back event breaks the loop',
      'The app exits, because any Back event breaks the loop, whether it is short or long',
      'The Flipper reboots immediately',
      'The app exits twice and crashes',
    ],
    answer: 0,
    why: 'InputTypeShort is emitted only when the button is released before the long-press threshold. A long hold produces InputTypeLong and a release with no Short, so the exit test never matches.',
  },
  {
    id: 'm15-q06',
    q: 'At exit, why must the app call gui_remove_view_port before view_port_free?',
    options: [
      'Because view_port_free closes the GUI record',
      'Because the GUI thread may still draw the viewport, and freeing it first leaves the GUI holding a dangling pointer',
      'Because gui_remove_view_port also frees the message queue',
      'The order does not matter as long as both are called',
    ],
    answer: 1,
    why: 'view_port.h says to unregister a viewport from the GUI before freeing it. Cleanup gives back what the GUI holds first: disable and remove the viewport, then free it. The queue and the record are independent of the viewport, so they are released afterwards.',
  },
  {
    id: 'm15-q07',
    q: 'The source calls canvas_draw_str(canvas, 4, 20, "Signal Path"). What does y = 20 mean?',
    options: [
      'The top edge of the text is at row 20, so the letters hang down from it',
      'The text is 20 pixels tall',
      'Row 20 is the baseline, so the letters sit on it and rise above it',
      'The text is centred on row 20',
    ],
    answer: 2,
    why: 'canvas.h documents canvas_draw_str as drawing at the baseline. With FontPrimary 8 pixels tall in 1.4.3, the capitals rise about 8 rows above row 20.',
  },
  {
    id: 'm15-q08',
    q: 'Which manifest field decides that ufbt launch copies the app to /ext/apps/Tools/ and that it appears under Apps, then Tools?',
    options: [
      'appid',
      'entry_point',
      'stack_size',
      'fap_category',
    ],
    answer: 3,
    why: 'The build installs a FAP at apps/<fap_category>/<appid>.fap on the card. appid names the file; fap_category names the folder and the menu.',
  },
  {
    id: 'm15-q09',
    q: 'With heap tracking on, the companion logs a non-zero allocation balance on every run after you comment out furi_message_queue_free. What does that number tell you?',
    options: [
      'Memory allocated on the app\'s thread was not freed, and it stays lost until you reboot',
      'The app ran out of stack and should have a larger stack_size in its manifest to fix the leak',
      'The firmware has a memory bug unrelated to your app',
      'The queue was full and dropped some button presses',
    ],
    answer: 0,
    why: 'The balance counts bytes the app thread allocated minus bytes it freed. A leak that repeats every run is your code. A clean app reads 0 on a repeat run.',
  },
  {
    id: 'm15-q10',
    q: 'You run Momentum firmware. What is the course\'s way to make your own app start on it?',
    options: [
      'Flash official firmware with ufbt flash_usb so it matches the default SDK',
      'Point uFBT at Momentum\'s update index with ufbt update --index-url so the SDK matches your firmware',
      'Raise fap_version in the manifest until the loader accepts it',
      'Copy the .fap to the card by hand instead of using ufbt launch',
    ],
    answer: 1,
    why: 'The API check is decided by the SDK you build against. Changing the SDK to match the firmware avoids rewriting the device; fap_version and the copy method do not affect the check.',
  },
];

export default questions;
