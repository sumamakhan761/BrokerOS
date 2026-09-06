"use client";

import React, { useState } from "react";
import {
  Key,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { SMS_PROVIDERS } from "@brokeros/constants";
import type { SmsProviderType, SmsIntegrationRecord } from "@/features/marketing/types";
export type { SmsIntegrationRecord };
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SmsConnectModal } from "./config/SmsConnectModal";

export interface SmsProviderConfigCardProps {
  integrations: SmsIntegrationRecord[];
  onConnect: (payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SmsProviderConfigCard({
  integrations,
  onConnect,
  onDelete,
}: SmsProviderConfigCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<SmsProviderType | null>(null);

  return (
    <div className="space-y-6">
      {/* ── 1. ACTIVE USER INTEGRATIONS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Connected SMS Gateways</h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Your connected carrier accounts (Twilio, AWS SNS, Sinch, Gupshup) for programmable SMS and DLT sender headers.
            </p>
          </div>
        </div>

        {integrations.length === 0 ? (
          <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
            <Key className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">No custom SMS gateways connected yet</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Connect your own Twilio, AWS SNS, Sinch, or Gupshup carrier accounts below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((int) => (
              <div
                key={int.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{int.name}</h4>
                        <Badge variant="default" className="text-[10px]">
                          {int.provider}
                        </Badge>
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
                        Sender / Header: <span className="text-[var(--text-primary)] font-bold">{int.fromSender}</span>
                      </p>
                      {int.dltEntityId && (
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                          DLT PE ID: {int.dltEntityId}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(int.id)}
                      className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-[11px]">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for dispatch
                  </span>
                  <span className="text-[var(--text-muted)]">
                    Connected {new Date(int.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. AVAILABLE ADAPTERS DIRECTORY ── */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Available SMS Provider Adapters</h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Connect high-scale messaging APIs to route broadcasts through your own billing accounts and headers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["TWILIO", "AWS_SNS", "SINCH", "GUPSHUP"] as const).map((prov) => {
            const config = SMS_PROVIDERS[prov];
            return (
              <div
                key={prov}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      {config.badge}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{config.name}</h4>
                  <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-1 line-clamp-2">
                    {config.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={config.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[var(--brand-600)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>API Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProvider(prov)}
                    className="h-7 px-2.5 text-[11px] font-bold gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Connect</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. CONNECT MODAL DIALOG ── */}
      <SmsConnectModal
        selectedProvider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onConnect={onConnect}
      />
    </div>
  );
}
