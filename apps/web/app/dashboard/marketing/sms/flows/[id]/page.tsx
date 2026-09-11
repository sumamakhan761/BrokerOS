// ============================================================================
// BrokerOS — SMS Flow Canvas Builder Route
// ============================================================================

'use client';

import React, { use } from 'react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { SmsFlowBuilderView } from '@/features/marketing/sms/components/flows/SmsFlowBuilderView';

export default function SmsFlowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <DashboardPageWrapper
      loading={false}
      title="SMS Flow Canvas"
      subtitle="Design dynamic 2-way automation trees, Groq AI concierge responses, and CRM lead routing."
    >
      <SmsFlowBuilderView id={id} />
    </DashboardPageWrapper>
  );
}
