'use client';

// ============================================================================
// BrokerOS — WhatsApp Interactive Flow Bots Page
// ============================================================================

import React from 'react';
import { FlowsTable } from '@/features/marketing/whatsapp/components/flows/FlowsTable';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';

export default function WhatsAppFlowsPage() {
  return (
    <DashboardPageWrapper
      loading={false}
      title="WhatsApp Interactive Flow Bots"
      subtitle="Visual multi-turn chatbot graphs with quick reply buttons, document delivery, and qualifying decision trees."
    >
      <FlowsTable />
    </DashboardPageWrapper>
  );
}
