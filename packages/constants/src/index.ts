/**
 * @brokeros/constants
 *
 * Shared constants, enums, and pure utility functions.
 * Framework-agnostic (no React, no NestJS).
 */

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
] as const;

export type LeadStatus = typeof ALL_LEAD_STATUSES[number];

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

export const ALL_BROKER_STATUSES = [
  'PENDING_APPROVAL',
  'ACTIVE',
  'INACTIVE',
  'BLACKLISTED',
  'NEW',
  'CONTACTED',
  'VISIT',
  'DEAL'
] as const;

export type BrokerStatus = typeof ALL_BROKER_STATUSES[number];

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
    return ['SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'NEGOTIATION', 'BOOKING', 'LOST'];
  }

  if (isPostSales) {
    return ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'];
  }

  if (isClosingManager || isCpRole) {
    return ['NEW', 'BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER', 'LOST'];
  }

  return [...ALL_LEAD_STATUSES];
}
