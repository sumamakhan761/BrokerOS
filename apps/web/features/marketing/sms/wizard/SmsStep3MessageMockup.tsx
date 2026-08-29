"use client";

import React from "react";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SmsMessageEditor } from "../components/SmsMessageEditor";
import { SmsPhoneMockup } from "../components/SmsPhoneMockup";

export interface SmsStep3MessageMockupProps {
  messageContent: string;
  onMessageContentChange: (val: string) => void;
  fromSender: string;
  dltTemplateId: string;
  onDltTemplateIdChange: (val: string) => void;
  selectedProjectName?: string;
  onBack: () => void;
  onNext: () => void;
}

export function SmsStep3MessageMockup({
  messageContent,
  onMessageContentChange,
  fromSender,
  dltTemplateId,
  onDltTemplateIdChange,
  selectedProjectName,
  onBack,
  onNext,
}: SmsStep3MessageMockupProps) {
  const isNextDisabled = !messageContent.trim();

  return (
    <div className="space-y-6 animate-enter">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Compose SMS Copy & Live Handset Preview
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Pick quick templates, insert dynamic personalization tags, and inspect character & segment limits.
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-amber-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 cols: Editor */}
          <div className="lg:col-span-7 space-y-4">
            <SmsMessageEditor
              value={messageContent}
              onChange={onMessageContentChange}
              dltTemplateId={dltTemplateId}
              onDltTemplateIdChange={onDltTemplateIdChange}
            />
          </div>

          {/* Right 5 cols: Simulator */}
          <div className="lg:col-span-5 flex justify-center sticky top-4">
            <SmsPhoneMockup
              sender={fromSender}
              messageContent={messageContent}
              projectName={selectedProjectName}
            />
          </div>
        </div>
      </div>

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
          <span>Back to Audience</span>
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onNext}
          disabled={isNextDisabled}
          className="gap-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 shadow-sm"
        >
          <span>Review & Pre-Flight</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
