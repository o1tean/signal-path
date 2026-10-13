/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm13-q01',
    q: 'When the Flipper runs a keyboard script, what does it send to the computer?',
    options: [
      'Key positions as HID usage codes, which the host turns into characters',
      'The text as finished characters, ready to display',
      'A text file that the host opens and executes',
      'Key positions plus a device certificate the host checks before it accepts any keypress',
    ],
    answer: 0,
    why: 'A keyboard sends usage codes for key positions. The host, not the keyboard, maps each position to a character using its layout.',
  },
  {
    id: 'm13-q02',
    q: 'Why can a computer not tell the Flipper apart from a real keyboard?',
    options: [
      'The host checks the USB vendor ID against a trusted list, and the Flipper copies one',
      'The host skips all checks on USB devices to save time',
      'Both present as a HID keyboard and send the same kind of keypress reports',
      'The Flipper signs each keypress with the real keyboard’s key',
    ],
    answer: 2,
    why: 'A keyboard identifies as a Human Interface Device and sends keypress reports. The host has no way to check whether a hand or a chip produced them.',
  },
  {
    id: 'm13-q03',
    q: 'A colleague’s script types z where you expected y. What is the most likely cause?',
    options: [
      'The script has a typing error on that line',
      'The host layout differs from the one the key positions were chosen for',
      'The Flipper fails to send the Shift key, so letters next to each other get swapped',
      'The recognition delay cut the script short',
    ],
    answer: 1,
    why: 'Scripts send key positions. A German layout resolves the US Y position to Z, so the same code gives a different letter.',
  },
  {
    id: 'm13-q04',
    q: 'A script arrives with a reassuring file name. What is the right way to treat it?',
    options: [
      'Run it in BLE mode, which limits what it can do',
      'Rename it to something safer before running it',
      'Read every line first, because the name says nothing about the keypresses',
      'Run it once and read it only if something looks wrong',
    ],
    answer: 2,
    why: 'The file name is unverified text. Only reading each line tells you which keypresses the script will send.',
  },
  {
    id: 'm13-q05',
    q: 'A script starts with DELAY 3000 and then types a sentence. What is that first line for here?',
    options: [
      'It types the number 3000 into the document',
      'It repeats the sentence for three seconds',
      'It waits for a button press on the Flipper before it starts typing the sentence',
      'It gives you time to put focus on the right window before typing starts',
    ],
    answer: 3,
    why: 'DELAY pauses once. Keystrokes go to the focused window, so the pause lets you check focus before anything is typed.',
  },
  {
    id: 'm13-q06',
    q: 'Why does the Bad USB app refuse to start while qFlipper or the mobile app still has a connection?',
    options: [
      'It would lose the battery race with the other connection and shut down the USB port',
      'It needs the USB port to itself, so the other link must be closed first',
      'It only runs scripts when no firmware update is pending',
      'It can only act as a keyboard over Bluetooth',
    ],
    answer: 1,
    why: 'Bad USB takes over the USB interface to act as a keyboard, so an active qFlipper or app link must be closed first.',
  },
  {
    id: 'm13-q07',
    q: 'Your laptop pairs with the Flipper’s BadUSB keyboard over Bluetooth. How does that relate to the Flipper’s mobile-app pairing?',
    options: [
      'It replaces the mobile-app pairing',
      'It is the same pairing under a different name',
      'It is a separate BLE relationship, with its own device name and stored keys',
      'It adds the laptop as a second mobile-app device',
    ],
    answer: 2,
    why: 'The BadUSB keyboard advertises as its own BLE HID device with separate pairing keys, distinct from the mobile-app link.',
  },
  {
    id: 'm13-q08',
    q: 'You press Config → Remove Pairing in BLE mode. What does it clear?',
    options: [
      'Every Bluetooth pairing, including the mobile app and any phone it was bonded to',
      'Only the bonded keyboard device, not the mobile-app link',
      'Only the mobile-app link',
      'Nothing until the Flipper restarts',
    ],
    answer: 1,
    why: 'The keyboard keeps its own key store, and Remove Pairing clears only that one. The mobile-app link stays.',
  },
  {
    id: 'm13-q09',
    q: 'An unfamiliar keyboard shows up in your computer’s accepted devices list. What should you do?',
    options: [
      'Leave it, since keyboards are harmless',
      'Keep it but rename it',
      'Lock the screen and keep the device, since a locked screen ignores any typing from it',
      'Remove it if you did not start the pairing or plug it in',
    ],
    answer: 3,
    why: 'The host trusts any keyboard it accepted, so a device you cannot account for should be removed.',
  },
];

export default questions;
