/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm18-q01',
    q: "The official Wi-Fi Devboard's ESP32-S2 radio can use…",
    options: [
      '5 GHz Wi-Fi and Bluetooth Classic',
      'Bluetooth LE but no Wi-Fi',
      '2.4 GHz Wi-Fi only; it has no Bluetooth radio',
      'Every radio found on other ESP32 chips, including Bluetooth LE',
    ],
    answer: 2,
    why: 'The module is an ESP32-S2, a single-core Wi-Fi-only part. It supports 2.4 GHz 802.11 b/g/n and has no Bluetooth; the Flipper’s own BLE is a separate chip.',
  },
  {
    id: 'm18-q02',
    q: 'A WiFi Marauder companion app opens on the Flipper, but every scan returns an empty list and the board still holds Black Magic firmware. What is missing?',
    options: [
      'A longer Sub-GHz antenna',
      'A microSD card in the Flipper for the companion app to save its scan results',
      'A 5 GHz access point to scan',
      'Matching Marauder firmware flashed on the board',
    ],
    answer: 3,
    why: 'The companion is only a terminal on the handheld. It cannot run Wi-Fi functions on a board whose firmware is still the debugger.',
  },
  {
    id: 'm18-q03',
    q: 'Which board firmware is intended for SWD breakpoints and single-stepping the Flipper?',
    options: [
      'Official Black Magic / CMSIS-DAP',
      'ESP32 Marauder',
      'A standalone Evil Portal image',
      'Any image with "Wi-Fi" in its name',
    ],
    answer: 0,
    why: 'The stock developer firmware turns the board into a debug probe over SWD on pins 10 and 12. Black Magic runs over USB or Wi-Fi; CMSIS-DAP over USB.',
  },
  {
    id: 'm18-q04',
    q: 'Before you replace the image on the board, what should you establish first?',
    options: [
      'That every ESP32 image shares the same flash offsets, so any image can be written over it',
      'A matching target, a record of current settings and a recovery path',
      'That changing the Flipper theme updates the board',
      'That the board has an onboard microSD slot',
    ],
    answer: 1,
    why: 'Record the exact board and release, note the current settings, and know the recovery command before you flash. Offsets and layout are specific to the target.',
  },
  {
    id: 'm18-q05',
    q: "Marauder's AP-only listing (`sniffbeacon` in v1.18.0) on this board is best described as…",
    options: [
      'Active: it sends probe requests on every channel and lists the replies',
      'A 5 GHz-only scan',
      'Passive: it listens in promiscuous mode and sends nothing',
      'A scan that also decrypts WPA2 traffic',
    ],
    answer: 2,
    why: 'The v1.18.0 beacon sniffer puts the radio in promiscuous mode and records the management frames it hears; it sends no probes. An ESP-IDF station active scan, by contrast, sends probe requests. Run `help` on your board for the exact command names.',
  },
  {
    id: 'm18-q06',
    q: 'A suitable WPA2-Personal EAPOL/PMKID capture from your own AP gives you…',
    options: [
      'The plaintext password immediately, read straight from the handshake',
      'Material that may support offline password guesses',
      'Proof that WPA3-SAE is broken',
      'A live session on the access point',
    ],
    answer: 1,
    why: 'A capture and a recovered password are different results. A strong unique passphrase resists offline guessing, and WPA3-SAE is designed to resist it entirely.',
  },
  {
    id: 'm18-q07',
    q: 'Negotiated Protected Management Frames (PMF) help protect…',
    options: [
      'Robust management frames, including deauthentication and disassociation',
      'All RF energy in the room',
      'A user who types a password into any website',
      'The board from being flashed',
    ],
    answer: 0,
    why: 'PMF covers deauth, disassociation and other robust management frames, and is mandated by WPA3. It does not stop interference or phishing.',
  },
  {
    id: 'm18-q08',
    q: 'Why switch your lab AP off, clear the list, and run a fresh scan?',
    options: [
      'To crack its encryption',
      'To raise the RSSI reading',
      'To convert RSSI into a distance in metres',
      'To test whether the observed entry actually depends on that AP',
    ],
    answer: 3,
    why: 'A negative control separates a current observation from a stale list entry or a different transmitter. If the entry stays, it was not your AP.',
  },
  {
    id: 'm18-q09',
    q: 'A bundled Marauder menu on the handheld proves which of the three software layers is present?',
    options: [
      'Only that the companion app is installed',
      'That the board runs Marauder firmware',
      'That the Flipper runs a custom firmware fork',
      'That all three layers match',
    ],
    answer: 0,
    why: 'The menu is the companion app. It says nothing about what is flashed on the board or which handheld firmware you run; record all three versions separately.',
  },
  {
    id: 'm18-q10',
    q: 'How are Flipper logs read through the Devboard, and over which link?',
    options: [
      'Over Wi-Fi at 115200 baud',
      'Over the board’s UART via USB at 230400 baud',
      'Over SWD at any baud rate',
      'Over Bluetooth from the ESP32-S2',
    ],
    answer: 1,
    why: 'The documented log route is UART over USB at 230400 baud. Logging over Wi-Fi is not supported, and one of the two serial ports is the debugger, not the log stream.',
  },
];

export default questions;
