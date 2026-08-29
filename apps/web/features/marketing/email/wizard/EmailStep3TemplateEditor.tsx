"use client";

import React, { useState } from "react";
import { Sparkles, Eye, Code2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  EmailTemplatePicker,
  type TemplateOption,
} from "../components/EmailTemplatePicker";
import { EmailMergeTagSelector } from "../components/EmailMergeTagSelector";

export interface EmailStep3TemplateEditorProps {
  selectedTemplateId: string;
  onSelectTemplate: (tmpl: TemplateOption) => void;
  subject: string;
  onSubjectChange: (val: string) => void;
  htmlContent: string;
  onHtmlContentChange: (val: string) => void;
  selectedProjectName?: string;
  fromName?: string;
  onBack: () => void;
  onNext: () => void;
}

export function EmailStep3TemplateEditor({
  selectedTemplateId,
  onSelectTemplate,
  subject,
  onSubjectChange,
  htmlContent,
  onHtmlContentChange,
  selectedProjectName,
  fromName,
  onBack,
  onNext,
}: EmailStep3TemplateEditorProps) {
  const [editorTab, setEditorTab] = useState<"preview" | "code">("preview");

  const handleInsertTag = (tag: string) => {
    onSubjectChange(`${subject} ${tag}`);
  };

  const isNextDisabled = !subject.trim() || !htmlContent.trim();

  return (
    <div className="space-y-6 animate-enter">
      {/* 1. Template Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              1. Choose High-Converting Template
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Curated templates tailored for real estate project launches, festive discounts, and site visits.
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-[var(--brand-600)]" />
        </div>

        <EmailTemplatePicker
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={onSelectTemplate}
        />
      </div>

      {/* 2. Subject Line & Merge Tag Insertion Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            2. Subject Line & Dynamic Personalization
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Click merge tags below to personalize with buyer names, projects, and agent contact details.
          </p>
        </div>

        <div>
          <label
            htmlFor="emailSubject"
            className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
          >
            Email Subject Line <span className="text-rose-500">*</span>
          </label>
          <input
            id="emailSubject"
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
          />
        </div>

        <EmailMergeTagSelector onInsertTag={handleInsertTag} />

        {/* Tabbed Visual / Code Editor */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-[var(--text-primary)]">
              Email Body Content
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setEditorTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                  editorTab === "preview"
                    ? "bg-white text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visual Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                  editorTab === "code"
                    ? "bg-white text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>HTML Source</span>
              </button>
            </div>
          </div>

          {editorTab === "preview" ? (
            <div className="rounded-2xl border border-slate-200/90 bg-slate-100/70 p-4 sm:p-6 overflow-hidden min-h-[420px] flex items-center justify-center">
              <div
                className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto max-h-[560px]"
                dangerouslySetInnerHTML={{
                  __html: htmlContent
                    .replace(/\{\{lead\.firstName\}\}/g, "Rahul")
                    .replace(/\{\{lead\.lastName\}\}/g, "Sharma")
                    .replace(/\{\{project\.name\}\}/g, selectedProjectName || "The Grand Horizon")
                    .replace(/\{\{project\.startingPrice\}\}/g, "₹1.50 Cr")
                    .replace(/\{\{project\.location\}\}/g, "Prime Downtown Corridor")
                    .replace(/\{\{agent\.name\}\}/g, fromName || "Sales Team")
                    .replace(/\{\{agent\.phone\}\}/g, "+91 98000 00000")
                    .replace(/\{\{unsubscribeUrl\}\}/g, "#"),
                }}
              />
            </div>
          ) : (
            <textarea
              rows={14}
              value={htmlContent}
              onChange={(e) => onHtmlContentChange(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          )}
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
          <span>Back</span>
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onNext}
          disabled={isNextDisabled}
          className="gap-2 text-xs font-bold shadow-sm"
        >
          <span>Continue to Pre-Flight Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
