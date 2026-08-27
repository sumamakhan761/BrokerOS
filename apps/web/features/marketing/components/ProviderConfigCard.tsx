"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Plug,
  Key,
  Trash2,
  ExternalLink,
  Plus,
  Zap,
  Server,
} from "lucide-react";
import { EMAIL_PROVIDERS } from "@brokeros/constants";
import type { EmailProviderType } from "../types";

export interface IntegrationRecord {
  id: string;
  provider: EmailProviderType;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  fromEmail: string;
  fromName: string;
  createdAt: string;
}

interface ProviderConfigCardProps {
  integrations: IntegrationRecord[];
  onConnect: (payload: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ProviderConfigCard({ integrations, onConnect, onDelete }: ProviderConfigCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<EmailProviderType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fromName: "Skyline Realty Marketing",
    fromEmail: "marketing@skylinerealty.com",
    apiKey: "",
    awsAccessKeyId: "",
    awsSecretKey: "",
    awsRegion: "ap-south-1",
    mailchimpServer: "us20",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (provider: EmailProviderType) => {
    setSelectedProvider(provider);
    setFormData({
      name: `${EMAIL_PROVIDERS[provider]?.name || provider} Account`,
      fromName: "Skyline Realty Marketing",
      fromEmail: "marketing@skylinerealty.com",
      apiKey: "",
      awsAccessKeyId: "",
      awsSecretKey: "",
      awsRegion: "ap-south-1",
      mailchimpServer: "us20",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setIsSubmitting(true);
    try {
      await onConnect({
        provider: selectedProvider,
        ...formData,
      });
      setSelectedProvider(null);
    } catch (err: any) {
      alert(err?.message || "Failed to verify and connect provider");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. BROKEROS SYSTEM DEFAULT ENGINE ── */}
      <div className="p-6 bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-purple-500/10 dark:from-sky-950/40 dark:via-zinc-900 dark:to-purple-950/40 rounded-2xl border-2 border-sky-500/30 dark:border-sky-500/20 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-sky-500 text-white shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  BrokerOS System Master Engine (AWS SES)
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active & Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 max-w-xl">
                Default high-reputation cluster with verified SPF, DKIM, and DMARC alignment. All campaigns default
                to this engine automatically with zero configuration needed.
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              Rate: $0.10 / 1,000 emails
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. BRING YOUR OWN PROVIDER (BYO) ── */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Bring Your Own Provider (Enterprise Accounts)
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Connect your own dedicated SendGrid, Brevo, AWS SES, or Mailchimp account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["AWS_SES", "SENDGRID", "BREVO", "MAILCHIMP"] as const).map((provKey) => {
            const info = EMAIL_PROVIDERS[provKey];
            const existing = integrations.find((i) => i.provider === provKey);

            return (
              <div
                key={provKey}
                className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">{info.name}</h5>
                    {existing ? (
                      <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-md">
                        {info.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4 line-clamp-2">
                    {info.description}
                  </p>
                </div>

                <div>
                  {existing ? (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Connected ✅
                      </span>
                      <button
                        type="button"
                        onClick={() => onDelete(existing.id)}
                        className="text-rose-500 hover:text-rose-600 p-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenModal(provKey)}
                      className="w-full py-2 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-800 dark:text-zinc-200 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-semibold rounded-lg transition-colors border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Connect Account</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL: CONNECT CREDENTIALS ── */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Connect {EMAIL_PROVIDERS[selectedProvider]?.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Integration Label
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.fromEmail}
                    onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {selectedProvider === "AWS_SES" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      AWS Access Key ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AKIA..."
                      value={formData.awsAccessKeyId}
                      onChange={(e) => setFormData({ ...formData, awsAccessKeyId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      AWS Secret Access Key
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.awsSecretKey}
                      onChange={(e) => setFormData({ ...formData, awsSecretKey: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono text-xs"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Paste provider API key..."
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
