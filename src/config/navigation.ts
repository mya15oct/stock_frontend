// Navigation configuration
export interface NavLink {
  href: string;
  label: string;
  icon?: string;
  description?: string;
}

export const mainNav: NavLink[] = [
  {
    href: '/stocks',
    label: 'Stocks',
  },
  {
    href: '/portfolio',
    label: 'Portfolio',
  },
];

export const toolsNav: NavLink[] = [
  {
    href: '/tools/dividend-calendar',
    label: 'Dividend Calendar',
    icon: '💰',
    description: 'View upcoming dividend payments',
  },
  {
    href: '/tools/ex-dividend-calendar',
    label: 'Ex-Dividend Calendar',
    icon: '📅',
    description: 'Track ex-dividend dates',
  },
];

export const footerNav: NavLink[] = [
  {
    href: '/about',
    label: 'About',
  },
  {
    href: '/contact',
    label: 'Contact',
  },
  {
    href: '/privacy',
    label: 'Privacy',
  },
  {
    href: '/terms',
    label: 'Terms',
  },
];
