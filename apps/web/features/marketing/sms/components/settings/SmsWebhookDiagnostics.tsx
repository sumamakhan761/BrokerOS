// ============================================================================
// BrokerOS — SMS Inbound Webhook & Carrier Simulator Diagnostics Card
// ============================================================================

"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Copy,
  Check,
  Play,
  Loader2,
  Terminal,
  Globe,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export const SmsWebhookDiagnostics: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulation state
  const [simProvider, setSimProvider] = useState("TWILIO");
  const [leadPhone, setLeadPhone] = useState("+919876543210");
  const [senderPhone, setSenderPhone] = useState("+18005550199");
  const [messageText, setMessageText] = useState(
    "YES, please send me the payment plan for Skyline Luxuria and book a site visit for Saturday."
  );
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const endpoints = [
    {
      provider: "Twilio Programmable SMS Webhook",
      key: "twilio",
      method: "POST",
      url: `${baseUrl}/api/marketing/sms/inbound/twilio`,
      desc: "Set under Twilio Console > Phone Numbers > Configure > A MESSAGE COMES IN (Webhook).",
    },
    {
      provider: "AWS SNS / Pinpoint Topic Webhook",
      key: "aws-sns",
      method: "POST",
      url: `${baseUrl}/api/marketing/sms/inbound/aws-sns`,
      desc: "Configure an HTTPS Subscription on your AWS SNS Topic receiving inbound SMS notifications.",
    },
    {
      provider: "Sinch SMS Inbound Callback",
      key: "sinch",
      method: "POST",
      url: `${baseUrl}/api/marketing/sms/inbound/sinch`,
      desc: "Configured in Sinch Dashboard > Numbers > Delivery & Inbound SMS Callbacks.",
    },
    {
      provider: "Gupshup Enterprise Inbound Webhook",
      key: "gupshup",
      method: "POST",
      url: `${baseUrl}/api/marketing/sms/inbound/gupshup`,
      desc: "Set under Gupshup Enterprise SMS Callback URL for DLT / Long-code 2-way traffic.",
    },
    {
      provider: "Universal Inbound SMS API",
      key: "universal",
      method: "POST",
      url: `${baseUrl}/api/marketing/sms/inbound`,
      desc: "Standard JSON webhook for custom SMS aggregators, SMPP gateways, or private relays.",
    },
  ];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSimulating(true);
      setSimResult(null);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiBase}/api/marketing/sms/inbound/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          provider: simProvider,
          from: leadPhone.trim(),
          to: senderPhone.trim(),
          text: messageText.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Simulation request failed");
      }

      const data = await res.json();
      setSimResult(data);
      toast.success("Inbound SMS simulated and processed");
    } catch (err: any) {
      toast.error(err.message || "Failed to simulate inbound SMS");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. CARRIER WEBHOOK DIRECTORY ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Carrier Inbound Webhook Endpoints
            </h3>
          </div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
            Register these public URLs inside your carrier dashboards to route replies directly into the Live Inbox and Flow Engine.
          </p>
        </div>

        <div className="space-y-3">
          {endpoints.map((ep) => {
            const isCopied = copiedKey === ep.key;
            return (
              <div
                key={ep.key}
                className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{ep.provider}</span>
                    <Badge variant="default" className="text-[10px] font-mono">
                      {ep.method}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-purple-700 bg-purple-50/70 px-2 py-0.5 rounded-md border border-purple-100 truncate block max-w-full">
                      {ep.url}
                    </code>
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{ep.desc}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(ep.key, ep.url)}
                  className="h-8 px-3 text-xs font-bold gap-1.5 shrink-0 rounded-xl"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Copied" : "Copy URL"}</span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. INTERACTIVE INBOUND CARRIER SIMULATOR ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Interactive Inbound Carrier Simulator
            </h3>
          </div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
            Test carrier reply payloads end-to-end without spending SMS carrier credits. Verifies conversation threading, trigger matching, and AI concierge replies.
          </p>
        </div>

        <form onSubmit={handleRunSimulation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">Simulated Carrier</label>
              <select
                value={simProvider}
                onChange={(e) => setSimProvider(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
              >
                <option value="TWILIO">Twilio SMS</option>
                <option value="AWS_SNS">AWS SNS / Pinpoint</option>
                <option value="SINCH">Sinch</option>
                <option value="GUPSHUP">Gupshup</option>
                <option value="UNIVERSAL">Universal Inbound</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">From (Lead Phone)</label>
              <Input
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="+919876543210"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">To (Your Sender Phone)</label>
              <Input
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="+18005550199"
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">Inbound SMS Content</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={simulating || !messageText.trim()}
              className="h-9 px-5 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Simulate Inbound Event</span>
            </Button>
          </div>
        </form>

        {/* Live Simulator Response Output */}
        {simResult && (
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-3 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Simulation Execution Pipeline</span>
              </span>
              <span className="text-[11px] text-slate-500">Status: 200 OK</span>
            </div>

            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <div className="text-slate-300">
                &gt; Inbound webhook received for carrier: <span className="text-amber-400">{simResult.provider || simProvider}</span>
              </div>
              <div className="text-slate-300">
                &gt; Thread Continuity Verified: Conversation <span className="text-emerald-400">#{simResult.conversationId || "conv-active"}</span>
              </div>
              {simResult.flowsTriggered !== undefined && (
                <div className="text-slate-300">
                  &gt; 2-Way Automation Flows Triggered: <span className="text-purple-400 font-bold">{simResult.flowsTriggered} flow(s)</span>
                </div>
              )}
              {simResult.aiReplyGenerated && (
                <div className="text-emerald-300 flex items-start gap-1 mt-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>AI Autoreply Dispatched: "{simResult.aiReplyText || "Thank you for reaching out!"}"</span>
                </div>
              )}
            </div>

            <pre className="p-3 bg-black/40 rounded-lg text-[10px] text-slate-400 overflow-x-auto">
              {JSON.stringify(simResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
