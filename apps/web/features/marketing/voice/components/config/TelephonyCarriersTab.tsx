'use client';

import React, { useState } from 'react';
import {
  Phone,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react';
import { VOICE_TELEPHONY_PROVIDERS } from '@brokeros/constants';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type {
  VoiceTelephonyIntegrationRecord,
  VoiceTelephonyType,
} from '@/features/marketing/types';

interface TelephonyCarriersTabProps {
  telephonyIntegrations: VoiceTelephonyIntegrationRecord[];
  onAddTelephony: (data: any) => Promise<void>;
  onDeleteTelephony: (id: string) => Promise<void>;
}

export const TelephonyCarriersTab: React.FC<TelephonyCarriersTabProps> = ({
  telephonyIntegrations,
  onAddTelephony,
  onDeleteTelephony,
}) => {
  const [selectedTelephonyProvider, setSelectedTelephonyProvider] =
    useState<VoiceTelephonyType | null>(null);

  const [telName, setTelName] = useState('');
  const [telAccountSid, setTelAccountSid] = useState('');
  const [telAuthToken, setTelAuthToken] = useState('');
  const [telApiKey, setTelApiKey] = useState('');
  const [telApiToken, setTelApiToken] = useState('');
  const [telFromNumbers, setTelFromNumbers] = useState('');
  const [telSubdomain, setTelSubdomain] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenTelephonyModal = (prov: VoiceTelephonyType) => {
    setSelectedTelephonyProvider(prov);
    setTelName(`${(VOICE_TELEPHONY_PROVIDERS as any)[prov]?.name || prov} Line`);
    setTelAccountSid('');
    setTelAuthToken('');
    setTelApiKey('');
    setTelApiToken('');
    setTelFromNumbers('');
    setTelSubdomain('');
  };

  const handleSaveTelephony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTelephonyProvider || !telName.trim()) return;

    try {
      setSubmitting(true);
      const numbers = telFromNumbers
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      await onAddTelephony({
        provider: selectedTelephonyProvider,
        name: telName.trim(),
        accountSid: telAccountSid || undefined,
        authToken: telAuthToken || undefined,
        apiKey: telApiKey || undefined,
        apiToken: telApiToken || undefined,
        subdomain: telSubdomain || undefined,
        fromNumbers: numbers,
        isDefault: telephonyIntegrations.length === 0,
      });

      setSelectedTelephonyProvider(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to verify and connect telephony carrier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Connected Telephony Gateways */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Connected Telephony Carrier Trunks
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Your connected carrier trunks (Twilio, Vobiz AI, Exotel, Telnyx) for outbound PSTN dialing and Caller IDs.
          </p>
        </div>

        {telephonyIntegrations.length === 0 ? (
          <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
            <Phone className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">
              No telephony carriers connected yet
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Connect your Twilio, Vobiz AI, Exotel, or Telnyx accounts below to enable live phone dialing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {telephonyIntegrations.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                          {item.name}
                        </h4>
                        <Badge variant="default" className="text-[10px]">
                          {item.provider}
                        </Badge>
                        {item.isDefault && (
                          <Badge variant="success" className="text-[9px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1 font-mono">
                        Caller IDs:{' '}
                        <span className="text-[var(--text-primary)] font-bold">
                          {item.fromNumbers?.length
                            ? item.fromNumbers.join(', ')
                            : 'None configured'}
                        </span>
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTelephony(item.id)}
                      className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-[11px]">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for dialing
                  </span>
                  <span className="text-[var(--text-muted)]">
                    Connected {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Telephony Adapters Directory */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Available Telephony Carrier Adapters
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Connect programmable carrier trunks to route broadcasts through your private billing accounts and DID lines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['TWILIO', 'VOBIZ', 'EXOTEL', 'TELNYX'] as const).map((prov) => {
            const config = (VOICE_TELEPHONY_PROVIDERS as any)[prov] || {
              name: prov,
              badge: 'PSTN Carrier',
              description: 'High concurrency voice carrier trunk',
              docsUrl: 'https://docs.brokeros.com',
            };

            return (
              <div
                key={prov}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      {config.badge}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                    {config.name}
                  </h4>
                  <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-1 line-clamp-2">
                    {config.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={config.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[var(--brand-600)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>API Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenTelephonyModal(prov)}
                    className="h-7 px-2.5 text-[11px] font-bold gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Connect</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONNECT TELEPHONY MODAL DIALOG */}
      {selectedTelephonyProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Connect {selectedTelephonyProvider} Carrier
                </h3>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Configure verified carrier credentials and outbound Caller ID numbers.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTelephonyProvider(null)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveTelephony} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Connection Nickname
                </label>
                <input
                  type="text"
                  required
                  value={telName}
                  onChange={(e) => setTelName(e.target.value)}
                  placeholder={`e.g. Production ${selectedTelephonyProvider} Line`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {selectedTelephonyProvider === 'TWILIO' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Twilio Account SID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={telAccountSid}
                      onChange={(e) => setTelAccountSid(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Twilio Auth Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••••••••••••••••••"
                      value={telAuthToken}
                      onChange={(e) => setTelAuthToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === 'VOBIZ' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Vobiz Auth ID (X-Auth-ID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Vobiz Auth Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiToken}
                      onChange={(e) => setTelApiToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === 'EXOTEL' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel Account SID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telAccountSid}
                      onChange={(e) => setTelAccountSid(e.target.value)}
                      placeholder="e.g. shiftconsultant1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel Subdomain / Cluster URL
                    </label>
                    <input
                      type="text"
                      value={telSubdomain}
                      onChange={(e) => setTelSubdomain(e.target.value)}
                      placeholder="api.exotel.com (Singapore) or api.in.exotel.com (India)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Defaults to api.exotel.com (Singapore) or api.in.exotel.com (India cluster).
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel API Key <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel API Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiToken}
                      onChange={(e) => setTelApiToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === 'TELNYX' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Telnyx API Key (v2) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      placeholder="KEYxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Call Control App ID / Connection ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={telSubdomain}
                      onChange={(e) => setTelSubdomain(e.target.value)}
                      placeholder="Auto-detected or enter specific Call Control App ID"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Leave blank to auto-detect your active Call Control Application from Telnyx.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Outbound Caller IDs (comma-separated)
                </label>
                <input
                  type="text"
                  value={telFromNumbers}
                  onChange={(e) => setTelFromNumbers(e.target.value)}
                  placeholder="+919876543210, +14155550199"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTelephonyProvider(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  <span>Save & Verify Gateway</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
