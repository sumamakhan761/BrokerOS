// ============================================================================
// BrokerOS — Instagram Ads Catalog & Constants
// ============================================================================

export const INSTAGRAM_BRAND_GRADIENT =
  'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';

export const INSTAGRAM_BRAND_COLORS = {
  purple: '#833AB4',
  red: '#FD1D1D',
  orange: '#FCB045',
  pink: '#E1306C',
  darkBg: '#121212',
  cardBg: '#1E1E1E',
} as const;

export const INSTAGRAM_PLACEMENT_CONFIG = {
  REELS: {
    id: 'REELS',
    label: 'Instagram Reels',
    badge: '9:16 Fullscreen Video',
    aspectRatio: '9:16',
    description: 'High-energy vertical video property walk-throughs and drone tours.',
    color: '#E1306C',
    bgClass: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800',
  },
  STORY: {
    id: 'STORY',
    label: 'Instagram Stories',
    badge: '9:16 Ephemeral',
    aspectRatio: '9:16',
    description: 'Urgent price drops, private launch invitations, and interactive lead forms.',
    color: '#833AB4',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
  },
  FEED: {
    id: 'FEED',
    label: 'Instagram Feed',
    badge: '1:1 & 4:5 Posts',
    aspectRatio: '1:1',
    description: 'High-resolution architectural renders, floor plans, and carousel amenities.',
    color: '#0081FB',
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  },
  EXPLORE: {
    id: 'EXPLORE',
    label: 'Instagram Explore',
    badge: 'Discovery Grid',
    aspectRatio: '1:1',
    description: 'Reaches active home-seekers searching for luxury properties and neighborhoods.',
    color: '#FCB045',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  },
} as const;

export const INSTAGRAM_CTA_CONFIG: Record<string, { label: string; description: string }> = {
  SEND_INSTAGRAM_MESSAGE: {
    label: 'Send Message',
    description: 'Directs prospective buyers straight to Instagram DM conversation.',
  },
  LEARN_MORE: {
    label: 'Learn More',
    description: 'Opens Instant Lead Form or property landing page.',
  },
  GET_QUOTE: {
    label: 'Get Price Sheet',
    description: 'Requests custom unit configuration and pricing calculation.',
  },
  SIGN_UP: {
    label: 'Register Interest',
    description: 'VIP pre-launch booking list access.',
  },
  BOOK_NOW: {
    label: 'Book Site Visit',
    description: 'Direct site visit appointment booking via Instagram.',
  },
  WATCH_MORE: {
    label: 'Watch Tour',
    description: 'Expands full 4K penthouse walkthrough video.',
  },
};
