"use client";

import React, { useState } from "react";
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Zap,
  ExternalLink,
  X,
} from "lucide-react";
import { EMAIL_PROVIDERS } from "@brokeros/constants";
import type { EmailProviderType, IntegrationRecord } from "../types";
export type { IntegrationRecord };
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-[var(--brand-600)] shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  BrokerOS Master Engine (Amazon SES Dedicated)
                </h3>
                <Badge variant="success" className="text-[10px]">
                  Master Default
                </Badge>
              </div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
                Pre-configured high-throughput sending engine with automated SPF, DKIM, and DMARC alignment.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Inbox Reputation
                </span>
                <span className="flex items-center gap-1 text-purple-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> Dedicated IP Warmup
                </span>
                <span className="text-[var(--text-muted)] font-mono text-[11px]">
                  Region: ap-south-1 (Mumbai)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-between self-stretch shrink-0">
            <Badge variant="brand" className="text-[11px] font-extrabold">
              0 Setup Required
            </Badge>
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
              Flat rate: $0.10 / 1,000 emails
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. ACTIVE USER INTEGRATIONS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Connected BYO Adapters</h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Custom marketing provider accounts connected to your BrokerOS workspace.
            </p>
          </div>
        </div>

        {integrations.length === 0 ? (
          <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
            <Key className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">No custom providers connected yet</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Connect your own SendGrid, Brevo, Mailchimp, or AWS SES accounts below.
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
                        From: <span className="text-[var(--text-primary)] font-bold">{int.fromEmail}</span> ({int.fromName})
                      </p>
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

      {/* ── 3. AVAILABLE ADAPTERS DIRECTORY ── */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Available Provider Adapters</h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Connect high-scale delivery APIs to route broadcasts through your own billing accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["AWS_SES", "SENDGRID", "BREVO", "MAILCHIMP"] as const).map((prov) => {
            const config = EMAIL_PROVIDERS[prov];
            return (
              <div
                key={prov}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-[var(--brand-600)] shadow-xs">
                      <Key className="w-4 h-4" />
                    </div>
                    <Badge variant="default" className="text-[10px]">BYO</Badge>
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

      {/* ── 4. CONNECT MODAL DIALOG ── */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Connect {EMAIL_PROVIDERS[selectedProvider]?.name || selectedProvider}
                </h3>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Configure your provider credentials for live delivery.
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Default From Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Default From Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.fromEmail}
                    onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>

              {selectedProvider !== "AWS_SES" && (
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    API Secret Key
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter API key (e.g. SG.... or xkeysib-...)"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                  />
                </div>
              )}

              {selectedProvider === "AWS_SES" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      AWS Access Key ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AKIA..."
                      value={formData.awsAccessKeyId}
                      onChange={(e) => setFormData({ ...formData, awsAccessKeyId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      AWS Secret Access Key
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
                </>
              )}

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
                  {isSubmitting ? "Verifying Credentials..." : "Test & Save Provider"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
