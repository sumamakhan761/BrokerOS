"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "./GoogleIcon";

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GoogleConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: GoogleConnectModalProps) {
  const [activeTab, setActiveTab] = useState<"OAUTH" | "MANUAL">("OAUTH");

  // OAuth Step State: 1 = Sign in with Google, 2 = Pick Customer ID
  const [oauthStep, setOauthStep] = useState<1 | 2>(1);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [refreshToken, setRefreshToken] = useState("");
  const [discoveredAccounts, setDiscoveredAccounts] = useState<
    Array<{ customerId: string; formattedId: string; name: string }>
  >([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [accountNickname, setAccountNickname] = useState("");
  const [manualCid, setManualCid] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  // Trigger Google OAuth Popup
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMsg(null);

    try {
      const redirectUri = `${window.location.origin}/dashboard/marketing/ads/google/oauth-callback`;
      const res = await fetch(
        `${baseUrl}/api/marketing/ads/google/oauth/url?redirectUri=${encodeURIComponent(redirectUri)}`,
      );
      const data = await res.json();

      if (!data.url) {
        throw new Error("Failed to generate Google OAuth URL");
      }

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.url,
        "GoogleAdsOAuth",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`,
      );

      // Listen for message from callback popup or fallback simulation
      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === "GOOGLE_ADS_OAUTH_CODE") {
          popup?.close();
          window.removeEventListener("message", handleMessage);

          const callbackRes = await fetch(
            `${baseUrl}/api/marketing/ads/google/oauth/callback`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: event.data.code,
                redirectUri,
              }),
            },
          );
          const callbackData = await callbackRes.json();

          if (!callbackRes.ok) {
            throw new Error(
              callbackData.message || "Failed to exchange authorization code",
            );
          }

          setRefreshToken(callbackData.refreshToken);
          setDiscoveredAccounts(callbackData.discoveredAccounts || []);
          if (callbackData.discoveredAccounts?.[0]) {
            setSelectedCustomerId(
              callbackData.discoveredAccounts[0].customerId,
            );
          }
          setOauthStep(2);
          setIsAuthenticating(false);
        }
      };

      window.addEventListener("message", handleMessage);

      // Check if popup was closed by user
      const checkPopupClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopupClosed);
          setIsAuthenticating(false);
        }
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Google OAuth failed");
      setIsAuthenticating(false);
    }
  };

  // Submit Final Connection
  const handleSaveConnection = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const cid =
        activeTab === "OAUTH" ? selectedCustomerId || manualCid : manualCid;
      const token = activeTab === "OAUTH" ? refreshToken : manualToken;

      if (!cid || !token) {
        throw new Error("Please select or enter a Google Ads Customer ID");
      }

      const res = await fetch(`${baseUrl}/api/marketing/ads/google/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: cid,
          refreshToken: token,
          name: accountNickname || undefined,
          isDefault: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save Google Ads connection");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect Google Ads account");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500" />

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold shadow-xs">
              <GoogleIcon size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">
                Connect Google Ads Account
              </h2>
              <p className="text-xs text-[var(--text-tertiary)] font-medium mt-0.5">
                Sync live search campaigns, quality scores, and real-time leads.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4 flex gap-4 border-b border-slate-100">
          <button
            onClick={() => setActiveTab("OAUTH")}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "OAUTH"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>1-Click Google OAuth (Recommended)</span>
          </button>
          <button
            onClick={() => setActiveTab("MANUAL")}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "MANUAL"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Manual Credentials</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "OAUTH" ? (
            oauthStep === 1 ? (
              <div className="space-y-4 text-center py-4">
                <div className="max-w-xs mx-auto text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  Connect any Google Ads account securely using Google Sign-In. No technical API keys required.
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl border border-slate-200/80 shadow-xs font-bold text-sm transition-all duration-150 disabled:opacity-60 cursor-pointer"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon size={18} />
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-tertiary)] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Read-only campaign metrics & Lead Form webhook access</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Google Account authenticated! Select your ad account:</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    Select Google Ads Account (Customer ID)
                  </label>
                  {discoveredAccounts.length > 0 ? (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      {discoveredAccounts.map((acc) => (
                        <option key={acc.customerId} value={acc.customerId}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. 123-456-7890"
                      value={manualCid}
                      onChange={(e) => setManualCid(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    Account Nickname (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Godrej Luxury Search Ads"
                    value={accountNickname}
                    onChange={(e) => setAccountNickname(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                  />
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  Customer ID (CID) *
                </label>
                <input
                  type="text"
                  placeholder="10-digit Customer ID (e.g. 123-456-7890)"
                  value={manualCid}
                  onChange={(e) => setManualCid(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  Refresh Token *
                </label>
                <input
                  type="password"
                  placeholder="1//0gxxxxxxxxxxxxxxxxxxxx"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  Account Nickname (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Skyline Realty Google Search"
                  value={accountNickname}
                  onChange={(e) => setAccountNickname(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(activeTab === "MANUAL" || oauthStep === 2) && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveConnection}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting & Syncing...</span>
                </>
              ) : (
                <>
                  <span>Save & Sync Data</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
