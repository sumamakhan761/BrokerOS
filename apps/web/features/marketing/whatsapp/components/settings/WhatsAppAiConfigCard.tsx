// ============================================================================
// BrokerOS — WhatsApp AI Assistant Configuration Card
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key,
  Bot,
  Loader2,
} from 'lucide-react';
import type { WhatsAppAiConfig } from '../../types';

interface WhatsAppAiConfigCardProps {
  accountId?: string;
}

export const WhatsAppAiConfigCard: React.FC<WhatsAppAiConfigCardProps> = ({
  accountId,
}) => {
  const [provider, setProvider] = useState('groq');
  const [model, setModel] = useState('openai/gpt-oss-120b');
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an elite real estate sales advisor and concierge for an enterprise brokerage.\nYour role is to assist the client courteously, provide crisp property insights, answer pricing and schedule visit queries, and encourage booking a site visit.',
  );
  const [isActive, setIsActive] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMax, setAutoReplyMax] = useState(3);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [internalAccountId, setInternalAccountId] = useState(accountId || '');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (accountId) {
      setInternalAccountId(accountId);
    }
  }, [accountId]);

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        let currentAccountId = internalAccountId || accountId;

        if (!currentAccountId) {
          const accRes = await fetch(`${baseUrl}/api/marketing/whatsapp/config`);
          if (accRes.ok) {
            const accText = await accRes.text();
            if (accText && accText.trim().length > 0) {
              const accData = JSON.parse(accText);
              const acc = Array.isArray(accData) ? accData[0] : accData;
              if (acc?.id) {
                currentAccountId = acc.id;
                setInternalAccountId(acc.id);
              }
            }
          }
        }

        const endpoint = currentAccountId
          ? `${baseUrl}/api/marketing/whatsapp/ai/config?accountId=${currentAccountId}`
          : `${baseUrl}/api/marketing/whatsapp/ai/config`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 0) {
            const data: WhatsAppAiConfig = JSON.parse(text);
            if (data) {
              setProvider(data.provider || 'groq');
              setModel(data.model || 'openai/gpt-oss-120b');
              setApiKey(data.apiKey || '');
              if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
              setIsActive(data.isActive);
              setAutoReplyEnabled(data.autoReplyEnabled);
              setAutoReplyMax(data.autoReplyMaxPerConversation || 3);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load AI config:', err);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [baseUrl, accountId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const currentId = internalAccountId || accountId;
      const endpoint = currentId
        ? `${baseUrl}/api/marketing/whatsapp/ai/config?accountId=${currentId}`
        : `${baseUrl}/api/marketing/whatsapp/ai/config`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          apiKey: apiKey.trim(),
          systemPrompt,
          isActive,
          autoReplyEnabled,
          autoReplyMaxPerConversation: Number(autoReplyMax) || 3,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save AI configuration');
      }

      setSuccess('AI Concierge configuration successfully saved!');
    } catch (err: any) {
      setError(err?.message || 'Failed to save AI configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-base">
              WhatsApp AI Concierge & Draft Assistant
            </h3>
            <p className="text-xs text-text-secondary">
              Configure LLM provider and system prompts for one-click inbox reply drafting and auto-replies.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs font-medium text-text-secondary">Active</span>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded accent-purple-600"
          />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                const p = e.target.value;
                setProvider(p);
                if (p === 'groq') setModel('openai/gpt-oss-120b');
                else if (p === 'openai') setModel('gpt-4o-mini');
              }}
              className="w-full px-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-purple-500"
            >
              <option value="groq">Groq (Ultra-Fast Inference)</option>
              <option value="openai">OpenAI (Official)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-text-secondary">
                Model Name
              </label>
              {provider === 'groq' && (
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                  Active: openai/gpt-oss-120b
                </span>
              )}
            </div>
            <input
              type="text"
              list="groq-models"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={provider === 'groq' ? 'openai/gpt-oss-120b' : 'gpt-4o-mini'}
              className="w-full px-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary font-mono focus:outline-hidden focus:border-purple-500"
            />
            {provider === 'groq' && (
              <datalist id="groq-models">
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Flagship Reasoning & Sales Drafts)</option>
                <option value="openai/gpt-oss-20b">openai/gpt-oss-20b (Ultra-Fast Instant Replies)</option>
                <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (High Performance)</option>
              </datalist>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            BYO API Key (Optional — leave blank to use system GROQ_API_KEY from environment)
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-text-tertiary absolute left-3.5 top-2.5" />
            <input
              type="password"
              placeholder="Leave blank for system key, or enter gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary font-mono focus:outline-hidden focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            System Prompt & Advisor Persona
          </label>
          <textarea
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-purple-500 leading-relaxed"
          />
        </div>

        {/* Auto-Reply Settings */}
        <div className="p-4 bg-bg-base rounded-xl border border-border-default space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-text-primary">
                Enable Autonomous AI Inbound Auto-Replies
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoReplyEnabled}
              onChange={(e) => setAutoReplyEnabled(e.target.checked)}
              className="rounded accent-purple-600"
            />
          </div>

          {autoReplyEnabled && (
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Max consecutive AI replies before human agent handoff:
              </span>
              <input
                type="number"
                min={1}
                max={10}
                value={autoReplyMax}
                onChange={(e) => setAutoReplyMax(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-bg-surface border border-border-default rounded-lg text-xs font-bold text-center"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <span>Save AI Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
