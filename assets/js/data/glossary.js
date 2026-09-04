/* ============================================================
   Signal Path — glossary
   Consumed by glossary.html and the flashcards widget.
   Shape: [ { term, short, long, tags:[...] } ], sorted A–Z by term.
   tags drawn from: sub-ghz, modulation, protocol, security, rfid,
   nfc, hardware, units, legal, flipper.
   Plain data. No dependencies. Must pass `node --check`.
   ============================================================ */
window.SP_GLOSSARY = [
  {
    term: ".sub file",
    short: "A Flipper Sub-GHz capture saved as a small text file.",
    long: "Flipper Sub-GHz signals are stored as plain-text .sub files whose lines include Frequency, Preset, Protocol, Bit, Key and TE. RAW captures use a similar file that records the waveform as RAW_Data timing values instead of a decoded key.",
    tags: ["sub-ghz", "protocol", "flipper"]
  },
  {
    term: "AM (Amplitude Modulation)",
    short: "Encoding data by changing the strength of the carrier wave.",
    long: "Amplitude modulation varies how strong the carrier is. Its simplest form, on-off keying (OOK), just switches the carrier on and off; the Flipper's AM270 and AM650 presets read these signals.",
    tags: ["modulation", "sub-ghz"]
  },
  {
    term: "Antenna",
    short: "The conductor that radiates or receives radio waves.",
    long: "An antenna turns electrical signals into radio waves and back again. Its ideal size relates to wavelength: a quarter-wave antenna for 433.92 MHz is about 17.3 cm.",
    tags: ["hardware", "sub-ghz"]
  },
  {
    term: "Bandwidth",
    short: "The width of the frequency range a receiver listens to.",
    long: "Bandwidth is how wide a slice of spectrum a preset or channel uses. Wider bandwidth captures more of a signal but lets in more noise; the number in a preset like AM650 is roughly its bandwidth in kHz.",
    tags: ["modulation", "units", "sub-ghz"]
  },
  {
    term: "Bit length",
    short: "How many bits make up a protocol's code word.",
    long: "Shown as the Bit field in a .sub file (for example Bit: 24), this is the length of the transmitted code word. A 24-bit fixed code has roughly 16 million possible values.",
    tags: ["protocol", "sub-ghz"]
  },
  {
    term: "Brute force",
    short: "Trying many codes in sequence hoping one is accepted.",
    long: "Brute forcing means transmitting code after code until a receiver accepts one. Community apps for this exist, but using them against devices you don't own is illegal; this course never does it.",
    tags: ["security", "legal"]
  },
  {
    term: "CAME",
    short: "A common fixed-code protocol for gates and barriers.",
    long: "CAME is an Italian gate-automation brand whose classic remotes use a simple fixed code. The Flipper can decode it and, for your own gate, replay it.",
    tags: ["protocol", "sub-ghz"]
  },
  {
    term: "Carrier",
    short: "The steady base wave that modulation rides on.",
    long: "The carrier is a pure wave at the chosen frequency, say 433.92 MHz. Modulation stamps information onto it by varying its amplitude (AM) or its frequency (FM).",
    tags: ["modulation", "sub-ghz"]
  },
  {
    term: "CC1101",
    short: "The Texas Instruments sub-GHz radio chip inside the Flipper.",
    long: "The CC1101 handles the Flipper's sub-GHz work across roughly 300–348, 387–464 and 779–928 MHz. An external CC1101 module with a better antenna can extend range.",
    tags: ["hardware", "sub-ghz"]
  },
  {
    term: "Counter (Cnt)",
    short: "The rolling value that steps up each press on a rolling-code remote.",
    long: "On the Flipper's Read screen a rolling-code remote such as Nice FloR-S shows a Cnt that increments every button press. The receiver tracks it to reject codes that have already been used.",
    tags: ["security", "sub-ghz", "protocol"]
  },
  {
    term: "dBm",
    short: "Signal power on a logarithmic scale referenced to 1 milliwatt.",
    long: "0 dBm equals 1 mW. Every +10 dB is ten times the power and +3 dB is about double, so dBm compresses a huge power range into small numbers. RSSI is usually reported in dBm.",
    tags: ["units", "sub-ghz"]
  },
  {
    term: "Duty cycle",
    short: "The fraction of time a transmitter is actually emitting.",
    long: "Duty cycle is the percentage of time a signal is on versus off. Many ISM-band rules cap duty cycle so that low-power devices share the air politely.",
    tags: ["units", "legal", "sub-ghz"]
  },
  {
    term: "EM4100",
    short: "A widespread read-only 125 kHz RFID tag format.",
    long: "EM4100 (EM-Marin) tags carry a fixed ID and are common in access fobs. The Flipper can read them and, for tags you own, write the ID onto a T5577 blank.",
    tags: ["rfid"]
  },
  {
    term: "Emulate",
    short: "Making the Flipper pretend to be a card, tag, or remote.",
    long: "Instead of writing to a blank, the Flipper can emulate a saved tag or signal, presenting it to a reader as if it were the original. Use it only on devices you're authorized to test.",
    tags: ["rfid", "nfc", "flipper"]
  },
  {
    term: "Fixed code",
    short: "A code that stays the same every time the button is pressed.",
    long: "Fixed-code remotes (Princeton, CAME, Nice FLO and many Holtek designs) send an identical code each press, so a recorded capture replays reliably. That simplicity is also their security weakness.",
    tags: ["protocol", "security", "sub-ghz"]
  },
  {
    term: "FM (Frequency Modulation)",
    short: "Encoding data by shifting the carrier's frequency.",
    long: "Frequency modulation carries information by nudging the carrier up and down in frequency. Its digital form is FSK; the Flipper's FM238 and FM476 presets read these signals.",
    tags: ["modulation", "sub-ghz"]
  },
  {
    term: "Frequency",
    short: "How many times a wave cycles per second, measured in hertz.",
    long: "Frequency sets the 'channel' a device uses, such as 433.92 MHz. Higher frequency means shorter wavelength, and devices on different frequencies don't interfere with each other.",
    tags: ["units", "sub-ghz"]
  },
  {
    term: "Frequency Analyzer",
    short: "A Flipper tool that finds the strongest nearby signal's frequency.",
    long: "Holding a remote close and pressing it while the Frequency Analyzer runs reveals which frequency it uses, so you can then tune Read correctly. It only sees signals that are transmitting right then.",
    tags: ["flipper", "sub-ghz"]
  },
  {
    term: "FSK (Frequency-Shift Keying)",
    short: "Digital FM that switches the carrier between two frequencies for 0 and 1.",
    long: "FSK represents bits by hopping the carrier between frequencies. It's the modulation behind the Flipper's FM presets and many key fobs.",
    tags: ["modulation", "sub-ghz"]
  },
  {
    term: "GHz",
    short: "Gigahertz — one billion hertz.",
    long: "1 GHz = 1,000 MHz = 1,000,000,000 Hz. Wi-Fi and Bluetooth live around 2.4 GHz, well above the Flipper's sub-GHz radio.",
    tags: ["units"]
  },
  {
    term: "HF (13.56 MHz)",
    short: "The high-frequency band that NFC uses.",
    long: "HF here means the 13.56 MHz band where NFC and ISO 14443 cards operate. It is separate from 125 kHz LF RFID and from the sub-GHz remote bands.",
    tags: ["nfc", "units"]
  },
  {
    term: "HID Prox",
    short: "A common 125 kHz proximity access-card format.",
    long: "HID Prox (for example the H10301 format) is a widely used LF badge standard carrying facility and card numbers. The Flipper can read it and, for your own cards, emulate it.",
    tags: ["rfid"]
  },
  {
    term: "Holtek",
    short: "A chip maker whose encoders power many fixed-code remotes.",
    long: "Holtek encoder chips appear in countless inexpensive remotes and are typically fixed-code, so the Flipper decodes and replays them for devices you own.",
    tags: ["protocol", "sub-ghz"]
  },
  {
    term: "Hz",
    short: "Hertz — one cycle per second, the base unit of frequency.",
    long: "One hertz is one wave cycle per second. The Flipper stores frequencies in Hz, so 433920000 in a .sub file means 433.92 MHz.",
    tags: ["units"]
  },
  {
    term: "Indala",
    short: "Another 125 kHz proximity card format.",
    long: "Indala is an LF access-card family alongside EM4100 and HID Prox. The Flipper recognizes it among its 125 kHz reader options.",
    tags: ["rfid"]
  },
  {
    term: "ISM band",
    short: "License-free radio bands set aside for industrial, scientific and medical use.",
    long: "ISM bands (like 433 MHz in much of the world and 915 MHz in North America) let low-power devices such as remotes and sensors transmit without an individual licence, within power and duty-cycle limits.",
    tags: ["legal", "sub-ghz", "units"]
  },
  {
    term: "ISO 14443",
    short: "The standard behind most 13.56 MHz contactless cards.",
    long: "ISO 14443 defines how proximity NFC cards such as Mifare and bank cards communicate at 13.56 MHz. It's the family the Flipper's NFC reader targets.",
    tags: ["nfc", "protocol"]
  },
  {
    term: "Jamming",
    short: "Drowning out a frequency with noise so real signals can't get through.",
    long: "Jamming floods a band to block communication. It's illegal in most places and this course never does it; the term is included only so you recognize it.",
    tags: ["security", "legal"]
  },
  {
    term: "KeeLoq",
    short: "A classic rolling-code cipher from Microchip.",
    long: "KeeLoq generates a fresh code on each press using a secret key and a counter, so an old recording won't work again. It underpins many garage and car remotes.",
    tags: ["security", "protocol", "sub-ghz"]
  },
  {
    term: "Key",
    short: "The code value carried in a captured signal.",
    long: "In a .sub file the Key line holds the decoded code, for example Key: 00 00 00 00 00 8C 5A 3B. For a fixed code it stays constant; for a rolling code it changes every press.",
    tags: ["protocol", "security", "sub-ghz"]
  },
  {
    term: "kHz",
    short: "Kilohertz — one thousand hertz.",
    long: "1 kHz = 1,000 Hz. LF RFID runs at 125 kHz, and preset bandwidths such as AM650 are quoted in kHz.",
    tags: ["units"]
  },
  {
    term: "LF (125 kHz)",
    short: "The low-frequency band used by 125 kHz RFID.",
    long: "LF RFID (125 kHz) covers formats like EM4100, HID Prox and Indala. Its near-field coupling means a read range of only a few centimeters.",
    tags: ["rfid", "units"]
  },
  {
    term: "MHz",
    short: "Megahertz — one million hertz.",
    long: "1 MHz = 1,000,000 Hz. Sub-GHz remotes cluster around 315 and 433.92 MHz, while NFC sits at 13.56 MHz.",
    tags: ["units"]
  },
  {
    term: "Mifare Classic",
    short: "A common 13.56 MHz NFC card with key-protected data sectors.",
    long: "Mifare Classic cards report a public UID instantly but keep their data in sectors locked by keys. Without those keys the content stays inaccessible.",
    tags: ["nfc", "security"]
  },
  {
    term: "Modulation",
    short: "The scheme used to stamp information onto a carrier wave.",
    long: "Modulation is how bits ride the radio wave — by amplitude (AM/OOK) or frequency (FM/FSK). Matching the Flipper's preset to the signal's modulation is essential to decode it.",
    tags: ["modulation", "sub-ghz"]
  },
  {
    term: "mW (milliwatt)",
    short: "One thousandth of a watt; a common unit of RF power.",
    long: "Transmit power is often given in milliwatts. On the dBm scale 1 mW is 0 dBm; the Flipper's built-in radio is low-power, which limits its range.",
    tags: ["units", "sub-ghz"]
  },
  {
    term: "NFC",
    short: "Near-Field Communication — short-range 13.56 MHz contactless tech.",
    long: "NFC covers access cards, transit passes and payment cards at 13.56 MHz. The Flipper can read tag types like Mifare and NTAG, but bank (EMV) cards expose only limited public data.",
    tags: ["nfc"]
  },
  {
    term: "NICE FLO",
    short: "A 12-bit fixed-code gate remote protocol.",
    long: "Nice FLO sends a simple 12-bit fixed code, so a capture of your own remote replays reliably. Its rolling-code sibling is Nice FloR-S, which shows a changing counter.",
    tags: ["protocol", "sub-ghz"]
  },
  {
    term: "Noise floor",
    short: "The background radio level below which signals are hard to hear.",
    long: "The noise floor is the baseline of ambient RF energy. A signal has to rise above it to be read, so a weak signal sitting near the noise floor often decodes poorly.",
    tags: ["sub-ghz", "units"]
  },
  {
    term: "NTAG",
    short: "A popular family of simple 13.56 MHz NFC tags.",
    long: "NTAG chips (such as NTAG213/215/216) are inexpensive NFC tags often used for URLs and small data. The Flipper can read and write NTAGs you own.",
    tags: ["nfc"]
  },
  {
    term: "OOK (On-Off Keying)",
    short: "The simplest AM: switching the carrier fully on and off.",
    long: "On-off keying sends bits by turning the carrier on for a 1 and off for a 0. Most inexpensive remotes use it, and the Flipper's AM presets (like the OOK650 preset) read it.",
    tags: ["modulation", "sub-ghz"]
  },
  {
    term: "Preamble",
    short: "A lead-in pattern that marks the start of a transmission.",
    long: "Many protocols begin with a preamble — a repeated sync pattern that lets the receiver lock on before the real data bits arrive.",
    tags: ["protocol", "sub-ghz"]
  },
  {
    term: "Preset",
    short: "A saved combination of modulation and bandwidth for reading signals.",
    long: "A Flipper preset bundles a modulation type with a bandwidth. Stock presets are AM270, AM650, FM238 and FM476; custom firmware like Momentum can add more via an SD-card settings file.",
    tags: ["modulation", "flipper", "sub-ghz"]
  },
  {
    term: "Princeton",
    short: "A very common fixed-code OOK remote protocol.",
    long: "Princeton (PT2262-style) is a classic 24-bit fixed OOK code found in many remotes. The Flipper decodes it readily, showing Bit: 24 and a constant Key.",
    tags: ["protocol", "sub-ghz"]
  },
  {
    term: "Protocol",
    short: "The agreed structure both sides use to understand a signal.",
    long: "A protocol defines how bits are arranged and timed — the signal's language. The Flipper matches known protocols (Princeton, CAME, Nice FLO and others) to decode a capture.",
    tags: ["protocol"]
  },
  {
    term: "RAW capture",
    short: "A recording of a signal's raw timing when no protocol is recognized.",
    long: "Read RAW stores the waveform as RAW_Data lines of alternating positive and negative microsecond durations. Use it when the Flipper can't identify the protocol but you still want the signal.",
    tags: ["sub-ghz", "flipper", "protocol"]
  },
  {
    term: "Region / regulatory",
    short: "Local rules governing which frequencies and powers you may transmit on.",
    long: "Legal frequency bands and power limits vary by country. Unlocking extended frequencies in custom firmware does not make transmitting on them legal where you are.",
    tags: ["legal", "sub-ghz"]
  },
  {
    term: "Replay",
    short: "Transmitting a previously recorded signal.",
    long: "Replay sends a saved capture back out on the air. It works on fixed-code devices you own but fails against rolling codes, whose one-time values are rejected once used.",
    tags: ["security", "sub-ghz", "flipper"]
  },
  {
    term: "RF",
    short: "Radio Frequency — electromagnetic waves that carry signals through the air.",
    long: "RF is the invisible wave energy behind remotes, RFID, NFC and Wi-Fi. Everything in this course is about listening to, and legally replaying, RF from devices you own.",
    tags: ["sub-ghz", "units"]
  },
  {
    term: "RFID",
    short: "Radio-Frequency Identification — tags read wirelessly by a reader.",
    long: "RFID covers LF (125 kHz) tags like EM4100 and HF (13.56 MHz) NFC cards. A reader powers and queries the tag, which replies with its ID or data.",
    tags: ["rfid", "nfc"]
  },
  {
    term: "Rolling code",
    short: "A code that changes every press to stop simple replay.",
    long: "Rolling codes use a counter and a cipher (like KeeLoq or Security+ 2.0) so each transmission is single-use. A recorded code may work once, then the counter advances and it's rejected.",
    tags: ["security", "protocol", "sub-ghz"]
  },
  {
    term: "RSSI",
    short: "Received Signal Strength Indicator — how strong an incoming signal is.",
    long: "RSSI, usually reported in dBm, tells you how loudly a signal arrives. The Frequency Analyzer uses it to point you at the strongest nearby transmitter.",
    tags: ["sub-ghz", "units"]
  },
  {
    term: "Security+ 2.0",
    short: "Chamberlain/LiftMaster's rolling-code garage-door system.",
    long: "Security+ 2.0 is a modern rolling-code protocol, so a straight replay of one capture won't reliably reopen the door. It's a clear example of why replay fails on rolling systems.",
    tags: ["security", "protocol", "sub-ghz"]
  },
  {
    term: "Sub-GHz",
    short: "Radio below 1 GHz, where most remotes and sensors live.",
    long: "Sub-GHz spans the Flipper's 300–348, 387–464 and 779–928 MHz ranges — home to garage remotes, gates and doorbells around 315 and 433.92 MHz.",
    tags: ["sub-ghz", "units"]
  },
  {
    term: "T5577",
    short: "A writable 125 kHz RFID blank you can program.",
    long: "A T5577 chip can be written to emulate LF formats like EM4100 or HID Prox, letting you copy a tag you own onto a fresh blank.",
    tags: ["rfid", "hardware"]
  },
  {
    term: "TE (timing element)",
    short: "The base pulse duration a protocol's timings are multiples of.",
    long: "TE (for example TE: 400) is the fundamental timing unit in microseconds; a protocol builds its 0s and 1s from multiples of it. It appears in decoded .sub files.",
    tags: ["protocol", "sub-ghz", "units"]
  },
  {
    term: "UID",
    short: "The unique identifier an RFID or NFC tag reports.",
    long: "The UID is a tag's public serial number. It's read instantly, but it isn't the same as the secret keys that protect a card's data sectors.",
    tags: ["nfc", "rfid", "security"]
  },
  {
    term: "Wavelength",
    short: "The physical length of one wave cycle, λ = c / frequency.",
    long: "Wavelength shrinks as frequency rises. Using c = 299,792,458 m/s, 433.92 MHz gives about 69.1 cm, so a quarter-wave antenna is roughly 17.3 cm.",
    tags: ["units", "sub-ghz", "hardware"]
  }
];
