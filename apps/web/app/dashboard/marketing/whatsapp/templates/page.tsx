"use client";

// ============================================================================
// BrokerOS — WhatsApp Message Templates Catalog Page
// ============================================================================

import React from "react";
import { WhatsAppTemplatesTable } from "@/features/marketing/whatsapp";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";

export default function WhatsAppTemplatesPage() {
  return (
    <DashboardPageWrapper
      loading={false}
      title="WhatsApp Message Templates"
      subtitle="Sync, review, and manage Meta Cloud API approved HSM message templates for initiating customer outreach."
    >
      <WhatsAppTemplatesTable />
    </DashboardPageWrapper>
  );
}
