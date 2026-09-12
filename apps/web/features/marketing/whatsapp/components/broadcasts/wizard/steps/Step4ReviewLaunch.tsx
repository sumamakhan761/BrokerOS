'use client';

import React, { useState } from 'react';
import { Send, Calendar, ArrowLeft, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  calculateWhatsAppBroadcastCost,
  USD_TO_INR_EXCHANGE_RATE,
} from '@brokeros/constants';
import { WhatsAppPreFlightModal } from '../../WhatsAppPreFlightModal';
import type { WhatsAppTemplate } from '../../../../types';

interface Step4ReviewLaunchProps {
  campaignName: string;
  setCampaignName: (s: string) => void;
  selectedTemplate: WhatsAppTemplate | null;
  totalAudienceCount: number;
  isScheduled: boolean;
  setIsScheduled: (b: boolean) => void;
  scheduleTime: string;
  setScheduleTime: (s: string) => void;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  accountPhoneNumber?: string;
}

export const Step4ReviewLaunch: React.FC<Step4ReviewLaunchProps> = ({
  campaignName,
  setCampaignName,
  selectedTemplate,
  totalAudienceCount,
  isScheduled,
  setIsScheduled,
  scheduleTime,
  setScheduleTime,
  submitting,
  onBack,
  onSubmit,
  accountPhoneNumber,
}) => {
  const [isPreFlightOpen, setIsPreFlightOpen] = useState(false);

  const templateCategory = (selectedTemplate as any)?.category || 'MARKETING';
  const costProjection = calculateWhatsAppBroadcastCost(
    totalAudienceCount,
    templateCategory
  );

  const handleOpenPreFlight = () => {
    setIsPreFlightOpen(true);
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs animate-enter">
      <div>
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <span>Step 4 — Review & Launch Broadcast</span>
          <Badge variant="brand" className="text-[10px]">
            Meta Cloud API
          </Badge>
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Review projected conversation costs, template bindings, and choose whether to send now or schedule for later.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-text-primary block mb-1.5">
            Campaign Name *
          </label>
          <Input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g. Bangalore Tech Summit VIP Invite"
            className="bg-bg-subtle text-xs"
          />
        </div>

        {/* Campaign & Pricing Summary Card */}
        <div className="rounded-xl border border-border-default bg-bg-subtle/50 p-4 space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-border-default/50">
            <span className="text-text-muted">Template:</span>
            <span className="font-semibold text-text-primary">
              {selectedTemplate?.name}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-default/50">
            <span className="text-text-muted">Category:</span>
            <span className="font-semibold text-brand-600">
              {costProjection.categoryName}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-default/50">
            <span className="text-text-muted">Audience Reach:</span>
            <span className="font-semibold text-text-primary">
              {totalAudienceCount.toLocaleString()} recipients
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-default/50">
            <span className="text-text-muted">Language:</span>
            <span className="font-semibold text-text-primary">
              {selectedTemplate?.language || 'en_US'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-default/50">
            <span className="text-text-muted">Est. Meta Cost (INR):</span>
            <span className="font-extrabold text-amber-700">
              ₹{costProjection.totalCostINR.toFixed(2)} (₹{costProjection.rateINR.toFixed(2)} / conv)
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Est. Meta Cost (USD):</span>
            <span className="font-extrabold text-emerald-700">
              ${costProjection.totalCostUSD.toFixed(2)} (at $1 = ₹{USD_TO_INR_EXCHANGE_RATE})
            </span>
          </div>
        </div>

        {/* Schedule Option */}
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-3">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="rounded border-border-default text-brand-600 focus:ring-brand-500"
            />
            Schedule for future date and time
          </label>

          {isScheduled && (
            <div className="pt-2">
              <Input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="bg-bg-subtle text-xs"
              />
            </div>
          )}
        </div>

        {/* Safety Callout */}
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Anti-spam rate pacing and 2-way team inbox synchronization are active for this broadcast.
          </span>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border-default">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={submitting}
          className="text-xs"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
        </Button>
        <Button
          onClick={handleOpenPreFlight}
          disabled={submitting || !campaignName.trim() || totalAudienceCount === 0}
          className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold px-6 gap-1.5"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Launching...
            </>
          ) : isScheduled ? (
            <>
              <Calendar className="mr-1.5 h-4 w-4" />
              Review & Schedule
            </>
          ) : (
            <>
              <Zap className="mr-1.5 h-4 w-4" />
              Verify & Dispatch Now
            </>
          )}
        </Button>
      </div>

      {/* Pre-Flight Confirmation Modal */}
      <WhatsAppPreFlightModal
        isOpen={isPreFlightOpen}
        onClose={() => setIsPreFlightOpen(false)}
        onConfirm={async () => {
          setIsPreFlightOpen(false);
          await onSubmit();
        }}
        isLaunching={submitting}
        campaignTitle={campaignName}
        templateName={selectedTemplate?.name || 'template'}
        templateCategory={templateCategory}
        templateLanguage={selectedTemplate?.language || 'en_US'}
        totalAudience={totalAudienceCount}
        isScheduled={isScheduled}
        scheduleTime={scheduleTime}
        accountPhoneNumber={accountPhoneNumber}
      />
    </div>
  );
};
