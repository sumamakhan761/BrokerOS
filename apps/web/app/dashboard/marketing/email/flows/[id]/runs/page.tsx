// ============================================================================
// BrokerOS — Email Flow Runs Page
// ============================================================================

'use client';

import React, { use } from 'react';
import { EmailFlowRunsView } from '@/features/marketing/email/components/flows/EmailFlowRunsView';

export default function EmailFlowRunsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EmailFlowRunsView id={id} />;
}
