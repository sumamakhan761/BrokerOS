"use client";

// ============================================================================
// BrokerOS — WhatsApp Unified Inbox Page
// ============================================================================

import React, { Suspense } from "react";
import { WhatsAppInboxView } from "@/features/marketing/whatsapp";

export default function WhatsAppInboxPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">WhatsApp Live Inbox</h1>
        <p className="text-xs text-text-secondary">
          Respond to customer inquiries, review bot interactions, and leverage AI drafting in real time.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-text-tertiary">Loading WhatsApp Inbox...</div>}>
        <WhatsAppInboxView />
      </Suspense>
    </div>
  );
}
