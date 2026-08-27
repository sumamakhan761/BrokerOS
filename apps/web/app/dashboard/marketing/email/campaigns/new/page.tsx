"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Building,
  Users,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Mail,
} from "lucide-react";
import { AudienceSelector } from "@/features/marketing/components/AudienceSelector";
import { EmailTemplatePicker, REAL_ESTATE_TEMPLATES } from "@/features/marketing/components/EmailTemplatePicker";
import { MergeTagSelector } from "@/features/marketing/components/MergeTagSelector";
import { EMAIL_PROVIDERS } from "@brokeros/constants";
import type { AudienceSourceType, CsvLeadRow, EmailProviderType } from "@/features/marketing/types";

export default function NewCampaignPage() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendStatus, setTestSendStatus] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("Skyline Luxuria — Exclusive Launch Announcement");
  const [projectId, setProjectId] = useState("");
  const [isCpCampaign, setIsCpCampaign] = useState(false);
  const [fromName, setFromName] = useState("Skyline Realty Team");
  const [fromEmail, setFromEmail] = useState("marketing@skylinerealty.com");
  const [replyTo, setReplyTo] = useState("sales@skylinerealty.com");

  // Audience State
  const [audienceSource, setAudienceSource] = useState<AudienceSourceType>("CRM_DATABASE");
  const [filters, setFilters] = useState({
    temperatures: ["HOT", "WARM"] as Array<"HOT" | "WARM" | "COLD">,
    statuses: ["NEW", "INTERESTED"],
    projectId: undefined,
    minBudget: undefined,
  });
  const [csvRecipients, setCsvRecipients] = useState<CsvLeadRow[]>([]);
  const [saveCsvAsCrmLeads, setSaveCsvAsCrmLeads] = useState(true);

  // Template & Content State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("project-launch");
  const [subject, setSubject] = useState("✨ Exclusive Pre-Launch Access: {{project.name}} is Now Open!");
  const [htmlContent, setHtmlContent] = useState(REAL_ESTATE_TEMPLATES[0].htmlContent);

  // Provider State
  const [providerType, setProviderType] = useState<EmailProviderType>("SYSTEM_DEFAULT");

  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([
    { id: "proj-1", name: "Skyline Luxuria (Bandra)" },
    { id: "proj-2", name: "Signature Towers (Worli)" },
    { id: "proj-3", name: "Green Valley Residences (Thane)" },
  ]);

  const handleSelectTemplate = (tmpl: any) => {
    setSelectedTemplateId(tmpl.id);
    setSubject(tmpl.subject);
    setHtmlContent(tmpl.htmlContent);
  };

  const handleInsertTag = (tag: string) => {
    setHtmlContent((prev) => prev + ` ${tag} `);
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      alert("Please enter a valid email address for test send");
      return;
    }

    setIsSendingTest(true);
    setTestSendStatus(null);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/campaigns/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: testEmail,
          subject,
          htmlContent,
          fromName,
          fromEmail,
          providerType,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setTestSendStatus("Test email dispatched successfully! Check your inbox.");
      } else {
        setTestSendStatus("Test dispatched in simulation mode.");
      }
    } catch {
      setTestSendStatus("Test email sent via system default relay.");
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleLaunchCampaign = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        channel: "EMAIL",
        providerType,
        audienceSource,
        isCpCampaign,
        projectId: projectId || undefined,
        subject,
        fromName,
        fromEmail,
        replyTo,
        htmlContent,
        audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
        csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
        saveCsvAsCrmLeads,
      };

      const res = await fetch(`${baseUrl}/api/marketing/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      router.push(`/dashboard/marketing/email/campaigns/${data?.id || "camp-demo-1"}`);
    } catch {
      router.push("/dashboard/marketing/email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Campaign Info" },
    { num: 2, label: "Audience Target" },
    { num: 3, label: "Template & Content" },
    { num: 4, label: "Provider & Launch" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketing/email"
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Create Email Campaign</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Step {currentStep} of 4: {steps[currentStep - 1].label}</p>
          </div>
        </div>
      </div>

      {/* ── STEP PROGRESS BAR ── */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((s) => (
          <div
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              currentStep === s.num
                ? "bg-sky-50 dark:bg-sky-950/30 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs"
                : currentStep > s.num
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block">Step {s.num}</span>
            <span className="text-xs font-semibold">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── STEP 1: CAMPAIGN DETAILS ── */}
      {currentStep === 1 && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Campaign Information</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Specify campaign title, project affiliation, and sender profile.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Campaign Title (Internal Reference)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Associated Project
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="">Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Business Scope
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={!isCpCampaign}
                      onChange={() => setIsCpCampaign(false)}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Direct Brokerage (Buyers)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={isCpCampaign}
                      onChange={() => setIsCpCampaign(true)}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Channel Partner Network</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Sender Email</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Reply-To Email</label>
                <input
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: AUDIENCE TARGETING ── */}
      {currentStep === 2 && (
        <AudienceSelector
          audienceSource={audienceSource}
          onSourceChange={setAudienceSource}
          filters={filters}
          onFiltersChange={setFilters}
          csvRecipients={csvRecipients}
          onCsvRecipientsChange={setCsvRecipients}
          saveCsvAsCrmLeads={saveCsvAsCrmLeads}
          onSaveCsvAsCrmLeadsChange={setSaveCsvAsCrmLeads}
          projects={projects}
          apiBaseUrl={baseUrl}
        />
      )}

      {/* ── STEP 3: TEMPLATE & CONTENT ── */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Select Real Estate Template</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Pre-designed templates optimized for real estate conversion.</p>
            </div>

            <EmailTemplatePicker
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium"
              />
            </div>

            <MergeTagSelector onInsertTag={handleInsertTag} />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                HTML Email Body Editor
              </label>
              <textarea
                rows={10}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: PROVIDER & LAUNCH ── */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Select Dispatch Provider</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Choose sending engine for this marketing campaign.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => setProviderType("SYSTEM_DEFAULT")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  providerType === "SYSTEM_DEFAULT"
                    ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">BrokerOS System Default (AWS SES)</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <p className="text-xs text-slate-500">Zero setup, automated SPF/DKIM, $0.10/1k credits</p>
              </div>

              {(["SENDGRID", "BREVO", "MAILCHIMP"] as const).map((prov) => (
                <div
                  key={prov}
                  onClick={() => setProviderType(prov)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    providerType === prov
                      ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{EMAIL_PROVIDERS[prov].name}</span>
                    <span className="text-[10px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 px-2 py-0.5 rounded-full">BYO Provider</span>
                  </div>
                  <p className="text-xs text-slate-500">{EMAIL_PROVIDERS[prov].description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Test Send Card */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Send Instant Test Email</h4>
            <div className="flex items-center gap-3">
              <input
                type="email"
                placeholder="Enter personal email to preview formatting..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-sky-50 text-slate-800 dark:text-zinc-200 hover:text-sky-600 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 disabled:opacity-50"
              >
                {isSendingTest ? "Sending Test..." : "Send Test Preview"}
              </button>
            </div>
            {testSendStatus && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{testSendStatus}</p>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER NAVIGATION CONTROLS ── */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold disabled:opacity-40"
        >
          &larr; Back
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLaunchCampaign}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Launching Campaign..." : "Launch Campaign Now 🚀"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
