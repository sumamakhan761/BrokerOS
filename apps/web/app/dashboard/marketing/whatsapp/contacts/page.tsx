"use client";

// ============================================================================
// BrokerOS — WhatsApp Contacts Directory Page
// ============================================================================

import React from "react";
import { WhatsAppContactsTable } from "@/features/marketing/whatsapp";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";

export default function WhatsAppContactsPage() {
  return (
    <DashboardPageWrapper
      loading={false}
      title="WhatsApp Contacts Directory"
      subtitle="Browse and segment your opt-in WhatsApp contacts and synchronized CRM leads."
    >
      <WhatsAppContactsTable />
    </DashboardPageWrapper>
  );
}
