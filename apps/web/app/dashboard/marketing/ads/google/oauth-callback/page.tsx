"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";

export default function GoogleAdsOAuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Completing Google authorization...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(`Google authorization denied: ${error}`);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No authorization code received from Google.");
      return;
    }

    // Send the code back to the parent window / modal opener
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "GOOGLE_ADS_OAUTH_CODE",
          code,
        },
        window.location.origin
      );
      setStatus("success");
      setMessage("Authorization successful! Returning to BrokerOS...");
      setTimeout(() => {
        window.close();
      }, 800);
    } else {
      setStatus("success");
      setMessage("Authorization code received. You can close this window.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-sans">
      <div className="w-full max-w-sm p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <GoogleIcon size={24} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Google Ads Authentication
          </h2>
          <p className="text-xs text-slate-500 mt-1">{message}</p>
        </div>

        <div className="flex items-center justify-center pt-2">
          {status === "processing" && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          )}
          {status === "success" && (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
          {status === "error" && (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
        </div>
      </div>
    </div>
  );
}
