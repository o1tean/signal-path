export interface NavLink {
  href: string;
  label: string;
}

export const mainNav: readonly NavLink[] = [
  { href: '/course', label: 'Course' },
  { href: '/tools', label: 'Tools' },
  { href: '/primer', label: 'Primer' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/pricing', label: 'Pricing' },
];

export const footerNav: readonly { title: string; links: NavLink[] }[] = [
  {
    title: 'Course',
    links: [
      { href: '/course', label: 'The 12-week path' },
      { href: '/learn', label: 'Your dashboard' },
      { href: '/learn/00-setup', label: 'Free starter' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Reference',
    links: [
      { href: '/primer', label: 'Radio primer' },
      { href: '/reference', label: 'Field reference' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/tools', label: 'Browser tools' },
      { href: '/sources', label: 'Sources' },
      { href: '/case-studies', label: 'Case studies' },
    ],
  },
  {
    title: 'Rules and legal',
    links: [
      { href: '/romania-lab-guide', label: 'Romania lab guide' },
      { href: '/legal/terms', label: 'Terms' },
      { href: '/legal/privacy', label: 'Privacy' },
      { href: '/legal/refunds', label: 'Refunds' },
      { href: '/legal/imprint', label: 'Imprint' },
    ],
  },
];
