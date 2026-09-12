'use client';

// ============================================================================
// BrokerOS — SMS Unified Live Team Inbox Page
// ============================================================================

import React, { Suspense } from 'react';
import { SmsInboxView } from '@/features/marketing/sms/components/inbox/SmsInboxView';

export default function SmsInboxPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">SMS Live Team Inbox</h1>
        <p className="text-xs text-text-secondary">
          Respond to mobile lead inquiries with carrier thread continuity, review Groq AI responses, and manage 2-way prospect conversations.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-text-tertiary">Loading SMS Inbox...</div>}>
        <SmsInboxView />
      </Suspense>
    </div>
  );
}
