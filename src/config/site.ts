// Site configuration
export const siteConfig = {
  name: 'Snow Analytics',
  description: 'Stock market analytics and portfolio management platform',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/snow-analytics',
    twitter: 'https://twitter.com/snow-analytics',
  },
  author: {
    name: 'Snow Analytics Team',
    url: 'https://snow-analytics.com',
  },
};

export type SiteConfig = typeof siteConfig;
