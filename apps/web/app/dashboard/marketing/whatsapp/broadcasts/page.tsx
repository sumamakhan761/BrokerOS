"use client";

// ============================================================================
// BrokerOS — WhatsApp Broadcasts Campaigns Page
// ============================================================================

import React from "react";
import { WhatsAppBroadcastsTable } from "@/features/marketing/whatsapp";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";

export default function WhatsAppBroadcastsPage() {
  return (
    <DashboardPageWrapper
      loading={false}
      title="WhatsApp Broadcast Campaigns"
      subtitle="Send Meta-approved HSM bulk notifications to opted-in audiences with delivery and read funnel tracking."
    >
      <WhatsAppBroadcastsTable />
    </DashboardPageWrapper>
  );
}
