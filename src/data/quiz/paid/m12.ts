/* SERVER ONLY. Paid questions. Never import from a React island, widget or client script. */
import type { QuizQuestion } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 'm12-q01',
    q: 'Why does the LED in Lab 12.1 need a resistor in series?',
    options: [
      'To raise the pin voltage up to the LED\'s forward voltage so that it lights',
      'To stop the LED working if it is reversed',
      'To limit the current, because the LED does not limit its own',
      'To make the pin 5 V tolerant',
    ],
    answer: 2,
    why: 'Past its forward voltage an LED draws sharply more current for a small rise in voltage. The resistor turns the leftover voltage into a fixed current.',
  },
  {
    id: 'm12-q02',
    q: 'According to Flipper’s documentation, when is a GPIO signal pin 5 V tolerant?',
    options: [
      'Only while it is configured as an input',
      'Always, because pin 1 supplies 5 V',
      'Only while 5V on GPIO is switched on in the settings',
      'Never, under any configuration',
    ],
    answer: 0,
    why: 'The docs say an input pin tolerates 5 V and an output pin does not. Firmware can switch a pin to output, which is why the docs advise against 5 V peripherals altogether.',
  },
  {
    id: 'm12-q03',
    q: 'What does a working UART link between two boards need?',
    options: [
      'A shared clock wire and a chip-select line',
      'Pull-up resistors on TX and RX and a 7-bit address',
      'Only a connector that fits both boards',
      'Compatible voltage levels, the same baud rate and frame, TX to RX, and a common ground',
    ],
    answer: 3,
    why: 'UART has no clock, so both ends agree on timing in advance. Levels and ground make the voltages mean the same thing on both sides.',
  },
  {
    id: 'm12-q04',
    q: 'PA7 drives 3.3 V through the Flipper’s internal 51 Ω, then a 1 kΩ resistor, then a red LED of about 2.0 V to ground. What current do you estimate?',
    options: ['About 3.3 mA', 'About 1.2 mA', 'About 12 mA', 'About 0.12 mA'],
    answer: 1,
    why: '(3.3 V − 2.0 V) ÷ (1,000 Ω + 51 Ω) = 1.24 mA, well inside the 20 mA per-pin rating.',
  },
  {
    id: 'm12-q05',
    q: 'In GPIO Manual Control you hold OK on PA7, then release it. What does PA7 do?',
    options: [
      'Stays high until you press OK again',
      'Is driven low again',
      'Switches to input mode',
      'Toggles between high and low every second',
    ],
    answer: 1,
    why: 'The firmware drives the selected pin high on the press and low on the release. Nothing latches.',
  },
  {
    id: 'm12-q06',
    q: 'Why should nothing except your test circuit be wired to the general I/O pins when you open GPIO Manual Control?',
    options: [
      'The app measures every pin and would report the wrong voltage',
      'The app turns on the 5 V supply on pin 1',
      'The app makes all eight general I/O pins outputs driven low as soon as it opens',
      'The app reboots the Flipper if it detects a load',
    ],
    answer: 2,
    why: 'On entry the firmware configures PA7, PA6, PA4, PB3, PB2, PC3, PC1 and PC0 as push-pull outputs. Anything driving those pins is now fighting an output.',
  },
  {
    id: 'm12-q07',
    q: 'Why does an I²C bus need pull-up resistors?',
    options: [
      'They set the baud rate of the bus',
      'They protect the bus from 5 V devices by dropping the extra voltage across the resistor',
      'They select which device is addressed',
      'Devices only pull SDA and SCL low, so something must return the lines high',
    ],
    answer: 3,
    why: 'I²C outputs are open-drain. With no pull-ups no device can produce a high, and the bus never idles correctly.',
  },
  {
    id: 'm12-q08',
    q: 'An SPI controller has three peripherals on the same clock and data lines. How does it talk to just one of them?',
    options: [
      'It pulls that peripheral’s own chip-select line, usually active low',
      'It sends the peripheral’s 7-bit address first, and only that peripheral answers the clock',
      'It changes the baud rate to match that peripheral',
      'It swaps the TX and RX lines',
    ],
    answer: 0,
    why: 'SPI selects devices in hardware. Each peripheral has its own chip-select line, and only the selected one drives its data output.',
  },
  {
    id: 'm12-q09',
    q: 'Your loopback with a jumper from pin 13 to pin 14 echoes every character. What has it proved?',
    options: [
      'That any 3.3 V board will work on those pins',
      'That the Flipper’s TX, RX and USB path work',
      'That the baud rate matches the board you will connect next',
      'That the pins are 5 V tolerant',
    ],
    answer: 1,
    why: 'The same UART sends and receives at the same rate, so a loopback tests your own side only. It says nothing about another device’s levels or settings.',
  },
  {
    id: 'm12-q10',
    q: 'Why is an RS-232 serial port excluded from this course’s GPIO work?',
    options: [
      'Its signals can sit anywhere from +3 V to +15 V or −3 V to −15 V, far outside 0 to 3.3 V logic',
      'RS-232 needs a radio licence',
      'RS-232 uses I²C addresses the Flipper cannot read',
      'Its connectors are too small for jumper wires',
    ],
    answer: 0,
    why: 'TI’s RS-232 FAQ gives valid levels as ±3 V to ±15 V. A negative or 12 V swing on a 3.3 V pin can damage it.',
  },
];

export default questions;
