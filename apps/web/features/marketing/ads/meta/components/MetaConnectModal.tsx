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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                Connect Ads Account (Meta)
              </h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">
                Sync Facebook & Instagram campaigns, ad sets, creatives & lead forms.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              )}
              <div className="flex-1">
                <p className="font-bold">{testResult.message}</p>
                {testResult.account && (
                  <p className="text-[11px] opacity-90 mt-0.5 font-medium">
                    Account ID: {testResult.account.id} · Spend: {testResult.account.amountSpent}{" "}
                    {testResult.account.currency}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-[var(--text-primary)]">
              Integration Name
            </label>
            <input
              type="text"
              placeholder="e.g. Skyline Realty - Main Ad Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[var(--text-primary)]">
                Ad Account ID <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Found in Meta Ads Manager URL (<code className="font-mono">act_...</code>)
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. act_123456789012345"
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] font-mono focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[var(--text-primary)]">
                System User Permanent Token <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-blue-600">
                Generated in Meta Business Settings
              </span>
            </div>
            <textarea
              required
              rows={3}
              placeholder="EAA..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] font-mono text-[11px] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-primary)]">
                App ID <span className="text-[11px] font-normal text-[var(--text-tertiary)]">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 123456789"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] font-mono focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-primary)]">
                App Secret <span className="text-[11px] font-normal text-[var(--text-tertiary)]">(Optional)</span>
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] font-mono focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultMetaAccount"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <label htmlFor="isDefaultMetaAccount" className="font-bold text-[var(--text-primary)] cursor-pointer">
              Set as primary default Ads account
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing || submitting || !adAccountId || !accessToken}
              className="text-xs font-bold gap-1.5"
            >
              {testing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>{testing ? "Testing Token..." : "Test Connection"}</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={submitting || testing}
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{submitting ? "Saving & Syncing..." : "Save & Sync"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
