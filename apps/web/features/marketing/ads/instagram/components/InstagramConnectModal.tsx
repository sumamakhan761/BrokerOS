"use client";

import React, { useState } from "react";
import {
  X,
  Key,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

import { Button } from "@/components/ui/Button";

interface InstagramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InstagramConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: InstagramConnectModalProps) {
  const [name, setName] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [instagramActorHandle, setInstagramActorHandle] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    account?: any;
  } | null>(null);

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const handleTestConnection = async () => {
    if (!adAccountId.trim() || !accessToken.trim()) {
      setError("Please enter both Ad Account ID and Access Token to test.");
      return;
    }

    try {
      setTesting(true);
      setError(null);
      setTestResult(null);

      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adAccountId: adAccountId.trim(),
          accessToken: accessToken.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Verification failed with Meta Graph API");
      }

      setTestResult({
        success: true,
        message: `Verified: Connected to ${data.account?.name || "Ad Account"} (${data.account?.currency || "INR"})`,
        account: data.account,
      });

      if (!name) {
        setName(data.account?.name || "Instagram Ad Account");
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Failed to verify Meta credentials",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adAccountId.trim() || !accessToken.trim()) {
      setError("Please fill in all required credential fields.");
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Instagram Ad Account",
          adAccountId: adAccountId.trim(),
          accessToken: accessToken.trim(),
          isDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to connect Instagram Ad Account");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save integration");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Instagram Gradient */}
        <div className="relative p-6 bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-xl shadow-xs">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                Connect Instagram Ads Engine
              </h3>
              <p className="text-xs text-pink-100 font-medium mt-0.5">
                Link your Meta Ad Account with Instagram Reels & Stories placements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Nickname */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[var(--text-primary)]">
              Account Nickname
            </label>
            <input
              type="text"
              placeholder="e.g. Godrej Palm Retreat (Instagram Ads)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 focus:outline-hidden focus:border-pink-500 shadow-2xs"
            />
          </div>

          {/* Ad Account ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center justify-between">
              <span>Meta Ad Account ID <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)]">act_XXXXXXXXX</span>
            </label>
            <input
              type="text"
              required
              placeholder="act_1234567890"
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200/80 focus:outline-hidden focus:border-pink-500 shadow-2xs"
            />
          </div>

          {/* System User Access Token */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center justify-between">
              <span>System User Permanent Token <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-bold text-pink-600">Never Expires</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Paste permanent EAAB... token from Meta Business Manager"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200/80 focus:outline-hidden focus:border-pink-500 shadow-2xs"
            />
          </div>

          {/* Instagram Handle (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[var(--text-primary)]">
              Instagram Brand Handle (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">@</span>
              <input
                type="text"
                placeholder="godrejproperties_luxury"
                value={instagramActorHandle}
                onChange={(e) => setInstagramActorHandle(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200/80 focus:outline-hidden focus:border-pink-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                testResult.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-bold">{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing || !adAccountId || !accessToken}
              className="gap-1.5 text-xs font-bold text-pink-700 hover:bg-pink-50 hover:border-pink-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
              <span>{testing ? "Testing..." : "Test Connection"}</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={connecting || !adAccountId || !accessToken}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-90 text-white text-xs font-black shadow-xs gap-1.5"
              >
                <span>{connecting ? "Connecting..." : "Connect & Sync Live Data"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
