// ============================================================================
// BrokerOS — SMS Flow Runs Page
// ============================================================================

'use client';

import React, { use } from 'react';
import { SmsFlowRunsView } from '@/features/marketing/sms/components/flows/SmsFlowRunsView';

export default function SmsFlowRunsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SmsFlowRunsView id={id} />;
}
