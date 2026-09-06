// ============================================================================
// BrokerOS — WhatsApp Settings (WABA, AI Concierge, Quick Replies, Tags, Webhook)
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  WhatsAppConfigCard,
  WhatsAppAiConfigCard,
  QuickRepliesManager,
  TagsManager,
  WhatsAppWebhookDiagnostics,
} from '@/features/marketing/whatsapp';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import {
  Settings,
  Sparkles,
  Zap,
  Tag as TagIcon,
  ShieldCheck,
  Building2,
} from 'lucide-react';

type SettingsTab = 'account' | 'ai' | 'quick-replies' | 'tags' | 'webhook';

export default function WhatsAppSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [activeAccount, setActiveAccount] = useState<any>(null);

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'account',
      label: 'Meta WABA Account',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'ai',
      label: 'AI Concierge & Prompts',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'quick-replies',
      label: 'Quick Replies',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'tags',
      label: 'Contact Tags',
      icon: <TagIcon className="w-4 h-4" />,
    },
    {
      id: 'webhook',
      label: 'Webhook & Diagnostics',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <DashboardPageWrapper
      loading={false}
      title="WhatsApp Configuration & Tools"
      subtitle="Manage your Meta Cloud API account, AI reply assistance, canned team shortcuts, tags, and webhook security."
    >
      <div className="space-y-6 max-w-5xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-surface border border-border-default rounded-2xl overflow-x-auto shadow-2xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          {activeTab === 'account' && (
            <WhatsAppConfigCard onAccountUpdated={(acc) => setActiveAccount(acc)} />
          )}

          {activeTab === 'ai' && (
            <WhatsAppAiConfigCard accountId={activeAccount?.id} />
          )}

          {activeTab === 'quick-replies' && (
            <QuickRepliesManager accountId={activeAccount?.id} />
          )}

          {activeTab === 'tags' && (
            <TagsManager accountId={activeAccount?.id} />
          )}

          {activeTab === 'webhook' && (
            <WhatsAppWebhookDiagnostics
              accountId={activeAccount?.id}
              verifyToken={activeAccount?.verifyToken}
            />
          )}
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
