"use client";

import React, { useState } from "react";
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Zap,
  ExternalLink,
  X,
  MessageSquare,
} from "lucide-react";
import { SMS_PROVIDERS } from "@brokeros/constants";
import type { SmsProviderType, SmsIntegrationRecord } from "@/features/marketing/types";
export type { SmsIntegrationRecord };
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
  const [formData, setFormData] = useState({
    name: "",
    fromSender: "SKYLIN",
    accountSid: "",
    authToken: "",
    messagingServiceSid: "",
    apiKey: "",
    servicePlanId: "",
    awsAccessKeyId: "",
    awsSecretKey: "",
    awsRegion: "ap-south-1",
    dltEntityId: "",
    isDefault: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (provider: SmsProviderType) => {
    setSelectedProvider(provider);
    setFormData({
      name: `${SMS_PROVIDERS[provider]?.name || provider} Gateway`,
      fromSender: provider === "TWILIO" ? "+14155550199" : "SKYLIN",
      accountSid: "",
      authToken: "",
      messagingServiceSid: "",
      apiKey: "",
      servicePlanId: "",
      awsAccessKeyId: "",
      awsSecretKey: "",
      awsRegion: "ap-south-1",
      dltEntityId: "",
      isDefault: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setIsSubmitting(true);
    try {
      await onConnect({
        provider: selectedProvider,
        name: formData.name.trim() || `${SMS_PROVIDERS[selectedProvider].name} Gateway`,
        fromSender: formData.fromSender.trim(),
        accountSid: formData.accountSid || undefined,
        authToken: formData.authToken || undefined,
        messagingServiceSid: formData.messagingServiceSid || undefined,
        apiKey: formData.apiKey || undefined,
        servicePlanId: formData.servicePlanId || undefined,
        awsAccessKeyId: formData.awsAccessKeyId || undefined,
        awsSecretKey: formData.awsSecretKey || undefined,
        awsRegion: formData.awsRegion || undefined,
        dltEntityId: formData.dltEntityId || undefined,
        isDefault: formData.isDefault,
      });
      setSelectedProvider(null);
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to verify and connect SMS provider");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    onClick={() => handleOpenModal(prov)}
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
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Connect {SMS_PROVIDERS[selectedProvider]?.name || selectedProvider}
                </h3>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Configure verified API credentials and default sender header.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedProvider(null)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Account Nickname
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`e.g. Production ${SMS_PROVIDERS[selectedProvider]?.name}`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Default From Sender / Header <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fromSender}
                  onChange={(e) => setFormData({ ...formData, fromSender: e.target.value })}
                  placeholder="e.g. +14155550199 or SKYLIN"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Use E.164 phone number for US/CA or 6-char registered Sender Header for India/UK (e.g. SKYLIN).
                </p>
              </div>

              {selectedProvider === "TWILIO" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Twilio Account SID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={formData.accountSid}
                      onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Twilio Auth Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Auth token from Twilio console"
                      value={formData.authToken}
                      onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Messaging Service SID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={formData.messagingServiceSid}
                      onChange={(e) => setFormData({ ...formData, messagingServiceSid: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedProvider === "AWS_SNS" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      AWS Access Key ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={formData.awsAccessKeyId}
                      onChange={(e) => setFormData({ ...formData, awsAccessKeyId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      AWS Secret Access Key <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      value={formData.awsSecretKey}
                      onChange={(e) => setFormData({ ...formData, awsSecretKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      AWS Region
                    </label>
                    <input
                      type="text"
                      placeholder="ap-south-1"
                      value={formData.awsRegion}
                      onChange={(e) => setFormData({ ...formData, awsRegion: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedProvider === "SINCH" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Service Plan ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sinch Service Plan ID"
                      value={formData.servicePlanId}
                      onChange={(e) => setFormData({ ...formData, servicePlanId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      API Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Sinch API Token"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedProvider === "GUPSHUP" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Gupshup API Key <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Gupshup Enterprise API Key"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      DLT Principal Entity ID (PE ID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1701159123456789"
                      value={formData.dltEntityId}
                      onChange={(e) => setFormData({ ...formData, dltEntityId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultSms"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-[var(--brand-600)] rounded-sm"
                />
                <label htmlFor="isDefaultSms" className="text-xs font-bold text-[var(--text-secondary)]">
                  Set as default gateway for SMS broadcasts
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProvider(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying Credentials..." : "Test & Save Gateway"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
