// ============================================================================
// BrokerOS — Email Inbound Webhook & Provider Diagnostics Card
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Info,
  Network,
  CheckCircle2,
  Play,
  Loader2,
  Terminal,
  Globe,
  Radio,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export const EmailWebhookDiagnostics: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulation state
  const [simProvider, setSimProvider] = useState('SENDGRID');
  const [leadEmail, setLeadEmail] = useState('rahul.sharma@example.com');
  const [senderEmail, setSenderEmail] = useState('sumama@instance.sale');
  const [subject, setSubject] = useState('Re: Skyline Crest Luxury Residences - Price and visit inquiry');
  const [bodyText, setBodyText] = useState('Hi, could you send me the price breakdown and payment plans? Also I would like to visit the site this Saturday.');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const endpoints = [
    {
      provider: 'SendGrid Inbound Parse',
      key: 'sendgrid',
      method: 'POST',
      url: `${baseUrl}/api/marketing/email/inbound/sendgrid`,
      desc: 'Configured under SendGrid > Settings > Inbound Parse. Accepts multipart form data.',
    },
    {
      provider: 'AWS SES SNS Notification',
      key: 'ses',
      method: 'POST',
      url: `${baseUrl}/api/marketing/email/inbound/ses`,
      desc: 'Configured in AWS SES Receipt Rules to SNS Topic with HTTP/HTTPS subscription.',
    },
    {
      provider: 'Brevo Inbound Webhook',
      key: 'brevo',
      method: 'POST',
      url: `${baseUrl}/api/marketing/email/inbound/brevo`,
      desc: 'Configured in Brevo Transactional > Webhooks > Inbound emails.',
    },
    {
      provider: 'Mailchimp / Mandrill Inbound',
      key: 'mailchimp',
      method: 'POST',
      url: `${baseUrl}/api/marketing/email/inbound/mailchimp`,
      desc: 'Configured under Mandrill Inbound Domains webhook URL.',
    },
    {
      provider: 'Universal Inbound API',
      key: 'universal',
      method: 'POST',
      url: `${baseUrl}/api/marketing/email/inbound`,
      desc: 'Generic JSON payload adapter for custom SMTP relays, Postfix, or Haraka mail servers.',
    },
  ];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Webhook URL copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSimulating(true);
      setSimResult(null);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiBase}/api/marketing/email/inbound/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leadEmail,
          senderEmail,
          subject,
          bodyText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Simulation test failed');
      }

      setSimResult(data);
      toast.success('Inbound email simulation completed!');
    } catch (err: any) {
      toast.error(err.message || 'Simulation error');
      setSimResult({ error: err.message });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Inbound Email Webhooks & Diagnostics</h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Dedicated endpoints for all 4 supported enterprise mail providers. Inbound replies are matched against campaign recipients, logged, and routed through active Email Flows.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Endpoints Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
          Provider Webhook Endpoints
        </h4>

        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div
              key={ep.key}
              className="p-4 rounded-xl border border-border-default bg-bg-subtle/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600">
                    {ep.method}
                  </span>
                  <span>{ep.provider}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(ep.key, ep.url)}
                  className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  {copiedKey === ep.key ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="font-mono text-xs text-text-secondary bg-bg-surface px-3 py-1.5 rounded-lg border border-border-subtle break-all">
                {ep.url}
              </div>

              <p className="text-[11px] text-text-tertiary">{ep.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DNS MX Setup Guide */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-600" />
          <span>Inbound DNS & MX Record Configuration</span>
        </h4>

        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
          <strong>Subdomain Recommendation:</strong> We recommend delegating an inbound subdomain (e.g. <code className="font-mono">inbound.yourdomain.com</code>) to preserve your main Google Workspace or Microsoft 365 MX records.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-default text-text-tertiary text-left">
                <th className="py-2 font-semibold">Type</th>
                <th className="py-2 font-semibold">Host / Name</th>
                <th className="py-2 font-semibold">Priority</th>
                <th className="py-2 font-semibold">Value / Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-text-secondary">
              <tr>
                <td className="py-2.5 font-bold text-text-primary">MX</td>
                <td className="py-2.5">inbound.yourdomain.com</td>
                <td className="py-2.5">10</td>
                <td className="py-2.5">mx.sendgrid.net.</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-text-primary">MX</td>
                <td className="py-2.5">inbound.yourdomain.com</td>
                <td className="py-2.5">10</td>
                <td className="py-2.5">inbound-smtp.ap-south-1.amazonaws.com.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Interactive Inbound Simulator */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Live Inbound Flow Simulator</h4>
            <p className="text-xs text-text-tertiary">
              Emulate an incoming customer reply to inspect flow matching, keyword evaluation, tag assignments, and AI generation.
            </p>
          </div>
        </div>

        <form onSubmit={handleRunSimulation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Prospect Lead Email (From)
              </label>
              <Input
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                placeholder="lead@gmail.com"
                className="text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Sender Domain Mailbox (To)
              </label>
              <Input
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="sumama@instance.sale"
                className="text-xs font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Email Subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Re: Skyline Residences"
              className="text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Inbound Email Body
            </label>
            <textarea
              rows={3}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Can you send price details?"
              className="w-full px-3 py-2 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={simulating}
            className="gap-2 font-semibold text-xs shadow-xs"
          >
            {simulating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Inbound Webhook...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Inbound Reply</span>
              </>
            )}
          </Button>
        </form>

        {/* Simulator Results Display */}
        {simResult && (
          <div className="p-4 rounded-xl bg-bg-subtle border border-border-default space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-brand-600" />
                <span>Simulation Execution Summary</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                {simResult.status || (simResult.error ? 'FAILED' : 'SUCCESS')}
              </span>
            </div>

            {simResult.matchedCampaign && (
              <div className="text-xs text-text-secondary">
                Matched Broadcast Campaign: <strong>{simResult.matchedCampaign.title}</strong>{' '}
                <span className="text-text-tertiary">({simResult.matchedCampaign.id})</span>
              </div>
            )}

            {simResult.matchedFlow && (
              <div className="text-xs text-text-secondary">
                Matched Flow Automation: <strong>{simResult.matchedFlow.name}</strong>
              </div>
            )}

            <pre className="p-3 bg-zinc-950 text-zinc-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed">
              {JSON.stringify(simResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
