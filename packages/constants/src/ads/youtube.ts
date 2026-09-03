// ============================================================================
// BrokerOS — YouTube Video Ads Constants & Catalogs
// ============================================================================

export const YOUTUBE_BRAND_COLORS = {
  red: '#FF0000',
  darkRed: '#CC0000',
  black: '#0F0F0F',
  lightBg: '#F8FAFC',
  border: '#E2E8F0',
} as const;

export const YOUTUBE_AD_FORMAT_CONFIG = {
  IN_STREAM_SKIPPABLE: {
    id: 'IN_STREAM_SKIPPABLE',
    label: 'Skippable In-Stream',
    badge: '4K Walkthrough',
    description: 'Long-form property tours & 3D renders played before or during YouTube videos.',
    color: '#FF0000',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  IN_FEED_VIDEO: {
    id: 'IN_FEED_VIDEO',
    label: 'In-Feed Video Ad',
    badge: 'Discovery Tour',
    description: 'Thumbnail and title shown alongside related property videos and YouTube search.',
    color: '#0284C7',
    bgClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
  },
  SHORTS: {
    id: 'SHORTS',
    label: 'YouTube Shorts Ad',
    badge: 'Vertical Reel',
    description: 'High-energy 15-60s vertical video ads seamlessly integrated in the Shorts feed.',
    color: '#8B5CF6',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
  BUMPER: {
    id: 'BUMPER',
    label: 'Bumper Ad (6s)',
    badge: 'Brand Teaser',
    description: 'Non-skippable 6-second teaser video for new tower launches and pricing reveals.',
    color: '#F59E0B',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  DEMAND_GEN: {
    id: 'DEMAND_GEN',
    label: 'Demand Gen Video',
    badge: 'AI Multi-Format',
    description: 'AI-placed video ads running across YouTube, Shorts, Discover, and Gmail.',
    color: '#10B981',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
} as const;

export const YOUTUBE_RETENTION_THRESHOLDS = {
  QUARTILE_25: {
    label: 'Watched 25%',
    benchmarkPct: 65,
    description: 'Hook retention — percentage of viewers who watched beyond the 5-second skip threshold.',
  },
  QUARTILE_50: {
    label: 'Watched 50%',
    benchmarkPct: 42,
    description: 'Core tour interest — prospective buyers exploring the floor plan and interior finish.',
  },
  QUARTILE_75: {
    label: 'Watched 75%',
    benchmarkPct: 28,
    description: 'High buying intent — viewers inspecting amenities, location advantages, and master layout.',
  },
  QUARTILE_100: {
    label: 'Completed 100%',
    benchmarkPct: 18,
    description: 'Ultra-hot prospects — viewers who watched the full walkthrough and saw the CTA banner.',
  },
} as const;

export const YOUTUBE_REAL_ESTATE_VIDEO_TOPICS = [
  { id: 'v1', title: '4K Ultra-Luxury Penthouse Virtual Walkthrough', format: 'IN_STREAM_SKIPPABLE', targetAudience: 'HNI Homebuyers' },
  { id: 'v2', title: 'Golf Course Extension Road Drone & Masterplan Tour', format: 'IN_STREAM_SKIPPABLE', targetAudience: 'Luxury Investors' },
  { id: 'v3', title: 'Live Construction Milestone & Sample Flat Unveiling', format: 'IN_FEED_VIDEO', targetAudience: 'In-Market Buyers' },
  { id: 'v4', title: '15-Sec Luxury Clubhouse & Sky Lounge Teaser', format: 'SHORTS', targetAudience: 'Young HNI Executives' },
] as const;
