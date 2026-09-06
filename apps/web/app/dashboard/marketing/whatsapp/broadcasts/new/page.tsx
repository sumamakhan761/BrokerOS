"use client";

// ============================================================================
// BrokerOS — New WhatsApp Broadcast Campaign Page
// ============================================================================

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WhatsAppBroadcastWizard } from "@/features/marketing/whatsapp";

export default function NewWhatsAppBroadcastPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/marketing/whatsapp/broadcasts"
          className="p-2 bg-bg-surface hover:bg-bg-subtle border border-border-default rounded-xl text-text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Create WhatsApp Broadcast Campaign
          </h1>
          <p className="text-xs text-text-secondary">
            Follow the 3-step wizard to personalize template parameters, select your audience, and launch.
          </p>
        </div>
      </div>

      <WhatsAppBroadcastWizard />
    </div>
  );
}
