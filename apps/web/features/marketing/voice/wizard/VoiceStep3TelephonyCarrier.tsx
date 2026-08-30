"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Radio,
  Loader2,
  Plus,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { VOICE_TELEPHONY_PROVIDERS } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { VoiceTelephonyIntegrationRecord } from "@/features/marketing/types";

export interface VoiceStep3TelephonyCarrierProps {
  telephonyIntegrations: VoiceTelephonyIntegrationRecord[];
  selectedTelephonyId?: string;
  callerIdNumber?: string;
  onSelectTelephony: (id: string, callerId?: string) => void;
  onSelectCallerId: (callerId: string) => void;
  apiBaseUrl?: string;
  onBack?: () => void;
  onNext?: () => void;
}

export function VoiceStep3TelephonyCarrier({
  telephonyIntegrations = [],
  selectedTelephonyId,
  callerIdNumber,
  onSelectTelephony,
  onSelectCallerId,
  apiBaseUrl = "",
  onBack,
  onNext,
}: VoiceStep3TelephonyCarrierProps) {
  const [testPhone, setTestPhone] = useState("");
  const [testingLine, setTestingLine] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedIntegration = telephonyIntegrations.find((t) => t.id === selectedTelephonyId);

  // Strictly isolate DIDs to the currently selected integration and deduplicate
  const availableDids = React.useMemo(() => {
    if (!selectedIntegration?.fromNumbers) return [];
    return Array.from(new Set(selectedIntegration.fromNumbers.map((n) => n.trim()))).filter(Boolean);
  }, [selectedIntegration]);

  // Keep callerIdNumber synced with the selected integration's available DIDs
  React.useEffect(() => {
    if (selectedIntegration && availableDids.length > 0) {
      if (!callerIdNumber || !availableDids.includes(callerIdNumber)) {
        onSelectCallerId(availableDids[0]);
      }
    }
  }, [selectedIntegration, availableDids, callerIdNumber, onSelectCallerId]);

  const handleTestCarrierLine = async () => {
    if (!selectedTelephonyId || !testPhone.trim()) return;

    try {
      setTestingLine(true);
      setTestResult(null);

      const res = await fetch(`${apiBaseUrl}/api/marketing/voice/test/carrier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telephonyId: selectedTelephonyId,
          toPhone: testPhone,
          fromNumber: callerIdNumber || availableDids[0],
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `PSTN test call dispatched successfully (Call ID: ${data.providerCallId || "verified"}). Your phone should ring shortly!`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || "Carrier line test call failed.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Failed to reach carrier gateway.",
      });
    } finally {
      setTestingLine(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
          Step 3: Telephony Carrier & Caller ID Gateway
        </h2>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Select the outbound PSTN / SIP carrier line and verify phone line connectivity with a test ring.
        </p>
      </div>

      {/* Carrier Selection Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[var(--text-primary)]">
            Select Connected Carrier Line <span className="text-rose-500">*</span>
          </label>
          <Link
            href="/dashboard/marketing/voice/settings"
            className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Connect New Carrier Trunk</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {telephonyIntegrations.map((tel) => {
            const isSelected = selectedTelephonyId === tel.id;
            const provInfo = (VOICE_TELEPHONY_PROVIDERS as any)[tel.provider] || {
              name: tel.provider,
              badge: "PSTN",
            };

            const uniqueDids = Array.from(new Set((tel.fromNumbers || []).map((n) => n.trim()))).filter(Boolean);

            return (
              <button
                key={tel.id}
                type="button"
                onClick={() => {
                  onSelectTelephony(tel.id, uniqueDids[0]);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${isSelected
                  ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-extrabold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <Badge variant="default" className="text-[9px]">
                    {provInfo.badge}
                  </Badge>
                </div>

                <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{tel.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  {tel.provider} • {uniqueDids.length} DIDs
                </p>

                {isSelected && (
                  <div className="absolute top-3 right-3 text-indigo-600">
                    <CheckCircle2 className="w-4 h-4 fill-indigo-600 text-white" />
                  </div>
                )}
              </button>
            );
          })}

          {telephonyIntegrations.length === 0 && (
            <div className="col-span-3 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Phone className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">No Carrier Trunks Connected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Please connect your Twilio, Vobiz, Exotel, or Telnyx lines first.
              </p>
              <Link href="/dashboard/marketing/voice/settings">
                <Button size="sm" variant="outline" className="mt-3 text-xs">
                  Open Voice Gateways Settings
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Caller ID Number Selection */}
      {selectedIntegration && availableDids.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Outbound Caller ID (DID)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {availableDids.map((did) => {
              const isSelected = callerIdNumber === did;
              return (
                <button
                  key={did}
                  type="button"
                  onClick={() => onSelectCallerId(did)}
                  className={`p-3 rounded-xl border text-left text-xs font-mono font-bold transition-all ${isSelected
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{did}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Carrier Line Test Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
              PSTN Carrier Line Connectivity Test
            </h3>
            <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
              Verify your carrier trunk & caller ID number before sending live broadcast calls.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="Enter your phone number (e.g. +919876543210)"
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
          />

          <Button
            type="button"
            onClick={handleTestCarrierLine}
            disabled={testingLine || !selectedTelephonyId || !testPhone.trim()}
            className="w-full sm:w-auto font-extrabold text-xs"
          >
            {testingLine ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Dialing Test Call...</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                <span>Test Carrier Line Ring</span>
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${testResult.success
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {(onBack || onNext) && (
        <div className="flex items-center justify-between pt-2">
          {onBack ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          ) : <div />}

          {onNext && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onNext}
              disabled={!selectedTelephonyId}
              className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <span>Continue to AI Voice Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
