// ============================================================================
// BrokerOS — SMS AI Concierge & Autoreply Configuration Card
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key,
  Bot,
  Loader2,
  Send,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  MessageSquare,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { calculateSmsSegments } from "@brokeros/constants";

export const SmsAiConfigCard: React.FC = () => {
  const [provider, setProvider] = useState<"groq" | "openai">("groq");
  const [model, setModel] = useState("openai/gpt-oss-120b");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are the AI Concierge for BrokerOS, an enterprise real estate brokerage platform.\nYour task is to craft high-conversion, polite, and ultra-concise SMS responses to prospective home buyers.\nRules:\n1. Always keep responses under 160 characters (GSM-7 single segment standard).\n2. Answer inquiries directly (pricing, visit scheduling, brochure requests).\n3. Always include a short CTA (e.g. 'Can we call you at 4 PM?' or 'Would Saturday 11 AM work for a tour?').\n4. Never mention you are an AI. Speak as the senior property consultant."
  );
  const [isActive, setIsActive] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMax, setAutoReplyMax] = useState(3);
  const [maxCharacters, setMaxCharacters] = useState(160);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testInput, setTestInput] = useState(
    "Hi, what is the starting price for a 3BHK at Skyline Luxuria? Can I tour this Sunday?"
  );
  const [testInstructions, setTestInstructions] = useState("");
  const [testOutput, setTestOutput] = useState<{
    text: string;
    modelUsed: string;
  } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/marketing/sms/ai/config`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setProvider(data.provider || "groq");
            setModel(data.model || "openai/gpt-oss-120b");
            setApiKey(data.apiKey || "");
            if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
            setIsActive(data.isActive ?? true);
            setAutoReplyEnabled(data.autoReplyEnabled ?? false);
            setAutoReplyMax(data.autoReplyMaxPerLead ?? 3);
            setMaxCharacters(data.maxCharacters ?? 160);
          }
        }
      } catch {
        toast.error("Failed to load SMS AI configuration");
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [baseUrl]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${baseUrl}/api/marketing/sms/ai/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          provider,
          model,
          apiKey: apiKey.trim() || undefined,
          systemPrompt,
          isActive,
          autoReplyEnabled,
          autoReplyMaxPerLead: autoReplyMax,
          maxCharacters,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update configuration");
      }

      toast.success("SMS AI Concierge settings saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save AI configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleTestAi = async () => {
    if (!testInput.trim()) return;
    try {
      setTesting(true);
      setTestOutput(null);
      const res = await fetch(`${baseUrl}/api/marketing/sms/ai/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: testInput.trim(),
          instructions: testInstructions.trim() || undefined,
          leadName: "Rahul Sharma",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Inference test failed");
      }

      const data = await res.json();
      setTestOutput(data);
      toast.success("SMS reply generated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error running AI test");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading SMS AI configuration...</p>
      </div>
    );
  }

  const segmentInfo = testOutput ? calculateSmsSegments(testOutput.text) : null;

  return (
    <div className="space-y-6">
      {/* ── 1. MAIN ENGINE CONFIGURATION ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Groq LPU SMS AI Concierge & Autoreply
                </h3>
                <Badge variant="brand" className="text-[10px]">
                  LPU Acceleration
                </Badge>
              </div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
                Ultra-fast real estate SMS concierge strictly constrained to concise GSM segments (&le;160 chars).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs font-bold text-[var(--text-primary)]">Engine Active</span>
            </label>
          </div>
        </div>

        {/* Provider & Model Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">Inference Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                const val = e.target.value as "groq" | "openai";
                setProvider(val);
                setModel(val === "openai" ? "gpt-4o-mini" : "openai/gpt-oss-120b");
              }}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500 bg-white"
            >
              <option value="groq">Groq (Ultra-Low Latency LPU — Recommended)</option>
              <option value="openai">OpenAI (Direct API)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">Model Architecture</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500 bg-white"
            >
              {provider === "groq" ? (
                <>
                  <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Recommended — Instant LPU)</option>
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Conversational Precision)</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (High Context)</option>
                </>
              ) : (
                <>
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Concise)</option>
                  <option value="gpt-4o">gpt-4o (Maximum Capability)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* API Key Override */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <span>API Key Override (Optional)</span>
            </label>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              Leave blank to use root <code className="text-purple-600 font-mono">GROQ_API_KEY</code>
            </span>
          </div>
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="gsk_... or sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="h-9 pr-10 text-xs font-mono"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Autoreply Controls */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Autonomous Inbound Autoreply</h4>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Automatically respond to incoming prospect SMS replies without manual agent intervention.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoReplyEnabled}
                onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">
                Max Autoreplies per Lead
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={autoReplyMax}
                  onChange={(e) => setAutoReplyMax(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <span className="text-xs font-bold font-mono px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                  {autoReplyMax}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">
                Target Character Constraint
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={maxCharacters}
                  onChange={(e) => setMaxCharacters(Number(e.target.value))}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value={160}>160 Chars (Strict 1 GSM Segment — Lowest Cost)</option>
                  <option value={320}>320 Chars (2 Segments — Detailed)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* System Prompt Instruction */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              AI Sales Concierge Persona & System Prompt
            </label>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Governs tone, compliance, pricing disclosures, and site visit booking
            </span>
          </div>
          <textarea
            rows={5}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-2 rounded-xl"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Save AI Configuration</span>
          </Button>
        </div>
      </div>

      {/* ── 2. LIVE CONCIERGE SIMULATOR & TEST BENCH ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
              SMS Concierge Live Simulator & Character Auditor
            </h4>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
            Test how the AI replies to prospective homebuyer questions, validating segment size and brevity in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-primary)]">Inbound Prospect Query</label>
            <textarea
              rows={3}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="e.g. Can you share the price list and payment plan?"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-primary)]">
              Special Context / Instruction (Optional)
            </label>
            <textarea
              rows={3}
              value={testInstructions}
              onChange={(e) => setTestInstructions(e.target.value)}
              placeholder="e.g. Mention 10:90 payment scheme and free covered parking this week only"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Simulated Lead: <span className="text-[var(--text-primary)] font-bold">Rahul Sharma</span>
          </span>
          <Button
            size="sm"
            onClick={handleTestAi}
            disabled={testing || !testInput.trim()}
            className="h-8 px-4 text-xs font-bold gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Run Test Generation</span>
          </Button>
        </div>

        {/* Live Output Render */}
        {testOutput && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>Generated SMS Reply Preview</span>
              </span>
              <Badge variant="default" className="text-[10px] font-mono">
                {testOutput.modelUsed}
              </Badge>
            </div>

            {/* Mobile SMS Message Bubble */}
            <div className="max-w-md bg-purple-600 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs text-xs leading-relaxed font-medium">
              {testOutput.text}
            </div>

            {/* Segment Breakdown */}
            {segmentInfo && (
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-purple-700 font-bold">
                  <Hash className="w-3 h-3" /> {testOutput.text.length} characters
                </span>
                <span>•</span>
                <span className="font-bold text-slate-800">
                  {segmentInfo.segments} SMS Segment{segmentInfo.segments > 1 ? "s" : ""} (
                  {segmentInfo.isUnicode ? "Unicode (UCS-2)" : "Standard GSM-7"})
                </span>
                <span>•</span>
                <span>
                  Quota used: <span className="font-mono text-slate-700 font-bold">{segmentInfo.segments} credits</span>
                </span>
                {testOutput.text.length <= 160 && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1-Segment Optimized
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
