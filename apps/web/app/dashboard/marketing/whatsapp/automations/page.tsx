"use client";

// ============================================================================
// BrokerOS — WhatsApp Automations & Flow Bots Page
// ============================================================================

import React from "react";
import { WhatsAppAutomationsTable } from "@/features/marketing/whatsapp";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";

export default function WhatsAppAutomationsPage() {
  return (
    <DashboardPageWrapper
      loading={false}
      title="WhatsApp Automations & Flow Workflows"
      subtitle="Automated keyword responders, first-inbound welcomes, interactive button dispatchers, and conditional bot trees."
    >
      <WhatsAppAutomationsTable />
    </DashboardPageWrapper>
  );
}
