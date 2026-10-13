/* Navigation labels from docs/v2/copy/chrome.md (navbar, footer). */
export interface Link {
  href: string;
  label: string;
}

export const mainNav: readonly Link[] = [
  { href: '/course', label: 'Course' },
  { href: '/tools', label: 'Tools' },
  { href: '/pricing', label: 'Pricing' },
];

export const resourcesNav: readonly (Link & { description: string })[] = [
  { href: '/primer', label: 'Primer', description: 'Six ideas to read before Module 0' },
  { href: '/reference', label: 'Reference', description: 'Frequencies, presets and file fields' },
  { href: '/glossary', label: 'Glossary', description: 'Every term in the course, defined' },
  { href: '/case-studies', label: 'Case studies', description: 'Five beginner problems, traced to the cause' },
  { href: '/sources', label: 'Sources', description: 'Where each claim comes from' },
  { href: '/romania-lab-guide', label: 'Romanian lab guide', description: 'What to check before a hardware lab' },
];

export const footerNav: readonly { title: string; links: readonly Link[] }[] = [
  {
    title: 'Course',
    links: [
      { href: '/course', label: 'Course' },
      { href: '/tools', label: 'Tools' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/primer', label: 'Primer' },
    ],
  },
  {
    title: 'Reference',
    links: [
      { href: '/reference', label: 'Reference' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/case-studies', label: 'Case studies' },
      { href: '/sources', label: 'Sources' },
    ],
  },
  {
    title: 'Rules and help',
    links: [
      { href: '/romania-lab-guide', label: 'Romanian lab guide' },
      { href: '/legal/refunds', label: 'Refund policy' },
      { href: '/legal/privacy', label: 'Privacy' },
      { href: '/legal/terms', label: 'Terms' },
      { href: '/legal/imprint', label: 'Imprint' },
    ],
  },
];
