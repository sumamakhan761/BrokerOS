"use client";

import React, { useMemo } from "react";
import { Smartphone, Signal, Wifi, Battery, CheckCheck, Building } from "lucide-react";

export interface SmsPhoneMockupProps {
  sender: string;
  messageContent: string;
  projectName?: string;
  sampleName?: string;
}

export function SmsPhoneMockup({
  sender,
  messageContent,
  projectName = "Skyline Luxuria",
  sampleName = "Rahul Sharma",
}: SmsPhoneMockupProps) {
  const renderedText = useMemo(() => {
    if (!messageContent) {
      return "Your message preview will appear here as you type...";
    }

    const firstName = sampleName.split(" ")[0] || "Rahul";

    return messageContent
      .replace(/{{lead\.firstName}}/gi, firstName)
      .replace(/{{lead\.lastName}}/gi, sampleName.split(" ")[1] || "Sharma")
      .replace(/{{lead\.fullName}}/gi, sampleName)
      .replace(/{{project\.name}}/gi, projectName)
      .replace(/{{project\.startingPrice}}/gi, "₹1.45 Cr")
      .replace(/{{project\.location}}/gi, "Bandra West, Mumbai")
      .replace(/{{agent\.name}}/gi, "Amit Verma")
      .replace(/{{agent\.phone}}/gi, "+91 98765 43210")
      .replace(/{{shortUrl}}/gi, "https://brk.os/s/x9k2")
      .replace(/{{optOut}}/gi, "Reply STOP to unsub");
  }, [messageContent, sampleName, projectName]);

  const resolvedSender = sender?.trim() || "BrokerOS";

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-extrabold text-[var(--text-secondary)]">
        <Smartphone className="w-4 h-4 text-[var(--brand-600)]" />
        <span>Live Handset Simulator</span>
      </div>

      {/* Phone Frame Container */}
      <div className="relative w-full max-w-[310px] overflow-hidden rounded-[40px] border-4 border-slate-800 bg-slate-950 p-3 shadow-2xl ring-1 ring-slate-900/10">
        {/* Dynamic Island / Speaker Notch */}
        <div className="mx-auto mb-3 flex h-4 w-24 items-center justify-center rounded-full bg-slate-900">
          <div className="h-2 w-2 rounded-full bg-slate-950/80" />
        </div>

        {/* Status Bar */}
        <div className="mb-3 flex items-center justify-between px-3 text-[11px] text-slate-400 font-medium">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Message Header */}
        <div className="mb-4 border-b border-slate-800/80 pb-2.5 text-center">
          <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 font-extrabold text-xs text-white shadow-sm">
            {resolvedSender.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-xs font-extrabold text-slate-100">{resolvedSender}</div>
          <div className="text-[10px] text-slate-400 font-medium">SMS Message • Today 9:41 AM</div>
        </div>

        {/* SMS Chat Screen Bubble Area */}
        <div className="min-h-[240px] rounded-2xl bg-slate-900/90 p-3 flex flex-col justify-end">
          <div className="relative max-w-[90%] rounded-2xl rounded-tl-sm bg-slate-800 p-3 text-xs leading-relaxed text-slate-100 shadow-md">
            <p className="whitespace-pre-wrap break-words">{renderedText}</p>

            {/* Simulated Short Link preview card if link is present */}
            {(renderedText.includes("http") || renderedText.includes("brk.os")) && (
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 p-2 text-[11px]">
                <div className="w-7 h-7 rounded-lg bg-purple-950 flex items-center justify-center text-purple-400 shrink-0">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold text-slate-200">{projectName} — Official Brochure</div>
                  <div className="truncate text-[10px] text-purple-400 font-mono">brk.os/s/x9k2</div>
                </div>
              </div>
            )}

            <div className="mt-1.5 flex items-center justify-end gap-1 text-[9px] text-slate-400 font-bold">
              <span>9:41 AM</span>
              <CheckCheck className="w-3 h-3 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="mt-3 flex justify-center">
          <div className="h-1 w-28 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
