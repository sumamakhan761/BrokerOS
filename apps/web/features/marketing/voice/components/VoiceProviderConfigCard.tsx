'use client';

import React, { useState } from 'react';
import { Phone, Radio } from 'lucide-react';
import type {
  VoiceTelephonyIntegrationRecord,
  VoiceAgentIntegrationRecord,
} from '@/features/marketing/types';
import { TelephonyCarriersTab } from './config/TelephonyCarriersTab';
import { VoiceAgentPlatformsTab } from './config/VoiceAgentPlatformsTab';

export interface VoiceProviderConfigCardProps {
  telephonyIntegrations: VoiceTelephonyIntegrationRecord[];
  agentIntegrations: VoiceAgentIntegrationRecord[];
  onAddTelephony: (data: any) => Promise<void>;
  onDeleteTelephony: (id: string) => Promise<void>;
  onAddAgent: (data: any) => Promise<void>;
  onDeleteAgent: (id: string) => Promise<void>;
  loading?: boolean;
}

export function VoiceProviderConfigCard({
  telephonyIntegrations = [],
  agentIntegrations = [],
  onAddTelephony,
  onDeleteTelephony,
  onAddAgent,
  onDeleteAgent,
}: VoiceProviderConfigCardProps) {
  const [activeTab, setActiveTab] = useState<'TELEPHONY' | 'AGENT'>('TELEPHONY');

  return (
    <div className="space-y-8 animate-enter">
      {/* Category Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('TELEPHONY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'TELEPHONY'
                ? 'bg-white text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Phone className="w-4 h-4 text-indigo-600" />
            <span>Telephony Gateways ({telephonyIntegrations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AGENT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'AGENT'
                ? 'bg-white text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Radio className="w-4 h-4 text-indigo-600" />
            <span>AI Voice Platforms ({agentIntegrations.length})</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: TELEPHONY CARRIERS ── */}
      {activeTab === 'TELEPHONY' && (
        <TelephonyCarriersTab
          telephonyIntegrations={telephonyIntegrations}
          onAddTelephony={onAddTelephony}
          onDeleteTelephony={onDeleteTelephony}
        />
      )}

      {/* ── TAB 2: AI VOICE PLATFORMS ── */}
      {activeTab === 'AGENT' && (
        <VoiceAgentPlatformsTab
          agentIntegrations={agentIntegrations}
          onAddAgent={onAddAgent}
          onDeleteAgent={onDeleteAgent}
        />
      )}
    </div>
  );
}
