// ============================================================================
// BrokerOS — WhatsApp Cloud API Connection Card
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Phone,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  Loader2,
  Smartphone,
} from 'lucide-react';
import type { WhatsAppAccount } from '../../types';

interface WhatsAppConfigCardProps {
  accountId?: string;
  onAccountUpdated?: (account?: any) => void;
}

export const WhatsAppConfigCard: React.FC<WhatsAppConfigCardProps> = ({
  accountId,
  onAccountUpdated,
}) => {
  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/config`);
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 0) {
            const data = JSON.parse(text);
            const acc = Array.isArray(data) ? data[0] : data;
            if (acc && acc.phoneNumberId) {
              setAccount(acc);
              setPhoneNumberId(acc.phoneNumberId);
              setWabaId(acc.wabaId);
              onAccountUpdated?.(acc);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load WhatsApp account:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [baseUrl]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumberId.trim() || !wabaId.trim() || !accessToken.trim()) {
      setError('Please provide Phone Number ID, WABA ID, and a valid Access Token.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: phoneNumberId.trim(),
          wabaId: wabaId.trim(),
          accessToken: accessToken.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Meta connection verification failed');
      }

      const connected = await res.json();
      setAccount(connected);
      setAccessToken('');
      setSuccess('WhatsApp Cloud API account successfully connected!');
      onAccountUpdated?.(connected);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect WhatsApp account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-base">
              Meta WhatsApp Business Account
            </h3>
            <p className="text-xs text-text-secondary">
              Connect your official Meta Cloud API phone number and WABA credentials.
            </p>
          </div>
        </div>

        {account && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Connected</span>
          </span>
        )}
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

      {account && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-bg-base rounded-xl border border-border-default text-xs">
          <div>
            <span className="text-text-tertiary block text-[10px] uppercase font-bold">
              Display Phone
            </span>
            <span className="font-semibold text-text-primary font-mono">
              {account.displayPhoneNumber || account.displayPhone || account.phoneNumberId}
            </span>
          </div>
          <div>
            <span className="text-text-tertiary block text-[10px] uppercase font-bold">
              Verified Name
            </span>
            <span className="font-semibold text-text-primary">
              {account.verifiedName || account.businessName || 'WhatsApp Business'}
            </span>
          </div>
          <div>
            <span className="text-text-tertiary block text-[10px] uppercase font-bold">
              Quality Rating
            </span>
            <span className="font-semibold text-emerald-500">
              {account.qualityRating || 'GREEN'}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleConnect} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Phone Number ID *
            </label>
            <input
              type="text"
              placeholder="e.g. 109283746501928"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="w-full px-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary font-mono focus:outline-hidden focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              WhatsApp Business Account ID (WABA) *
            </label>
            <input
              type="text"
              placeholder="e.g. 293847561029384"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              className="w-full px-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary font-mono focus:outline-hidden focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            System User Access Token * (Encrypted via AES-256-GCM)
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-text-tertiary absolute left-3.5 top-2.5" />
            <input
              type="password"
              placeholder="EAABw..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary font-mono focus:outline-hidden focus:border-brand-500"
            />
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            Generate a permanent System User token on Meta Business Manager with `whatsapp_business_messaging` permissions.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-2xs disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Meta Connection...</span>
              </>
            ) : (
              <span>{account ? 'Update Credentials' : 'Connect Account'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
