'use client';

// ============================================================================
// BrokerOS — WhatsApp Flow Runs Page
// ============================================================================

import React, { use } from 'react';
import { FlowRunsView } from '@/features/marketing/whatsapp/components/flows/FlowRunsView';

export default function FlowRunsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <FlowRunsView id={id} />;
}
