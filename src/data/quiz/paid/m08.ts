/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    "id": "m08-q01",
    "q": "Where does official firmware load custom Sub-GHz modulation presets from?",
    "options": [
      "A cloud account linked to the Flipper Mobile App, synced the next time you connect over Bluetooth",
      "Only from a fork's settings app",
      "A setting_user file in subghz/assets on the microSD card",
      "A jumper on the GPIO header"
    ],
    "answer": 2,
    "why": "Official firmware reads extra presets from subghz/assets/setting_user on the SD card. Custom presets are not a reason on their own to switch to a fork."
  },
  {
    "id": "m08-q02",
    "q": "Momentum can extend Sub-GHz to 281–361, 378–481 and 749–962 MHz. What does that option actually change?",
    "options": [
      "Which frequencies the firmware lets the radio use, while the legal limits and the chip's specified bands stay the same",
      "The CC1101's hardware bands, so the radio is now specified for the wider ranges",
      "Your legal permission to transmit on the added frequencies",
      "Nothing, because the option only changes the menu theme"
    ],
    "answer": 0,
    "why": "It is a firmware setting. The CC1101 is specified for 300–348, 387–464 and 779–928 MHz, and what you may transmit is set by your regulator, not by a menu."
  },
  {
    "id": "m08-q03",
    "q": "What does fitting an external CC1101 module change?",
    "options": [
      "It adds Wi-Fi through the Sub-GHz app",
      "It requires a fork, because official firmware ignores external radios connected to the GPIO header",
      "It gives legal permission to use higher power",
      "The radio path: a different board and antenna, so results depend on that hardware"
    ],
    "answer": 3,
    "why": "Official firmware supports external CC1101-based boards. The improvement, if any, comes from that board and antenna, and the same radio rules still apply."
  },
  {
    "id": "m08-q04",
    "q": "Your Flipper's About screen shows [87.1]. Someone sends you an app built for API 88.2. What happens when you start it?",
    "options": [
      "It runs normally, because only the minor number matters",
      "The loader shows Outdated Firmware, because the app's major number is higher",
      "The loader shows Outdated App, because an app built for a newer API is refused until it is rebuilt",
      "The app runs but cannot save files"
    ],
    "answer": 1,
    "why": "The loader compares major numbers only. App major 88 above firmware major 87 gives Outdated Firmware, with the advice to update firmware."
  },
  {
    "id": "m08-q05",
    "q": "You repair a bricked Flipper with qFlipper. What do you lose?",
    "options": [
      "Internal storage: settings, the dolphin's level and Bluetooth pairings, while the microSD card is kept",
      "Everything on the microSD card, including your captures",
      "Nothing at all",
      "Only the installed apps"
    ],
    "answer": 0,
    "why": "Flipper's recovery page says repair erases all internal storage and that data on the microSD card is saved. A qFlipper backup covers the part that is erased."
  },
  {
    "id": "m08-q06",
    "q": "A fork's changelog says it can save and send a rolling-code protocol your gate remote uses. What does that tell you about a replay?",
    "options": [
      "The gate will open on replay",
      "The gate's receiver counter is disabled by the firmware, so the receiver accepts the saved press again",
      "Nothing about acceptance: the receiver's counter decides, and the gate is not yours to test",
      "That the remote has switched to fixed code"
    ],
    "answer": 2,
    "why": "Decoding or storing a message is not the same as the receiver accepting it. Rolling-code receivers check a counter, and a gate is outside this course's scope."
  },
  {
    "id": "m08-q07",
    "q": "Which statement about firmware and hardware is true?",
    "options": [
      "Momentum turns the CC1101 into a Wi-Fi radio",
      "Firmware can change menus, protocols and limits, but cannot add a radio the hardware lacks",
      "Any fork increases range because it raises transmit power",
      "Switching firmware also replaces the microSD card's contents, so captures must be copied off before every update"
    ],
    "answer": 1,
    "why": "The hardware sets the ceiling. Wi-Fi needs the separate ESP32-S2 Devboard, and range comes from the radio, antenna and setup."
  },
  {
    "id": "m08-q08",
    "q": "You plan to try a fork next week. What should you do first?",
    "options": [
      "Format the microSD card so the fork starts clean, then copy your captures back after the first boot",
      "Force recovery mode once to make sure it works",
      "Remove the region setting so the fork can set its own",
      "Record version, API and region, take a qFlipper backup, and write down your recovery route"
    ],
    "answer": 3,
    "why": "A baseline and a backup let you prove what changed and get back. Formatting or forcing recovery destroys data you may need."
  },
  {
    "id": "m08-q09",
    "q": "Where on the device can you read the app API version?",
    "options": [
      "Settings → About, on the FW Version Info screen, in brackets after the git hash",
      "Sub-GHz → Region Information",
      "Only on the Flipper Lab website",
      "It is printed on the label under the device"
    ],
    "answer": 0,
    "why": "The About app prints the firmware's API as [major.minor] on the second line of FW Version Info. Region Information lists transmit ranges, not versions."
  },
  {
    "id": "m08-q10",
    "q": "After switching firmware, why repeat a lab you already did, with the same remote, frequency and preset?",
    "options": [
      "To earn the badge a second time",
      "As a regression check: if the result differs from your notebook, the firmware is the likely change",
      "Because a new firmware erases the old captures on the card, so the lab has to be run again to get the file back",
      "To recalibrate the CC1101"
    ],
    "answer": 1,
    "why": "Keeping everything else fixed isolates the one thing you changed. Your earlier notebook entry is the expected result."
  }
];

export default questions;
