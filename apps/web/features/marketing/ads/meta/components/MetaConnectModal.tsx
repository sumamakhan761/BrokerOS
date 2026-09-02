"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MetaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MetaConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: MetaConnectModalProps) {
  const [name, setName] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  const [testing, setTesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    account?: any;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const handleTestConnection = async () => {
    if (!adAccountId.trim() || !accessToken.trim()) {
      setTestResult({
        success: false,
        message: "Please enter both Ad Account ID and Access Token to test.",
      });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      setFormError(null);

      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adAccountId: adAccountId.trim(),
          accessToken: accessToken.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Connected successfully to "${data.account?.name || "Meta Ad Account"}" (${data.account?.currency || "INR"})`,
          account: data.account,
        });
        if (!name.trim() && data.account?.name) {
          setName(data.account.name);
        }
      } else {
        setTestResult({
          success: false,
          message: data.message || "Meta token validation failed. Check account ID or permissions.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Failed to reach Meta Graph API validation endpoint.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adAccountId.trim() || !accessToken.trim()) {
      setFormError("Ad Account ID and System User Token are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          adAccountId: adAccountId.trim(),
          accessToken: accessToken.trim(),
          appId: appId.trim() || undefined,
          appSecret: appSecret.trim() || undefined,
          isDefault,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setFormError(data.message || "Failed to save Meta Ad Integration.");
      }
    } catch (err: any) {
      setFormError(err?.message || "Network error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Connect Meta Ads
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sync Facebook & Instagram campaigns, ad sets, creatives & lead forms.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.account && (
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Account ID: {testResult.account.id} · Spend: {testResult.account.amountSpent}{" "}
                    {testResult.account.currency}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">
              Integration Name
            </label>
            <input
              type="text"
              placeholder="e.g. Skyline Realty - Main Ad Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Ad Account ID <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Found in Meta Ads Manager URL (<code className="font-mono">act_...</code>)
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="act_123456789012345 or 123456789012345"
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              className="w-full px-3 py-2 font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                System User Permanent Token <span className="text-rose-500">*</span>
              </label>
              <a
                href="https://business.facebook.com/settings/system-users"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                Get Token
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <textarea
              required
              rows={3}
              placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3 py-2 font-mono text-[11px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-[11px] text-zinc-400">
              Requires: <code className="font-mono text-zinc-600 dark:text-zinc-300">ads_read</code>,{" "}
              <code className="font-mono text-zinc-600 dark:text-zinc-300">ads_management</code>,{" "}
              <code className="font-mono text-zinc-600 dark:text-zinc-300">leads_retrieval</code>,{" "}
              <code className="font-mono text-zinc-600 dark:text-zinc-300">pages_read_engagement</code>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                App ID <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Meta App ID"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                App Secret <span className="text-zinc-400 font-normal">(For Webhooks)</span>
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isDefault" className="text-zinc-700 dark:text-zinc-300 font-medium">
              Set as Primary Default Ad Account for Lead Webhooks
            </label>
          </div>

          {/* Footer Actions */}
          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing || submitting || !adAccountId.trim() || !accessToken.trim()}
              className="gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            >
              {testing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Test Connection</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !adAccountId.trim() || !accessToken.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Save & Sync</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
