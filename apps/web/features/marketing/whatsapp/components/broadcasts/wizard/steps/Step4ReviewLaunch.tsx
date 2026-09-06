'use client';

import React from 'react';
import { Send, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
}) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-text-primary">
          Step 4 — Review & Launch Broadcast
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Give your campaign a title and choose whether to send now or schedule for later.
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

        {/* Campaign Summary Card */}
        <div className="rounded-xl border border-border-default bg-bg-subtle/50 p-4 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border-default/50">
            <span className="text-text-muted">Template:</span>
            <span className="font-semibold text-text-primary">{selectedTemplate?.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-default/50">
            <span className="text-text-muted">Audience:</span>
            <span className="font-semibold text-text-primary">{totalAudienceCount.toLocaleString()} recipients</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-default/50">
            <span className="text-text-muted">Language:</span>
            <span className="font-semibold text-text-primary">{selectedTemplate?.language || 'en_US'}</span>
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
      </div>

      <div className="flex justify-between pt-4 border-t border-border-default">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="bg-brand-600 text-white hover:bg-brand-700 text-xs font-semibold px-6"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Launching...
            </>
          ) : isScheduled ? (
            <>
              <Calendar className="mr-1.5 h-4 w-4" />
              Schedule Broadcast
            </>
          ) : (
            <>
              <Send className="mr-1.5 h-4 w-4" />
              Dispatch Campaign Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
