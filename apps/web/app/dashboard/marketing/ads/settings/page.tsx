"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Key,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Layers,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetaConnectModal } from "@/features/marketing/ads/meta/components/MetaConnectModal";
import type { MetaIntegrationItem } from "@/features/marketing/ads/meta/types";

export default function MetaAdsSettingsPage() {
  const [integrations, setIntegrations] = useState<MetaIntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/marketing/ads/meta/webhooks`;
  const verifyToken = "brokeros_meta_verify_token";

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/integrations`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load Meta integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [baseUrl]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this Meta Ad integration? Cached campaign data will be removed.")) {
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/integrations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadIntegrations();
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete integration");
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="Meta Ads Settings"
      subtitle="Manage connected Meta Ad accounts, permanent System User tokens, and configure Instant Lead Form webhooks."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/ads/meta">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Ads</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsConnectModalOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Ad Account</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Connected Integrations */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Connected Meta Ad Accounts
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              All active ad accounts syncing data with BrokerOS CRM.
            </p>
          </div>

          {integrations.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Key className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                No Meta Ad Accounts Connected
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Connect your Meta Business Ad Account using a permanent System User Token to start syncing campaigns and capturing leads.
              </p>
              <Button
                size="sm"
                onClick={() => setIsConnectModalOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect First Ad Account</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {integrations.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                      f
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </h4>
                        {item.isDefault && (
                          <Badge variant="info" className="text-[10px]">
                            Primary Default
                          </Badge>
                        )}
                        <Badge variant="success" className="text-[10px]">
                          Active
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 font-mono mt-1">
                        <span>{item.adAccountId}</span>
                        <span>·</span>
                        <span>Currency: {item.currency}</span>
                        {item.lastSyncedAt && (
                          <>
                            <span>·</span>
                            <span>
                              Synced: {new Date(item.lastSyncedAt).toLocaleTimeString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Webhook Setup Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Meta Webhook Ingestion
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Receive Facebook & Instagram Instant Lead Form submissions in real-time.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Callback URL
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full px-2.5 py-1.5 font-mono text-[11px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrl, "url")}
                  className="shrink-0 text-xs px-2.5 py-1.5"
                >
                  {copiedField === "url" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Verify Token
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={verifyToken}
                  className="w-full px-2.5 py-1.5 font-mono text-[11px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(verifyToken, "token")}
                  className="shrink-0 text-xs px-2.5 py-1.5"
                >
                  {copiedField === "token" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <h5 className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px] uppercase tracking-wider">
                Setup Steps in Meta Developer Portal:
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <li>Go to developers.facebook.com → Your App.</li>
                <li>Add <strong>Webhooks</strong> product → Select <strong>Page</strong> object.</li>
                <li>Click <strong>Subscribe to this object</strong> and enter Callback URL & Verify Token.</li>
                <li>Subscribe to the <strong>leadgen</strong> field.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <MetaConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={loadIntegrations}
      />
    </DashboardPageWrapper>
  );
}
