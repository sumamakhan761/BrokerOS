export const ALL_LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'QUALIFIED',
  'SITE_VISIT_SCHEDULED',
  'SITE_VISIT_COMPLETED',
  'NEGOTIATION',
  'BOOKING',
  'DOCUMENT',
  'LOAN',
  'AGREEMENT',
  'HANDOVER',
  'LOST',
];

export const STATUS_LABELS: Record<string, string> = {
  'NEW': 'New',
  'CONTACTED': 'Contacted',
  'INTERESTED': 'Interested',
  'QUALIFIED': 'Qualified',
  'SITE_VISIT_SCHEDULED': 'Site Visit Scheduled',
  'SITE_VISIT_COMPLETED': 'Site Visit Completed',
  'NEGOTIATION': 'Negotiation',
  'BOOKING': 'Booking',
  'DOCUMENT': 'Document',
  'LOAN': 'Loan',
  'AGREEMENT': 'Agreement',
  'HANDOVER': 'Handover',
  'LOST': 'Lost',
};

/**
 * Returns the exact list of statuses a user should see and be able to select,
 * based on their role or pathname.
 */
export function getAvailableStatusesForRole(roleOrPathname: string): string[] {
  const isPreSales = roleOrPathname.includes('pre-sales');
  const isSalesExec = roleOrPathname.includes('sales-exec') || roleOrPathname.includes('sales-manager');
  const isPostSales = roleOrPathname.includes('post-sales');
  const isClosingManager = roleOrPathname.includes('closing-manager');
  const isCpRole = roleOrPathname.includes('channel-partner') || roleOrPathname.includes('sourcing-manager');

  if (isPreSales) {
    return ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'LOST'];
  }

  if (isSalesExec) {
    // Sales Execs and Channel Partners have visibility from New to Booking
    // Sales Execs might technically only handle SV onwards, but maintaining parity with web app's fallback (which gives all non-post-sales)
    return ['SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'NEGOTIATION', 'BOOKING', 'LOST'];
  }

  if (isPostSales) {
    return ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'];
  }

  if (isClosingManager || isCpRole) {
    // Closing managers sit at site and create bookings for broker leads. 
    // They need visibility into the pre-booking stages that happen at the site.
    return ['NEW', 'BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER', 'LOST'];
  }

  // Fallback (e.g. admin, director)
  return ALL_LEAD_STATUSES;
}
