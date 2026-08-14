export const PIPELINE_STAGES = [
  { key: 'NEW', label: 'New Lead', color: '#6366f1' },
  { key: 'CONTACTED', label: 'Contacted', color: '#8b5cf6' },
  { key: 'INTERESTED', label: 'Interested', color: '#a78bfa' },
  { key: 'QUALIFIED', label: 'Qualified', color: '#7c3aed' },
  { key: 'SITE_VISIT_SCHEDULED', label: 'Visit Sched.', color: '#4f46e5' },
  { key: 'SITE_VISIT_COMPLETED', label: 'Visit Done', color: '#4338ca' },
  { key: 'BOOKING', label: 'Booking', color: '#3730a3' },
  { key: 'LOST', label: 'Lost', color: '#9ca3af' },
];

export const TEMP_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  HOT: { label: 'Hot', bg: '#fef2f2', text: '#ef4444' },
  WARM: { label: 'Warm', bg: '#fff7ed', text: '#f97316' },
  COLD: { label: 'Cold', bg: '#eff6ff', text: '#3b82f6' },
};

export const STATUS_LABEL: Record<string, string> = {
  NEW: 'New', CONTACTED: 'Contacted', INTERESTED: 'Interested',
  QUALIFIED: 'Qualified', SITE_VISIT_SCHEDULED: 'Visit Sched.',
  SITE_VISIT_COMPLETED: 'Visit Done', BOOKING: 'Booking', LOST: 'Lost',
};

export function pct(done: number, target: number) {
  if (!target) return 0;
  return Math.min(1, done / target);
}
