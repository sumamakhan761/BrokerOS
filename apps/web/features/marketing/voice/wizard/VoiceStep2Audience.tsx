import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AudienceSelector } from "@/features/marketing/shared/AudienceSelector";
import type { AudienceSourceType, CsvLeadRow } from "@/features/marketing/types";

export interface VoiceStep2AudienceProps {
  audienceSource: AudienceSourceType;
  onSourceChange: (source: AudienceSourceType) => void;
  filters: {
    temperatures?: Array<"HOT" | "WARM" | "COLD">;
    statuses?: string[];
    projectId?: string;
    minBudget?: number;
    maxBudget?: number;
  };
  onFiltersChange: (filters: any) => void;
  csvRecipients: CsvLeadRow[];
  onCsvRecipientsChange: (recipients: CsvLeadRow[]) => void;
  saveCsvAsCrmLeads: boolean;
  onSaveCsvAsCrmLeadsChange: (val: boolean) => void;
  projects?: Array<{ id: string; name: string }>;
  apiBaseUrl?: string;
  onBack?: () => void;
  onNext?: () => void;
}

export function VoiceStep2Audience({
  audienceSource,
  onSourceChange,
  filters,
  onFiltersChange,
  csvRecipients,
  onCsvRecipientsChange,
  saveCsvAsCrmLeads,
  onSaveCsvAsCrmLeadsChange,
  projects = [],
  apiBaseUrl = "",
  onBack,
  onNext,
}: VoiceStep2AudienceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
          Step 2: Target Audience & Phone Numbers
        </h2>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Select CRM leads or drop a CSV list. Automatically scrubs invalid numbers and deduplicates phones.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <AudienceSelector
          audienceSource={audienceSource}
          onSourceChange={onSourceChange}
          filters={filters}
          onFiltersChange={onFiltersChange}
          csvRecipients={csvRecipients}
          onCsvRecipientsChange={onCsvRecipientsChange}
          saveCsvAsCrmLeads={saveCsvAsCrmLeads}
          onSaveCsvAsCrmLeadsChange={onSaveCsvAsCrmLeadsChange}
          projects={projects}
          apiBaseUrl={apiBaseUrl}
          channel="VOICE"
        />
      </div>

      {/* Navigation Footer */}
      {(onBack || onNext) && (
        <div className="flex items-center justify-between pt-2">
          {onBack ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          ) : <div />}

          {onNext && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onNext}
              className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <span>Continue to Telephony Carrier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
