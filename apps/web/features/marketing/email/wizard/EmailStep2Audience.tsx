"use client";

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AudienceSelector } from "@/features/marketing/shared/AudienceSelector";
import type { AudienceSourceType, CsvLeadRow } from "@/features/marketing/types";

export interface EmailStep2AudienceProps {
  audienceSource: AudienceSourceType;
  onAudienceSourceChange: (source: AudienceSourceType) => void;
  filters: {
    temperatures?: Array<"HOT" | "WARM" | "COLD">;
    statuses?: string[];
    projectId?: string;
    minBudget?: number;
  };
  onFiltersChange: (val: any) => void;
  csvRecipients: CsvLeadRow[];
  onCsvRecipientsChange: (val: CsvLeadRow[]) => void;
  saveCsvAsCrmLeads: boolean;
  onSaveCsvAsCrmLeadsChange: (val: boolean) => void;
  projects: Array<{ id: string; name: string }>;
  apiBaseUrl: string;
  onBack: () => void;
  onNext: () => void;
}

export function EmailStep2Audience({
  audienceSource,
  onAudienceSourceChange,
  filters,
  onFiltersChange,
  csvRecipients,
  onCsvRecipientsChange,
  saveCsvAsCrmLeads,
  onSaveCsvAsCrmLeadsChange,
  projects,
  apiBaseUrl,
  onBack,
  onNext,
}: EmailStep2AudienceProps) {
  return (
    <div className="space-y-6 animate-enter">
      <AudienceSelector
        audienceSource={audienceSource}
        onSourceChange={onAudienceSourceChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
        csvRecipients={csvRecipients}
        onCsvRecipientsChange={onCsvRecipientsChange}
        saveCsvAsCrmLeads={saveCsvAsCrmLeads}
        onSaveCsvAsCrmLeadsChange={onSaveCsvAsCrmLeadsChange}
        projects={projects}
        apiBaseUrl={apiBaseUrl}
        channel="EMAIL"
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
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
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onNext}
          className="gap-2 text-xs font-bold shadow-sm"
        >
          <span>Continue to Template & Design</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
