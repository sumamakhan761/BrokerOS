// ============================================================================
// BrokerOS — Email Flow Canvas Builder Route
// ============================================================================

'use client';

import React, { use } from 'react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { EmailFlowBuilderView } from '@/features/marketing/email/components/flows/EmailFlowBuilderView';

export default function EmailFlowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <DashboardPageWrapper
      loading={false}
      title="Email Flow Canvas"
      subtitle="Design dynamic 2-way automation trees, AI autoreplies, and CRM routing."
    >
      <EmailFlowBuilderView id={id} />
    </DashboardPageWrapper>
  );
}
