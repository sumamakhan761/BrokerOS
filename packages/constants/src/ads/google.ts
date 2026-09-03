// ============================================================================
// BrokerOS — Google Ads Catalog & Constants
// ============================================================================

export const GOOGLE_ADS_API_VERSION = 'v25';
export const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;
export const GOOGLE_OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export const GOOGLE_ADS_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/adwords',
] as const;

export const GOOGLE_ADS_BRAND_COLORS = {
  blue: '#4285F4',
  green: '#34A853',
  yellow: '#FBBC05',
  red: '#EA4335',
  darkBg: '#202124',
} as const;

export const GOOGLE_CHANNEL_CONFIG = {
  SEARCH: {
    id: 'SEARCH',
    label: 'Google Search',
    badge: 'High Intent',
    description: 'Text ads triggered by prospective buyers actively searching real estate keywords.',
    color: '#4285F4',
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  },
  PERFORMANCE_MAX: {
    id: 'PERFORMANCE_MAX',
    label: 'Performance Max',
    badge: 'Omnichannel AI',
    description: 'Automated AI-driven campaigns running across Search, YouTube, Display, Maps & Discover.',
    color: '#34A853',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  DISPLAY: {
    id: 'DISPLAY',
    label: 'Display Network',
    badge: 'Visual Banner',
    description: 'Visual image and banner ads shown to prospective home buyers across 3M+ partner sites.',
    color: '#FBBC05',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  },
  VIDEO: {
    id: 'VIDEO',
    label: 'YouTube Video',
    badge: '4K Walkthrough',
    description: 'Video tour walkthroughs and bumper ads shown to viewers on YouTube.',
    color: '#EA4335',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  },
} as const;

export const GOOGLE_CAMPAIGN_STATUS_CONFIG = {
  ENABLED: {
    label: 'Active',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  PAUSED: {
    label: 'Paused',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  REMOVED: {
    label: 'Removed',
    color: 'zinc',
    badgeClass: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  },
} as const;

export const GOOGLE_MATCH_TYPE_CONFIG = {
  EXACT: {
    label: 'Exact Match',
    syntax: '[keyword]',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Only shows for queries with the exact same meaning as the keyword.',
  },
  PHRASE: {
    label: 'Phrase Match',
    syntax: '"keyword"',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Shows for queries that include the meaning of your keyword.',
  },
  BROAD: {
    label: 'Broad Match',
    syntax: 'keyword',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    description: 'Shows on searches that relate to your keyword, casting the widest net.',
  },
} as const;

export const GOOGLE_QUALITY_SCORE_CONFIG = {
  EXCELLENT: {
    range: '8 - 10',
    label: 'Excellent',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    tip: 'Lowest cost per click & top ad rank placement.',
  },
  AVERAGE: {
    range: '5 - 7',
    label: 'Moderate',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    tip: 'Average relevance. Optimize landing page copy to lower CPC.',
  },
  POOR: {
    range: '1 - 4',
    label: 'Below Average',
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
    tip: 'Low relevance. Ad copy needs closer alignment with search query.',
  },
} as const;

export const GOOGLE_REAL_ESTATE_KEYWORDS_CATALOG = [
  { text: 'luxury flats for sale', matchType: 'EXACT' as const, avgQualityScore: 9 },
  { text: '3 bhk apartment in gurgaon', matchType: 'EXACT' as const, avgQualityScore: 9 },
  { text: 'premium penthouses mumbai', matchType: 'EXACT' as const, avgQualityScore: 8 },
  { text: 'villas near golf course', matchType: 'PHRASE' as const, avgQualityScore: 8 },
  { text: 'buy luxury property', matchType: 'BROAD' as const, avgQualityScore: 7 },
  { text: 'new residential projects launch', matchType: 'PHRASE' as const, avgQualityScore: 8 },
  { text: 'best real estate investment nri', matchType: 'BROAD' as const, avgQualityScore: 7 },
] as const;
