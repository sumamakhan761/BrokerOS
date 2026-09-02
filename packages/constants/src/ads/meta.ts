// ============================================================================
// BrokerOS — Meta Ads (Facebook & Instagram) Catalog & Constants
// ============================================================================

export const META_GRAPH_API_VERSION = 'v21.0';
export const META_GRAPH_BASE_URL = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;

export const META_OBJECTIVES_CATALOG = {
  OUTCOME_LEADS: {
    id: 'OUTCOME_LEADS',
    name: 'Lead Generation',
    badge: 'Real Estate Primary',
    color: '#0081FB',
    description: 'Instant forms & WhatsApp/Messenger lead collection on Facebook & Instagram.',
  },
  OUTCOME_TRAFFIC: {
    id: 'OUTCOME_TRAFFIC',
    name: 'Website / Landing Page Traffic',
    badge: 'Brochures & Microsites',
    color: '#10B981',
    description: 'Direct prospective buyers to project microsites and booking pages.',
  },
  OUTCOME_SALES: {
    id: 'OUTCOME_SALES',
    name: 'Conversions & Sales',
    badge: 'Direct Bookings',
    color: '#8B5CF6',
    description: 'Optimized for high-intent property inquiries and booking deposits.',
  },
  OUTCOME_AWARENESS: {
    id: 'OUTCOME_AWARENESS',
    name: 'Brand & Project Awareness',
    badge: 'New Launches',
    color: '#F59E0B',
    description: 'Maximum reach and video views for flagship residential tower launches.',
  },
  OUTCOME_ENGAGEMENT: {
    id: 'OUTCOME_ENGAGEMENT',
    name: 'Engagement & Video Views',
    badge: 'Virtual Tours',
    color: '#EC4899',
    description: 'Drives engagement on walk-through reels, 3D tours, and developer announcements.',
  },
} as const;

export const META_CAMPAIGN_STATUS_CONFIG = {
  ACTIVE: {
    label: 'Active',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  PAUSED: {
    label: 'Paused',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  ARCHIVED: {
    label: 'Archived',
    color: 'zinc',
    badgeClass: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  },
  DELETED: {
    label: 'Deleted',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
} as const;

export const META_CTA_CONFIG: Record<string, { label: string; description: string }> = {
  LEARN_MORE: { label: 'Learn More', description: 'Standard CTA for project details and walkthroughs.' },
  GET_QUOTE: { label: 'Get Quote', description: 'Prompts users to request a custom price sheet.' },
  SIGN_UP: { label: 'Sign Up', description: 'Register for VIP pre-launch access or private preview.' },
  DOWNLOAD: { label: 'Download', description: 'Instant brochure, floor plan, or cost sheet download.' },
  APPLY_NOW: { label: 'Apply Now', description: 'Express interest or loan pre-approval inquiry.' },
  CONTACT_US: { label: 'Contact Us', description: 'Direct reach-out to sales gallery.' },
  BOOK_TRAVEL: { label: 'Book Visit', description: 'Schedule on-site private site visit.' },
};

export const META_REQUIRED_PERMISSIONS = [
  'ads_read',
  'ads_management',
  'leads_retrieval',
  'pages_read_engagement',
  'pages_show_list',
  'pages_manage_ads',
] as const;

export const META_REAL_ESTATE_INTERESTS_SUGGESTIONS = [
  { id: '6003139266472', name: 'Real estate' },
  { id: '6003350284687', name: 'Luxury real estate' },
  { id: '6003189914781', name: 'Property investment' },
  { id: '6003445856782', name: 'Mortgage loans' },
  { id: '6003299871234', name: 'High-net-worth individual' },
  { id: '6003987654321', name: 'Apartment' },
  { id: '6003554433221', name: 'Villa' },
] as const;
