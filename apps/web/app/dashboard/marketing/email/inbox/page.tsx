'use client';

// ============================================================================
// BrokerOS — Email Unified Team Inbox Page
// ============================================================================

import React, { Suspense } from 'react';
import { EmailInboxView } from '@/features/marketing/email/components/inbox/EmailInboxView';

export default function EmailInboxPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Email Live Inbox</h1>
        <p className="text-xs text-text-secondary">
          Respond to client inquiries with multi-provider thread continuity, review AI responses, and manage 2-way prospect communication.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-text-tertiary">Loading Email Inbox...</div>}>
        <EmailInboxView />
      </Suspense>
    </div>
  );
}
