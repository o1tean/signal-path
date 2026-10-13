/* FAQ shown on the home and pricing pages. Copy: docs/v2/copy/pricing.md, sections faq-* (ids are stable).
   `{lessons}` is filled from the lesson collection by Faq.astro. */

export interface FaqEntry {
  id: string;
  q: string;
  a: string;
  link?: { label: string; href: string };
}

export const faq: readonly FaqEntry[] = [
  {
    id: 'legal',
    q: 'Is this legal?',
    a: 'Signal Path is made of lessons, browser simulators that never touch a radio, and labs on your own equipment. Whether a hardware test is lawful depends on three things. Do you have authority over the equipment and data? Which radio conditions apply where you are? What could your test affect? Every lab in Signal Path uses equipment you own or have written permission to test, and lessons that transmit say so at the top. The Romanian lab guide covers ANCOM\'s radio interfaces and the relevant Criminal Code articles. Outside Romania, check your national regulator. The course is a learning guide and is not legal advice.',
    link: { label: 'Read the Romanian lab guide', href: '/romania-lab-guide' },
  },
  {
    id: 'hardware',
    q: 'What hardware do I need?',
    a: 'To start, a browser. For the hardware labs: a Flipper Zero, a microSD card, a USB cable, and an infrared remote and TV you own. For radio practice, a fixed-code training doorbell or chime that is legal to use where you live. Later lessons add unenrolled RFID and NFC practice tags and a standalone training reader. Stage 3 adds a breadboard, an LED, a 1 kΩ resistor and jumper wires. Module 18 needs the official Wi-Fi Devboard. The core course needs no external radio module, and each lesson lists its gear at the top.',
    link: { label: 'Full gear list', href: '/course#gear' },
  },
  {
    id: 'time',
    q: 'How long does it take?',
    a: 'The core path is 12 weeks at 2–4 hours a week. Most lessons take 30–60 minutes, plus practice. The Wi-Fi Devboard extension adds 3–4 sessions. The weeks are a suggested order. Take longer if you need to; your progress is saved.',
  },
  {
    id: 'no-flipper',
    q: 'Can I start without a Flipper?',
    a: 'Yes. Modules 0 and 1 begin with browser tools that run on synthetic signals, including a Flipper screen you can drive with an on-screen D-pad. You can learn the menus and read your first frequency before you own the device. The hardware labs need a Flipper Zero, so plan to have one by Stage 1.',
    link: { label: 'Start Module 0', href: '/learn/00-setup' },
  },
  {
    id: 'firmware',
    q: 'Do I need Momentum or another firmware fork?',
    a: 'No. Every lesson works on the official firmware, with its region restrictions left on. Module 8 covers what forks such as Momentum add and how to choose one with a backup and a way back. Installing one is optional.',
  },
  {
    id: 'refund',
    q: 'What is the refund policy?',
    a: 'Ask within 30 days of buying and you get a full refund, no reason needed. Request it from your account page or by email to [NEED: support email]. We close the paid lessons when we issue the refund; your notes and progress stay in your account. After day 30, the Stage 1 promise still applies. Finish the Stage 1 labs with a notebook entry for each. If the entries still can\'t explain your first capture, send them within [NEED: window] of buying for a full refund.',
    link: { label: 'Refund policy', href: '/legal/refunds' },
  },
  {
    id: 'updates',
    q: 'Do I get updates?',
    a: 'Yes. When we correct or rewrite a lesson, or re-check it against new firmware, you get the update at no extra cost. Each lesson shows the date its sources were last reviewed, and the sources page lists corrections. Updates cover the course you bought; any new courses would be sold separately.',
    link: { label: 'Sources and corrections', href: '/sources' },
  },
  {
    id: 'certification',
    q: 'Is this a certification?',
    a: 'No. Signal Path does not issue a certificate or an accredited qualification, and completion badges are self-reported. You finish with a lab notebook and a final portfolio, which is a repeatable experiment another person can follow and check.',
  },
  {
    id: 'account',
    q: 'Do I need an account?',
    a: 'Not for the free lessons. Progress is saved in your browser. A free account, using only your email, saves progress across devices and gets you the cheat sheet. Buying Complete needs an account so we can attach the purchase to your email.',
  },
  {
    id: 'after-paying',
    q: 'What happens after I pay?',
    a: 'Stripe confirms the payment, usually within a few seconds, and all {lessons} lessons open on your account. You get a receipt from Stripe and a confirmation email from us. Some payment methods take longer to confirm; the lessons open as soon as they do.',
  },
  {
    id: 'invoice',
    q: 'Can I get an invoice with VAT?',
    a: 'Every purchase gets a receipt by email from Stripe. To buy as a business, enter your company name and VAT number at checkout and they will appear on the invoice. [NEED: VAT status of the selling entity] [NEED: confirm tax ID collection and invoice creation are enabled in Stripe Checkout] If you need a corrected invoice, email [NEED: support email].',
  },
];

/** The shorter set for the home page. */
export const homeFaqIds = ['legal', 'hardware', 'no-flipper', 'time', 'firmware', 'refund'] as const;
