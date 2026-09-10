// ============================================================================
// BrokerOS — Email AI Assistant Configuration Card
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key,
  Bot,
  Loader2,
  Sliders,
  Send,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import type { EmailAiConfig } from '@/features/marketing/types';

interface EmailAiConfigCardProps {
  projectId?: string;
}

export const EmailAiConfigCard: React.FC<EmailAiConfigCardProps> = ({ projectId }) => {
  const [provider, setProvider] = useState<'groq' | 'openai'>('groq');
  const [model, setModel] = useState('openai/gpt-oss-120b');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an elite real estate sales advisor and concierge for an enterprise brokerage.\nYour role is to assist prospects courteously, provide crisp property insights, answer pricing and schedule visit queries, and encourage booking a site visit with our sales director.'
  );
  const [isActive, setIsActive] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMax, setAutoReplyMax] = useState(3);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testInput, setTestInput] = useState('Can you tell me about the payment schedule and can I schedule a site visit this Saturday?');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/marketing/email/ai/config`, {
          credentials: 'include',
        });
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 0) {
            const data: EmailAiConfig = JSON.parse(text);
            if (data) {
              setProvider(data.provider || 'groq');
              setModel(data.model || 'openai/gpt-oss-120b');
              setApiKey(data.apiKey || '');
              if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
              setIsActive(data.isActive ?? true);
              setAutoReplyEnabled(data.autoReplyEnabled ?? false);
              setAutoReplyMax(data.autoReplyMaxPerLead ?? 3);
            }
          }
        }
      } catch (err: any) {
        toast.error('Failed to load Email AI configuration');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [baseUrl]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/ai/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider,
          model,
          apiKey: apiKey.trim() || undefined,
          systemPrompt,
          isActive,
          autoReplyEnabled,
          autoReplyMaxPerLead: autoReplyMax,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save configuration');
      }

      toast.success('Email AI Concierge configuration saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAi = async () => {
    if (!testInput.trim()) return;
    try {
      setTesting(true);
      setTestOutput(null);
      const res = await fetch(`${baseUrl}/api/marketing/email/inbound/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leadEmail: 'test-prospect@example.com',
          senderEmail: 'sales@instance.sale',
          subject: 'Inquiry regarding payment schedule',
          bodyText: testInput,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Simulation failed');
      }

      const data = await res.json();
      setTestOutput(data?.output?.text || data?.summary || 'AI response processed successfully.');
      toast.success('AI generation test complete');
    } catch (err: any) {
      setTestOutput(`Simulation error: ${err.message}`);
      toast.error(`Test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-bg-surface border border-border-default rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
        <p className="text-xs text-text-tertiary">Loading AI Concierge configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Email AI Concierge Engine</h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                Powered by Groq high-throughput inference (<code className="px-1 py-0.5 bg-bg-subtle rounded text-purple-600 font-mono text-[11px]">openai/gpt-oss-120b</code>) for sub-second, context-aware 2-way email responses.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-500/10 text-zinc-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Model & Provider Selection */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-6">
        <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
          <Bot className="w-4 h-4 text-brand-600" />
          <span>Inference Provider & Model</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Groq Card */}
          <div
            onClick={() => {
              setProvider('groq');
              setModel('openai/gpt-oss-120b');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              provider === 'groq'
                ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/30'
                : 'border-border-default hover:border-border-hover bg-bg-surface'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-sm text-text-primary flex items-center gap-2">
                <span>Groq LPU Acceleration</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-purple-500/10 text-purple-600 rounded">
                  Recommended
                </span>
              </div>
              <input
                type="radio"
                checked={provider === 'groq'}
                onChange={() => {}}
                className="text-purple-600 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Ultra-low latency LPU engine. Evaluates lead emails in ~300ms with deep real estate reasoning.
            </p>
            <div className="text-xs font-mono bg-bg-subtle px-2.5 py-1.5 rounded-lg text-text-primary border border-border-default">
              Model: openai/gpt-oss-120b
            </div>
          </div>

          {/* OpenAI Card */}
          <div
            onClick={() => {
              setProvider('openai');
              setModel('gpt-4o-mini');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              provider === 'openai'
                ? 'border-brand-600 bg-brand-500/5 ring-1 ring-brand-600/30'
                : 'border-border-default hover:border-border-hover bg-bg-surface'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-sm text-text-primary">OpenAI Standard API</div>
              <input
                type="radio"
                checked={provider === 'openai'}
                onChange={() => {}}
                className="text-brand-600 focus:ring-brand-500"
              />
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Standard OpenAI models. Reliable, general purpose multilingual understanding.
            </p>
            <div className="text-xs font-mono bg-bg-subtle px-2.5 py-1.5 rounded-lg text-text-primary border border-border-default">
              Model: gpt-4o-mini
            </div>
          </div>
        </div>

        {/* API Key Override */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-text-secondary">
            Custom API Key (Optional)
          </label>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave empty to use root .env infrastructure key (GROQ_API_KEY / OPENAI_API_KEY)"
              className="pr-10 text-xs font-mono"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-text-tertiary flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Keys are AES-256 encrypted at rest before storing in database.
          </p>
        </div>
      </div>

      {/* Autonomous Behavior & Guardrails */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-5">
        <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-600" />
          <span>Automation Guardrails & Loop Protection</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-bg-subtle border border-border-default">
            <div>
              <div className="text-xs font-semibold text-text-primary">Autonomous Autoreply</div>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                Automatically reply to incoming lead questions if an AI Reply node is triggered in an active Flow.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoReplyEnabled}
              onChange={(e) => setAutoReplyEnabled(e.target.checked)}
              className="w-4 h-4 mt-1 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-bg-subtle border border-border-default">
            <div>
              <div className="text-xs font-semibold text-text-primary">Max AI Replies Per Lead</div>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                Safeguard against infinite auto-responder loops between two bot systems.
              </p>
            </div>
            <input
              type="number"
              min={1}
              max={10}
              value={autoReplyMax}
              onChange={(e) => setAutoReplyMax(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 bg-bg-surface border border-border-default rounded-lg text-xs font-semibold text-center"
            />
          </div>
        </div>
      </div>

      {/* System Prompt & Concierge Identity */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>Master Concierge Persona & Guidelines</span>
          </h4>
          <span className="text-[11px] text-text-tertiary">
            Markdown and HTML formatting supported
          </span>
        </div>

        <textarea
          rows={5}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full px-3.5 py-3 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans leading-relaxed"
          placeholder="Instruct the AI on tone, real estate disclaimers, appointment scheduling guidelines..."
        />

        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-blue-700 dark:text-blue-400">
          <strong>Context Injection:</strong> The engine automatically injects the recipient's name, campaign title, project brochure link, starting price, and developer identity directly into the prompt context when generating replies.
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-text-tertiary">
          Changes take effect immediately across all active Email Flows.
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 px-6 font-semibold shadow-xs"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Save AI Settings</span>
            </>
          )}
        </Button>
      </div>

      {/* Live AI Test Bench */}
      <div className="border-t border-border-default pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Live Concierge Test Bench</h4>
            <p className="text-xs text-text-tertiary">
              Simulate an inbound prospect query to test the prompt tone, token speed, and formatting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type a sample customer question..."
            className="text-xs"
          />
          <Button
            onClick={handleTestAi}
            disabled={testing || !testInput.trim()}
            variant="outline"
            className="gap-2 shrink-0 font-medium text-xs"
          >
            {testing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Test Reply</span>
              </>
            )}
          </Button>
        </div>

        {testOutput && (
          <div className="p-4 rounded-xl bg-bg-subtle border border-border-default space-y-1.5">
            <div className="text-[11px] font-bold text-text-tertiary uppercase">Simulator Output:</div>
            <div className="text-xs text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
              {testOutput}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
