window.SP_QUIZ_BANK = {
  "primer": [
    {
      "q": "What does \"RF\" actually stand for, and what is it?",
      "opts": [
        "Radio Frequency — invisible electromagnetic waves that carry signals through the air",
        "Rapid Firmware, the code that boots the Flipper",
        "Rolling Function, the way garage codes change",
        "Remote Field, the range of a transmitter"
      ],
      "a": 0,
      "why": "RF means radio frequency: waves that move information wirelessly, from remotes to Wi-Fi."
    },
    {
      "q": "How do different wireless devices mostly avoid talking over each other?",
      "opts": [
        "By using different colors of light",
        "By using different frequencies, like separate stations on a dial",
        "By using different file formats",
        "By taking turns based on battery level"
      ],
      "a": 1,
      "why": "Frequency is the 'channel'. Devices on different frequencies simply don't hear each other."
    },
    {
      "q": "In one sentence, what is modulation?",
      "opts": [
        "The way information is stamped onto a plain carrier wave",
        "The physical length of the antenna",
        "The process of charging the battery",
        "The compression used to shrink a saved file"
      ],
      "a": 0,
      "why": "Modulation is how bits ride the carrier — by changing its amplitude (AM) or its frequency (FM)."
    },
    {
      "q": "A 'protocol' in radio is best described as...",
      "opts": [
        "The frequency the device transmits on",
        "The agreed language and structure both sides use to understand the bits",
        "The brand of the antenna",
        "The plastic case around the electronics"
      ],
      "a": 1,
      "why": "The protocol is the shared rulebook: how the bits are arranged and timed so a receiver can read them."
    },
    {
      "q": "What is the key difference between a fixed code and a rolling code?",
      "opts": [
        "Fixed codes are a different color on screen",
        "A fixed code sends the same value every press; a rolling code sends a new value each press",
        "Fixed codes are NFC and rolling codes are RFID",
        "Rolling codes are simply louder"
      ],
      "a": 1,
      "why": "Fixed codes repeat, so a recording replays forever; rolling codes change each time, so old recordings stop working."
    },
    {
      "q": "Why are 'listening' to a signal and 'transmitting' one treated so differently?",
      "opts": [
        "They are actually identical operations",
        "Listening is passive receiving; transmitting actively emits RF and is legally regulated",
        "Listening drains far more battery than transmitting",
        "Transmitting is always safe and never regulated"
      ],
      "a": 1,
      "why": "Reception can involve protected data. Transmission also requires compliant radio conditions; ownership alone is insufficient."
    }
  ],
  "m00": [
    {
      "q": "On the Flipper, what does the Sub-GHz \"Read\" screen do?",
      "opts": [
        "Transmits the last signal you saved",
        "Listens on a chosen frequency and tries to decode known protocols",
        "Formats the microSD card",
        "Measures the battery voltage"
      ],
      "a": 1,
      "why": "Read is a listen-and-decode tool. It receives; it does not transmit."
    },
    {
      "q": "Where does the Flipper store the signals you capture?",
      "opts": [
        "In internal flash memory only",
        "On the removable microSD card",
        "In an online cloud account",
        "Inside the remote you copied"
      ],
      "a": 1,
      "why": "Saved captures live as files on the microSD card, which is why you can browse and back them up."
    },
    {
      "q": "What is Momentum?",
      "opts": [
        "A clip-on antenna that boosts range",
        "A community custom firmware that adds features to the stock Flipper",
        "A paid mobile app",
        "A subscription service"
      ],
      "a": 1,
      "why": "Momentum is custom firmware for the same Flipper hardware; it reorders menus and adds options but isn't a separate device."
    },
    {
      "q": "Which Sub-GHz menu item lets you record a signal even when the Flipper can't identify its protocol?",
      "opts": [
        "Read",
        "Read RAW",
        "Frequency Analyzer",
        "Add Manually"
      ],
      "a": 1,
      "why": "Read RAW captures the raw waveform timings, so it works even when no known protocol matches."
    },
    {
      "q": "You open Sub-GHz > Read and press your own remote, but nothing appears. What's the most sensible first check?",
      "opts": [
        "Reinstall the firmware",
        "Confirm you're listening on the right frequency and that the remote is actually transmitting",
        "Buy a bigger antenna",
        "Replace the microSD card"
      ],
      "a": 1,
      "why": "A wrong frequency (or a dead remote battery) is by far the most common reason Read shows nothing."
    },
    {
      "q": "Throughout this course, which devices do you capture and replay?",
      "opts": [
        "Any device that happens to be nearby",
        "Only devices you own or have clear permission to test",
        "A neighbor's car, for practice",
        "Public infrastructure signals"
      ],
      "a": 1,
      "why": "The course stays entirely on your own hardware. Capturing or replaying other people's devices is off-limits and often illegal."
    }
  ],
  "m01": [
    {
      "q": "Frequency is measured in hertz (Hz). One hertz means...",
      "opts": [
        "one cycle per second",
        "one meter per cycle",
        "one volt per second",
        "one bit per second"
      ],
      "a": 0,
      "why": "Hertz counts wave cycles per second, so 433.92 MHz is millions of cycles every second."
    },
    {
      "q": "How many hertz is 433.92 MHz?",
      "opts": [
        "433,920 Hz",
        "4,339,200 Hz",
        "433,920,000 Hz",
        "43,392,000 Hz"
      ],
      "a": 2,
      "why": "Mega means million, so 433.92 MHz = 433,920,000 Hz — exactly how the Flipper stores it in a .sub file."
    },
    {
      "q": "The Flipper's CC1101 radio can operate across roughly which ranges?",
      "opts": [
        "1–30 MHz only",
        "300–348, 387–464 and 779–928 MHz",
        "88–108 MHz (the FM broadcast band)",
        "2.4 GHz only"
      ],
      "a": 1,
      "why": "Those three sub-GHz windows are the CC1101's coverage; common remotes sit at 315 and 433.92 MHz."
    },
    {
      "q": "What does the Frequency Analyzer do?",
      "opts": [
        "Decodes a signal's protocol",
        "Finds the strongest signal near you and reports its frequency",
        "Transmits a test tone to measure range",
        "Cracks rolling codes"
      ],
      "a": 1,
      "why": "The Analyzer scans and tells you where the loudest nearby transmitter sits — the frequency to then use in Read."
    },
    {
      "q": "You don't know your own remote's frequency. What's the best first move with the Flipper?",
      "opts": [
        "Guess 433.92 MHz and hope it works",
        "Hold the remote close and press it while the Frequency Analyzer runs",
        "Open Read RAW immediately and save whatever appears",
        "Cycle through every preset in Read until something shows"
      ],
      "a": 1,
      "why": "With the remote close and actually transmitting, the Analyzer reveals the frequency so you can tune Read precisely."
    },
    {
      "q": "A signal shows up in the Frequency Analyzer at about 315.00 MHz. Which device family is most likely?",
      "opts": [
        "A Wi-Fi router",
        "A North American car key fob or garage remote",
        "An FM radio station",
        "A Bluetooth headset"
      ],
      "a": 1,
      "why": "315 MHz is a common North American remote frequency, while 433.92 MHz is more common in Europe."
    },
    {
      "q": "The RSSI number on the Analyzer roughly indicates...",
      "opts": [
        "the data the signal is carrying",
        "the received signal strength",
        "the modulation type",
        "the Flipper's battery level"
      ],
      "a": 1,
      "why": "RSSI is the received signal strength indicator: a higher value means a stronger, usually closer, transmitter."
    },
    {
      "q": "If you run the Frequency Analyzer while your remote is NOT being pressed, it will...",
      "opts": [
        "still display your remote's frequency from memory",
        "show only background noise or whatever else is transmitting",
        "damage the remote",
        "replay the last decoded signal"
      ],
      "a": 1,
      "why": "The Analyzer only sees signals live on the air right then. A silent remote is invisible to it."
    }
  ],
  "m02": [
    {
      "q": "What is modulation?",
      "opts": [
        "The frequency the carrier uses",
        "How information is stamped onto a carrier wave",
        "The length of the antenna",
        "The format a signal is saved in"
      ],
      "a": 1,
      "why": "Modulation is the scheme that encodes data onto the carrier — by amplitude (AM) or frequency (FM)."
    },
    {
      "q": "OOK (on-off keying) is a simple form of which modulation family?",
      "opts": [
        "Frequency modulation",
        "Amplitude modulation",
        "Phase modulation",
        "Digital compression"
      ],
      "a": 1,
      "why": "OOK just switches the carrier on and off — the on/off is a change in amplitude, so it's AM."
    },
    {
      "q": "FSK (frequency-shift keying) encodes bits by...",
      "opts": [
        "turning the carrier fully on and off",
        "shifting the carrier between two frequencies",
        "physically moving the antenna",
        "varying the speaker volume"
      ],
      "a": 1,
      "why": "FSK hops the carrier between frequencies to represent 0s and 1s — it's a digital form of FM."
    },
    {
      "q": "The stock preset AM650 uses which modulation family?",
      "opts": [
        "AM / OOK",
        "FM / FSK",
        "Both at once",
        "Neither"
      ],
      "a": 0,
      "why": "AM650 is amplitude modulation (OOK) with roughly a 650 kHz bandwidth."
    },
    {
      "q": "Which set lists the Flipper's four stock modulation presets?",
      "opts": [
        "AM270, AM650, FM238, FM476",
        "AM100, AM200, FM300, FM400",
        "OOK1, OOK2, FSK1, FSK2",
        "AM, FM, PM, QAM"
      ],
      "a": 0,
      "why": "These are the four default presets. Official firmware and compatible forks can also load custom presets."
    },
    {
      "q": "In a preset name like \"AM650\", the number 650 refers roughly to...",
      "opts": [
        "the frequency in MHz",
        "the receiver bandwidth in kHz",
        "the bit rate",
        "the key length"
      ],
      "a": 1,
      "why": "The number is the approximate filter bandwidth in kHz — how wide a slice of spectrum the preset listens to."
    },
    {
      "q": "A remote decodes cleanly on AM650 but is complete garbage on FM238. Why?",
      "opts": [
        "The remote is broken",
        "It's an amplitude-modulated (OOK) signal, so an FM preset can't read it",
        "The frequency must be wrong",
        "The microSD card is full"
      ],
      "a": 1,
      "why": "The preset's modulation must match the signal's. An OOK remote needs an AM preset; an FM preset sees noise."
    },
    {
      "q": "Your OOK signal reads faint and clipped on AM650, with a lot of noise. A reasonable thing to try is...",
      "opts": [
        "switch to AM270, a narrower bandwidth that rejects more off-channel noise",
        "switch to FM476 to change the modulation",
        "change the file format",
        "reformat the microSD card"
      ],
      "a": 0,
      "why": "Staying in AM but narrowing the bandwidth (AM270) can clean up a weak, noisy read without changing modulation."
    },
    {
      "q": "What does FM238 mean in the official preset list?",
      "opts": [
        "238 kHz bandwidth",
        "About 2.38 kHz deviation with about 270 kHz receive bandwidth",
        "238 MHz carrier",
        "238 dBm signal power"
      ],
      "a": 1,
      "why": "The official reading guide distinguishes frequency deviation from receive bandwidth. FM476 uses about 47.6 kHz deviation."
    }
  ],
  "m03": [
    {
      "q": "In a captured .sub key file, what does the `Protocol:` line tell you?",
      "opts": [
        "The frequency in MHz",
        "The decoding scheme the Flipper matched, such as Princeton",
        "The size of the file",
        "The battery level at capture time"
      ],
      "a": 1,
      "why": "Protocol names the known encoding the Flipper recognized, which is what lets it show clean Bit/Key/TE values."
    },
    {
      "q": "A .sub file contains `Bit: 24`. What does that mean?",
      "opts": [
        "The file is 24 bytes long",
        "The code word is 24 bits long",
        "The remote has 24 buttons",
        "It transmits at 24 MHz"
      ],
      "a": 1,
      "why": "Bit is the length of the transmitted code word. A 24-bit code has about 16 million possible values."
    },
    {
      "q": "The line `TE: 400` in a decoded .sub file refers to...",
      "opts": [
        "the device temperature",
        "the timing element — the base pulse duration in microseconds",
        "the transmit power",
        "the total energy used"
      ],
      "a": 1,
      "why": "TE is the base timing unit (here 400 µs); the protocol builds its 0s and 1s from multiples of it."
    },
    {
      "q": "Which line typically appears at the very top of a Flipper Sub-GHz key file?",
      "opts": [
        "Filetype: Flipper SubGhz Key File",
        "<html>",
        "BEGIN TRANSMISSION",
        "Preset: none"
      ],
      "a": 0,
      "why": "That header identifies the file as a Flipper Sub-GHz key file; it's followed by Version, Frequency, Preset, and so on."
    },
    {
      "q": "A capture shows `Preset: FuriHalSubGhzPresetOok650Async`. What does that tell you about how it was recorded?",
      "opts": [
        "FM at 476 kHz bandwidth",
        "OOK (amplitude modulation) at about 650 kHz bandwidth",
        "That it is a rolling code",
        "That it was captured at 315 MHz"
      ],
      "a": 1,
      "why": "The preset name encodes 'Ook650': on-off keying (AM) with a ~650 kHz bandwidth — the AM650 preset."
    },
    {
      "q": "Nice FLO is best described as a...",
      "opts": [
        "12-bit fixed-code protocol",
        "rolling-code cipher",
        "13.56 MHz NFC standard",
        "125 kHz RFID tag"
      ],
      "a": 0,
      "why": "Nice FLO sends a simple 12-bit fixed code. Its rolling-code sibling is Nice FloR-S."
    },
    {
      "q": "You press the same fixed-code remote twice and get two identical `Key:` values. That is...",
      "opts": [
        "a decoding bug",
        "exactly what you'd expect from a fixed code",
        "proof the remote is rolling-code",
        "a sign of radio interference"
      ],
      "a": 1,
      "why": "Fixed-code remotes send the same key every press, so identical captures are completely normal."
    },
    {
      "q": "The line `Frequency: 433920000` in a .sub file is expressed in which unit?",
      "opts": [
        "kilohertz",
        "hertz",
        "megahertz",
        "gigahertz"
      ],
      "a": 1,
      "why": "The Flipper stores frequency in hertz, so 433920000 Hz is simply 433.92 MHz written out."
    }
  ],
  "m04": [
    {
      "q": "Replaying a saved .sub file means the Flipper...",
      "opts": [
        "listens for the same signal again",
        "transmits the recorded signal back out",
        "permanently deletes the capture",
        "re-decodes the file on screen"
      ],
      "a": 1,
      "why": "Replay is a transmit action: it emits the stored waveform on the same frequency and preset."
    },
    {
      "q": "What is required before a course RF replay lab?",
      "opts": [
        "Any garage door in range",
        "An authorized lab target and verified radio/privacy conditions",
        "A neighbor's gate, as a demonstration",
        "Emergency service radios"
      ],
      "a": 1,
      "why": "Ownership or permission is only one part; technical radio conditions and data rights also apply."
    },
    {
      "q": "Why is merely listening (Read) treated differently from transmitting?",
      "opts": [
        "They are effectively identical",
        "Listening is passive and lower-risk; transmitting actively emits RF and is regulated",
        "Listening uses far more battery",
        "Transmitting is always legal, so it needs no care"
      ],
      "a": 1,
      "why": "Sub-GHz reception does not send a command, but interception/privacy rules can still apply. RFID/NFC reading also energizes a tag."
    },
    {
      "q": "A documented rolling-code receiver rejects a consumed message. Why?",
      "opts": [
        "the gate uses a rolling code, so a replayed old code is rejected",
        "the microSD card is full",
        "the Flipper can't transmit at all",
        "you only need a longer antenna"
      ],
      "a": 0,
      "why": "The stated protocol rejects previously accepted values. A failed replay without protocol evidence would not establish this diagnosis."
    },
    {
      "q": "The Flipper's built-in transmitter is low-power. That mainly limits...",
      "opts": [
        "the usable range",
        "the file format",
        "the frequency range it covers",
        "how many captures you can save"
      ],
      "a": 0,
      "why": "Low transmit power means short range; an external CC1101 module and antenna is the usual way to extend it."
    },
    {
      "q": "Community brute-force and jammer apps are mentioned in this course only to explain that they...",
      "opts": [
        "are recommended everyday tools",
        "have security implications and require more than owning a receiver",
        "ship enabled by default in Momentum",
        "improve transmit range"
      ],
      "a": 1,
      "why": "Jamming disrupts spectrum users and is not authorized merely because you own a receiver. Use the course model for interference concepts."
    },
    {
      "q": "Why does a straight replay work reliably on a fixed-code remote?",
      "opts": [
        "The Flipper re-derives a new key each time",
        "The same code is valid on every press, so a recording keeps working",
        "It quietly jams the receiver first",
        "It correctly guesses the next counter value"
      ],
      "a": 1,
      "why": "Fixed codes accept the identical value indefinitely, which is exactly why a single recording replays fine — and why they're weak."
    },
    {
      "q": "Does an educational label or device ownership exempt a radio experiment from Romanian conditions?",
      "opts": [
        "Yes",
        "No",
        "Only if Momentum is installed"
      ],
      "a": 1,
      "why": "Check authorization, ANCOM interface conditions, and data/privacy scope separately."
    }
  ],
  "m05": [
    {
      "q": "Read RAW is the right tool when...",
      "opts": [
        "you already know the protocol and just want to save it",
        "the Flipper can't recognize the protocol and you want the raw waveform anyway",
        "you want to transmit a saved file",
        "you're reading a 125 kHz RFID fob"
      ],
      "a": 1,
      "why": "RAW records the timing waveform directly, so it works even when no known protocol matches."
    },
    {
      "q": "In a RAW capture file, the `RAW_Data:` lines contain...",
      "opts": [
        "hexadecimal key values",
        "alternating positive and negative durations in microseconds",
        "a list of frequencies",
        "plain ASCII text of the message"
      ],
      "a": 1,
      "why": "RAW stores the signal as signed microsecond timings — positive for on, negative for off — not as a decoded key."
    },
    {
      "q": "Why does a rolling code produce a different value on every press?",
      "opts": [
        "The transmit frequency changes each time",
        "A counter plus a cipher generates a fresh code for each press",
        "The battery voltage sags",
        "The antenna physically moves"
      ],
      "a": 1,
      "why": "An incrementing counter feeds a cipher, so each transmission is unique and single-use."
    },
    {
      "q": "On the Flipper's Read screen, a Nice FloR-S remote shows a `Cnt` value that...",
      "opts": [
        "stays fixed no matter what",
        "increments each time you press the button",
        "is actually the frequency",
        "shows the battery percentage"
      ],
      "a": 1,
      "why": "Cnt is the rolling counter. Watching it step up each press is a clear tell that the remote is rolling-code."
    },
    {
      "q": "KeeLoq is...",
      "opts": [
        "an NFC chip",
        "a classic rolling-code cipher from Microchip",
        "a 12-bit fixed code",
        "a type of antenna"
      ],
      "a": 1,
      "why": "KeeLoq is the well-known rolling-code cipher behind many garage and car remotes."
    },
    {
      "q": "You record ONE press of your own Nice FloR-S gate remote and replay it. The gate opens — then replaying that same file again does nothing. Why?",
      "opts": [
        "The gate has broken",
        "The rolling counter moved past that code, so the receiver won't accept the old one again",
        "Your frequency drifted between attempts",
        "The saved file corrupted itself"
      ],
      "a": 1,
      "why": "An unused rolling code can work once, but once the counter advances the old value is rejected — the point of rolling codes."
    },
    {
      "q": "Why do rolling codes exist in the first place?",
      "opts": [
        "To save battery",
        "To stop a simple recording from being replayed later",
        "To increase transmit range",
        "To shrink the saved file"
      ],
      "a": 1,
      "why": "They defeat naive record-and-replay by making each code usable only once."
    },
    {
      "q": "Security+ 2.0 (Chamberlain / LiftMaster) is best classified as a...",
      "opts": [
        "fixed code",
        "rolling code",
        "125 kHz RFID protocol",
        "13.56 MHz NFC tag"
      ],
      "a": 1,
      "why": "Security+ 2.0 is a modern rolling-code system, so a straight replay of one capture won't reliably reopen the door."
    },
    {
      "q": "Does a forward window normally make a consumed counter valid again?",
      "opts": [
        "Yes, at random",
        "No; old values remain behind the accepted counter",
        "Only with a larger antenna"
      ],
      "a": 1,
      "why": "A forward window tolerates future values; it does not move a used value into the future."
    }
  ],
  "m06": [
    {
      "q": "125 kHz RFID sits in which frequency band?",
      "opts": [
        "LF (low frequency)",
        "HF (high frequency)",
        "UHF",
        "Sub-GHz remote band"
      ],
      "a": 0,
      "why": "125 kHz is low frequency (LF), a separate world from 13.56 MHz NFC and from sub-GHz remotes."
    },
    {
      "q": "EM4100 (EM-Marin) is best described as a...",
      "opts": [
        "rolling-code garage protocol",
        "common read-only 125 kHz RFID tag format",
        "13.56 MHz NFC standard",
        "Wi-Fi chip"
      ],
      "a": 1,
      "why": "EM4100 tags carry a fixed ID and are very common in access fobs; the Flipper reads them easily."
    },
    {
      "q": "What makes a T5577 chip useful?",
      "opts": [
        "It is a permanently read-only tag",
        "It's a writable 125 kHz blank you can program to emulate formats like EM4100 or HID",
        "It is an NFC payment card",
        "It generates rolling codes"
      ],
      "a": 1,
      "why": "T5577 blanks support writing compatible training IDs. Use unenrolled lab tags and an authorized standalone reader."
    },
    {
      "q": "HID Prox (H10301) and Indala are...",
      "opts": [
        "13.56 MHz NFC formats",
        "other 125 kHz LF access-card formats, alongside EM4100",
        "sub-GHz garage remotes",
        "battery chemistries"
      ],
      "a": 1,
      "why": "They're LF proximity-card families the Flipper recognizes among its 125 kHz options."
    },
    {
      "q": "Your Flipper reads your own office fob as EM4100 and shows its ID. To carry a copy on a blank you own, you would...",
      "opts": [
        "emulate it, or write the ID to a T5577 blank you own",
        "transmit it on 433 MHz",
        "read it again with the NFC app",
        "jam the door reader"
      ],
      "a": 0,
      "why": "LF tags can be emulated live or written to a writable T5577 — only ever for tags you're authorized to duplicate."
    },
    {
      "q": "Typical read range for 125 kHz LF tags is about...",
      "opts": [
        "tens of meters",
        "a few centimeters",
        "a full kilometer",
        "effectively unlimited"
      ],
      "a": 1,
      "why": "LF works by near-field coupling, so the reader and tag must be within a few centimeters."
    },
    {
      "q": "A 125 kHz EM4100 fob and a 13.56 MHz NFC card are...",
      "opts": [
        "the same technology with different names",
        "different technologies operating on different frequencies",
        "both rolling-code systems",
        "both sub-GHz remotes"
      ],
      "a": 1,
      "why": "LF (125 kHz) and HF (13.56 MHz) are distinct RFID technologies; the Flipper uses different apps for each."
    }
  ],
  "m07": [
    {
      "q": "NFC operates at which frequency?",
      "opts": [
        "125 kHz",
        "13.56 MHz",
        "433.92 MHz",
        "2.4 GHz"
      ],
      "a": 1,
      "why": "NFC is a high-frequency (HF) technology at 13.56 MHz, distinct from 125 kHz LF RFID."
    },
    {
      "q": "Most contactless cards and tags the Flipper reads follow which standard family?",
      "opts": [
        "ISO 14443",
        "ISO 9001",
        "IEEE 802.11",
        "RS-232"
      ],
      "a": 0,
      "why": "ISO 14443 defines how common 13.56 MHz proximity cards, including Mifare and bank cards, communicate."
    },
    {
      "q": "A tag's UID is...",
      "opts": [
        "the card's stored money balance",
        "a unique identifier the tag reports",
        "the frequency it uses",
        "its secret encryption key"
      ],
      "a": 1,
      "why": "The UID is a public serial number. It is not the same as the secret keys that protect a card's data."
    },
    {
      "q": "Reading an EMV bank card with the Flipper gives you...",
      "opts": [
        "the full PIN and CVV",
        "only limited public data",
        "the account password",
        "nothing readable at all"
      ],
      "a": 1,
      "why": "EMV cards expose only limited public information; the sensitive secrets stay protected on the chip."
    },
    {
      "q": "Mifare Classic and NTAG are...",
      "opts": [
        "sub-GHz remote protocols",
        "13.56 MHz NFC tag types",
        "125 kHz LF fobs",
        "antenna models"
      ],
      "a": 1,
      "why": "Both are HF NFC tag families the Flipper can work with at 13.56 MHz."
    },
    {
      "q": "You read a Mifare Classic card: its UID appears instantly, but the data sectors stay locked. Why?",
      "opts": [
        "The Flipper is malfunctioning",
        "Those sectors are protected by keys you don't have",
        "You're on the wrong frequency",
        "It's actually a 125 kHz LF tag"
      ],
      "a": 1,
      "why": "The UID is public and read instantly, but Mifare data sectors need keys; without them the content stays locked."
    }
  ],
  "m08": [
    {
      "q": "Where can supported Flipper builds load custom modulation presets?",
      "opts": [
        "By soldering new components",
        "Through a user settings file on the microSD card",
        "Via a cloud account login",
        "By attaching a new antenna"
      ],
      "a": 1,
      "why": "Custom preset configuration is stored on the SD card; this capability is not exclusive to Momentum."
    },
    {
      "q": "What does the 'extended frequency' option in custom firmware do — and what's the catch?",
      "opts": [
        "It's always legal everywhere with no downside",
        "It unlocks frequencies outside the default set, which may be illegal to transmit on in your region",
        "It adds NFC support",
        "It doubles battery life"
      ],
      "a": 1,
      "why": "Unlocking extra frequencies doesn't make transmitting on them legal; local rules still apply."
    },
    {
      "q": "An external CC1101 module is mainly used to...",
      "opts": [
        "read NFC cards",
        "improve sub-GHz range and sensitivity with a better antenna",
        "add Bluetooth",
        "expand file storage"
      ],
      "a": 1,
      "why": "An external CC1101 board with a proper antenna extends the sub-GHz range the low-power built-in radio can't reach."
    },
    {
      "q": "You want more sub-GHz range than the built-in radio gives. Which is a legitimate hardware step?",
      "opts": [
        "Attach an external CC1101 module with a suitable antenna",
        "Increase the saved file's size",
        "Switch the capture to NFC",
        "Delete unused presets"
      ],
      "a": 0,
      "why": "Range is a radio-and-antenna problem, so the external CC1101 board is the standard upgrade."
    },
    {
      "q": "Momentum firmware is built...",
      "opts": [
        "for a completely different device",
        "on top of the stock Flipper firmware base, for the same hardware",
        "to run on an Android phone",
        "to run on a PC"
      ],
      "a": 1,
      "why": "It's community firmware for the same Flipper; it changes software behavior, not the underlying hardware."
    },
    {
      "q": "Even with extended frequencies unlocked, the course rule is to...",
      "opts": [
        "transmit on any frequency you like",
        "only transmit legally, on bands and devices you're allowed to use",
        "jam freely to test range",
        "ignore regional regulations"
      ],
      "a": 1,
      "why": "Capability isn't permission. Extra options don't change the law or the own-devices-only rule."
    },
    {
      "q": "Which capability is already supported by official firmware?",
      "opts": [
        "External CC1101 modules",
        "Wi-Fi through the internal CC1101",
        "Permission to transmit anywhere"
      ],
      "a": 0,
      "why": "Current official Sub-GHz documentation includes external CC1101 support."
    }
  ],
  "m09": [
    {
      "q": "Read shows nothing when you press your own remote. What's the best first check?",
      "opts": [
        "Confirm the frequency and modulation preset are correct, or run the Frequency Analyzer",
        "Replace the whole Flipper",
        "Reformat the microSD card",
        "Reinstall the firmware"
      ],
      "a": 0,
      "why": "A wrong frequency or preset is the most common cause of a silent Read; the Analyzer settles it quickly."
    },
    {
      "q": "The Frequency Analyzer shows a strong signal, but Read refuses to decode it into a protocol. A reasonable next step is...",
      "opts": [
        "give up on that device",
        "use Read RAW to capture the waveform even without a known protocol",
        "transmit random codes",
        "delete your saved files"
      ],
      "a": 1,
      "why": "RAW captures signals the decoder doesn't recognize, so you can still record and (for your own device) replay them."
    },
    {
      "q": "Replay works on your test remote but not on your car key. The most likely explanation is...",
      "opts": [
        "the car key uses a rolling code",
        "the Flipper is broken",
        "you used the wrong microSD card",
        "the battery is dead"
      ],
      "a": 0,
      "why": "Modern car keys use rolling codes, which reject a replayed old code even when the capture looked perfect."
    },
    {
      "q": "A capture decodes fine, but the `Key:` value is different on every press of the same button. That indicates...",
      "opts": [
        "a fixed code",
        "a rolling code",
        "a broken remote",
        "the wrong preset"
      ],
      "a": 1,
      "why": "A changing key each press is the defining signature of a rolling code."
    },
    {
      "q": "Your replay only reaches a few centimeters. A sensible improvement is...",
      "opts": [
        "add an external CC1101 module and antenna",
        "buy a bigger microSD card",
        "save more copies of the file",
        "rename the file"
      ],
      "a": 0,
      "why": "Range is a radio and antenna issue; storage and file names have nothing to do with it."
    },
    {
      "q": "The Frequency Analyzer keeps landing on a random frequency with nothing useful on it. The likely cause is...",
      "opts": [
        "it's locking onto background noise or another transmitter",
        "the Flipper is broken",
        "the microSD card is full",
        "NFC is interfering"
      ],
      "a": 0,
      "why": "With no strong intended signal present, the Analyzer just reports whatever is loudest nearby — often noise."
    },
    {
      "q": "You captured on AM650 and the decode looks partial and garbled. It's worth trying...",
      "opts": [
        "a different modulation or bandwidth preset, such as AM270 or an FM preset",
        "a new microSD card",
        "deleting the firmware",
        "nothing — garbled means the device is unreadable"
      ],
      "a": 0,
      "why": "A mismatched modulation or bandwidth is a classic cause of garbled decodes; changing the preset often fixes it."
    }
  ],
  "m10": [
    {
      "q": "You find an unknown remote. What's the sensible order of tools?",
      "opts": [
        "Transmit first, then figure out what it was",
        "Frequency Analyzer to find the frequency, then Read with the right preset, then Read RAW if needed",
        "Try NFC, then LF, then sub-GHz at random",
        "Delete, save, then replay"
      ],
      "a": 1,
      "why": "Find the frequency, decode with a matching preset, and fall back to RAW only when no protocol is recognized."
    },
    {
      "q": "Which line correctly matches a frequency to its technology?",
      "opts": [
        "125 kHz is NFC; 13.56 MHz is LF RFID",
        "433.92 MHz is a sub-GHz remote; 13.56 MHz is NFC",
        "315 MHz is NFC; 125 kHz is sub-GHz",
        "Everything above is really just NFC"
      ],
      "a": 1,
      "why": "Sub-GHz remotes sit around 300–928 MHz, NFC is 13.56 MHz, and LF RFID is 125 kHz."
    },
    {
      "q": "A device replays perfectly every single time from one recording. It almost certainly uses...",
      "opts": [
        "a rolling code",
        "a fixed code",
        "KeeLoq",
        "Security+ 2.0"
      ],
      "a": 1,
      "why": "Only fixed codes replay indefinitely; every rolling-code system (KeeLoq, Security+ 2.0) rejects a reused code."
    },
    {
      "q": "What is the single most important rule of this whole course?",
      "opts": [
        "Always chase maximum range",
        "Only capture and replay devices you own or are authorized to test",
        "Transmit whenever possible",
        "Never use Read RAW"
      ],
      "a": 1,
      "why": "Course labs require appropriate authority, radio conditions, and respect for data privacy. A label or ownership claim does not establish legality."
    },
    {
      "q": "You capture a 433.92 MHz remote: it decodes as Princeton with `Bit: 24`, and every press gives the same key. Your atlas entry should record it as...",
      "opts": [
        "a rolling-code remote",
        "an NFC tag",
        "a 24-bit fixed-code OOK remote",
        "a 125 kHz LF RFID fob"
      ],
      "a": 2,
      "why": "Princeton is OOK, the repeated key means fixed-code, and Bit: 24 gives the length — a 24-bit fixed OOK remote."
    }
  ],
  "m11": [
    {
      "q": "What does the 38 kHz figure describe here?",
      "opts": [
        "The TV screen refresh rate",
        "Modulation of the infrared light",
        "A Sub-GHz radio channel"
      ],
      "a": 1,
      "why": "The learning receiver demodulates the IR carrier."
    },
    {
      "q": "Which is the clearest first test?",
      "opts": [
        "One learned volume-down command on your own TV",
        "A universal remote sweep in a shop",
        "Repeated power commands to every visible screen"
      ],
      "a": 0,
      "why": "A single expected change makes the result attributable and limits unintended effects."
    },
    {
      "q": "RAW means…",
      "opts": [
        "The command is encrypted",
        "The appliance must accept the recording",
        "Timings were captured without a named protocol"
      ],
      "a": 2,
      "why": "RAW is a representation, not a guarantee of compatibility."
    }
  ],
  "m12": [
    {
      "q": "Why put a resistor in series with the LED?",
      "opts": [
        "To limit current",
        "To raise the supply to 5 V",
        "To encrypt the output"
      ],
      "a": 0,
      "why": "An LED is not a current-limiting load."
    },
    {
      "q": "The Flipper has a 5 V supply pin. What follows?",
      "opts": [
        "All GPIO pins accept any 5 V signal",
        "A resistor is unnecessary",
        "Signal-pin voltage limits must still be checked"
      ],
      "a": 2,
      "why": "Power outputs and logic inputs have different constraints."
    },
    {
      "q": "What does a UART connection need?",
      "opts": [
        "A Sub-GHz antenna",
        "Compatible levels, framing, baud rate, and common ground",
        "Only a matching plug"
      ],
      "a": 1,
      "why": "Electrical and serial settings both matter."
    }
  ],
  "m13": [
    {
      "q": "What determines where the script types?",
      "opts": [
        "The filename of the script",
        "The nearest browser tab",
        "The currently focused application"
      ],
      "a": 2,
      "why": "HID input goes to the active input target."
    },
    {
      "q": "How should you handle an unfamiliar payload?",
      "opts": [
        "Assume its educational label guarantees safety",
        "Read and understand every command before considering a lab run",
        "Run it to discover its purpose"
      ],
      "a": 1,
      "why": "A label does not constrain what the script does."
    },
    {
      "q": "Can the internal CC1101 become a Wi-Fi radio?",
      "opts": [
        "No; it is different hardware",
        "Yes, with any custom firmware",
        "Yes, by changing the keyboard layout"
      ],
      "a": 0,
      "why": "Software cannot add an absent radio interface."
    }
  ],
  "m14": [
    {
      "q": "Does a UID alone prove authorization?",
      "opts": [
        "Only if it is written in hexadecimal",
        "No; that depends on the system’s authentication and policy",
        "Yes, on every reader"
      ],
      "a": 1,
      "why": "An identifier and evidence of authority are different things."
    },
    {
      "q": "What comes before registering a learning device as a second factor?",
      "opts": [
        "An independent, verified recovery method",
        "Deleting all other account recovery",
        "Publishing the key files"
      ],
      "a": 0,
      "why": "Avoid making a disposable learning setup the sole route into an account."
    },
    {
      "q": "Are all iButtons identical internally?",
      "opts": [
        "Yes; every one stores the same data",
        "They are all NFC cards",
        "No; capabilities depend on the model"
      ],
      "a": 2,
      "why": "The official read guide lists different data for different Dallas types."
    }
  ],
  "m15": [
    {
      "q": "What is a .fap?",
      "opts": [
        "An external application built for a compatible SDK/firmware",
        "A full operating-system image",
        "A Sub-GHz recording"
      ],
      "a": 0,
      "why": "Apps and full firmware are different artifacts."
    },
    {
      "q": "What does a successful compilation establish?",
      "opts": [
        "The radio works legally everywhere",
        "All hardware behaviour has been tested",
        "The source built against that SDK"
      ],
      "a": 2,
      "why": "You still need runtime checks on compatible hardware."
    },
    {
      "q": "Why clean up queues and viewports?",
      "opts": [
        "To change the firmware region",
        "To release resources when the app exits",
        "To improve radio transmit power"
      ],
      "a": 1,
      "why": "A small app should leave the system usable after repeated runs."
    }
  ],
  "m16": [
    {
      "q": "What distinguishes relay from replay?",
      "opts": [
        "They are always identical",
        "Relay automatically reveals the cryptographic key",
        "Relay forwards a live exchange; replay repeats a recording"
      ],
      "a": 2,
      "why": "A fresh response can still be relayed; freshness and distance are different properties."
    },
    {
      "q": "Does encryption alone necessarily reject an old valid message?",
      "opts": [
        "Only when the antenna is long",
        "No; the protocol also needs an appropriate freshness check",
        "Yes, in every system"
      ],
      "a": 1,
      "why": "Confidentiality and replay protection are separate design goals."
    },
    {
      "q": "Why use a negative control?",
      "opts": [
        "To check whether acceptance depends on the credential or message under test",
        "To attack a nearby system",
        "To increase transmitter power"
      ],
      "a": 0,
      "why": "A non-matching training input tests an alternative explanation."
    },
    {
      "q": "What can an accepted copied UID establish?",
      "opts": [
        "That all NFC encryption is broken",
        "That the device is authorized everywhere",
        "That this tested configuration accepted that identifier"
      ],
      "a": 2,
      "why": "Report the tested configuration and scope, not a universal claim."
    }
  ],
  "m17": [
    {
      "q": "What is the strongest result statement?",
      "opts": [
        "The firmware made it legal",
        "Five of five trials succeeded at a recorded distance and orientation",
        "It always works"
      ],
      "a": 1,
      "why": "A bounded observation can be checked and reproduced."
    },
    {
      "q": "A changing payload proves…",
      "opts": [
        "Only that the payload changed; its meaning needs more evidence",
        "That a rolling cipher was defeated",
        "That the battery is flat"
      ],
      "a": 0,
      "why": "Sensors, counters, checksums and security schemes can all produce changes."
    },
    {
      "q": "A browser badge establishes…",
      "opts": [
        "Professional certification",
        "Permission to test any system",
        "Self-reported course progress"
      ],
      "a": 2,
      "why": "Real proficiency needs explanation, repeatability and judgment."
    }
  ],
  "m18": [
    {
      "q": "The official Wi-Fi Devboard’s radio can use…",
      "opts": [
        "5 GHz and Bluetooth Classic",
        "2.4 GHz Wi-Fi; no Bluetooth",
        "Every radio present on other ESP32 chips"
      ],
      "a": 1,
      "why": "The official accessory uses an ESP32-S2. Hardware capabilities differ between ESP32 variants."
    },
    {
      "q": "A Marauder companion opens, but the board still has Black Magic firmware. What is missing?",
      "opts": [
        "A longer Sub-GHz antenna",
        "An NFC key",
        "Matching Marauder firmware on the ESP32-S2 board"
      ],
      "a": 2,
      "why": "The companion is a Flipper app. It cannot issue Marauder commands to a different board application."
    },
    {
      "q": "Which board firmware is intended for SWD breakpoints and stepping?",
      "opts": [
        "Official Black Magic / CMSIS-DAP",
        "A standalone captive portal",
        "Any app with Wi-Fi in its name"
      ],
      "a": 0,
      "why": "The official developer firmware turns the board into a debug probe."
    },
    {
      "q": "Before replacing a board image, what should you establish?",
      "opts": [
        "A matching target, backup and recovery path",
        "That every ESP32 image shares flash offsets",
        "That changing the Flipper theme updates the board"
      ],
      "a": 0,
      "why": "Record the exact board and release. Image layout and recovery are specific to the target."
    },
    {
      "q": "An AP discovery feature is necessarily passive. True?",
      "opts": [
        "Yes, because it does not associate",
        "Yes, if it shows only SSIDs",
        "No; active discovery sends probe requests"
      ],
      "a": 2,
      "why": "Inspect the implementation. The menu label alone does not establish whether it transmits."
    },
    {
      "q": "A suitable WPA2-Personal handshake capture gives you…",
      "opts": [
        "The plaintext password immediately",
        "Material that may support offline password guesses",
        "Proof that WPA3-SAE is broken"
      ],
      "a": 1,
      "why": "A capture and a recovered password are different results. Strong passphrases resist guessing."
    },
    {
      "q": "What does negotiated PMF help protect?",
      "opts": [
        "All RF energy in the room",
        "Relevant robust management frames, including deauthentication",
        "A user who types a password into any website"
      ],
      "a": 1,
      "why": "PMF addresses specific management-frame attacks; it does not eliminate all interference or phishing."
    },
    {
      "q": "Why switch off your lab AP and repeat a fresh scan?",
      "opts": [
        "To crack its encryption",
        "To increase RSSI",
        "To test whether the observed entry actually depends on that AP"
      ],
      "a": 2,
      "why": "A negative control helps separate a current observation from stale results or a different transmitter."
    }
  ]
};
