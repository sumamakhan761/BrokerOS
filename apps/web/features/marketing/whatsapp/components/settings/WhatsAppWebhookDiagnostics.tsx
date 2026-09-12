// ============================================================================
// BrokerOS — WhatsApp Webhook & Security Diagnostics Card
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Info,
  KeyRound,
  Network,
  CheckCircle2,
} from 'lucide-react';

interface WhatsAppWebhookDiagnosticsProps {
  accountId?: string;
  verifyToken?: string;
}

export const WhatsAppWebhookDiagnostics: React.FC<WhatsAppWebhookDiagnosticsProps> = ({
  accountId,
  verifyToken = 'brokeros-verify-token-secret',
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const publicApiUrl = (
    process.env.API_PUBLIC_URL ||
    process.env.BACKEND_URL ||
    ''
  ).replace(/\/$/, '');

  const baseUrl =
    publicApiUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com');
  const webhookUrl = `${baseUrl}/api/marketing/whatsapp/webhook`;

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary text-base">Meta Webhook & Security Configuration</h3>
          <p className="text-xs text-text-tertiary">
            Required endpoints and secrets to receive inbound messages, delivery receipts, and template approvals from Meta.
          </p>
        </div>
      </div>

      {/* Webhook URL & Verify Token */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Meta Webhook Callback URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 px-3.5 py-2.5 bg-bg-base border border-border-default rounded-xl text-xs font-mono text-text-primary select-all"
            />
            <button
              type="button"
              onClick={() => handleCopy(webhookUrl, setCopiedUrl)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-bg-subtle hover:bg-bg-muted border border-border-default rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            Paste into <strong>Meta Developer Dashboard → WhatsApp → Configuration → Callback URL</strong>.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Verification Token
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={verifyToken}
              className="flex-1 px-3.5 py-2.5 bg-bg-base border border-border-default rounded-xl text-xs font-mono text-text-primary select-all"
            />
            <button
              type="button"
              onClick={() => handleCopy(verifyToken, setCopiedToken)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-bg-subtle hover:bg-bg-muted border border-border-default rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            Must match the string entered in Meta's Webhook verification challenge modal.
          </p>
        </div>
      </div>

      {/* Security Best Practices / App Secret */}
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Meta App Secret & HMAC Signature Verification</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          BrokerOS validates the <code>X-Hub-Signature-256</code> HMAC header on every inbound webhook payload to protect against forged requests.
          Ensure your root <code>.env</code> file contains <code>META_APP_SECRET=&lt;your-app-secret&gt;</code> (found in Meta App Settings &rarr; Basic).
        </p>
      </div>

      {/* Required Webhook Subscriptions */}
      <div className="border-t border-border-default pt-4 space-y-2.5">
        <div className="text-xs font-semibold text-text-secondary">Subscribed Webhook Fields:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2.5 bg-bg-base/60 border border-border-default rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div>
              <span className="font-mono font-medium text-text-primary">messages</span>
              <p className="text-[10px] text-text-muted">Inbound chats, delivery & read receipts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-bg-base/60 border border-border-default rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div>
              <span className="font-mono font-medium text-text-primary">message_template_status_update</span>
              <p className="text-[10px] text-text-muted">Instant template approvals & rejections</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
