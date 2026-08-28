"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Mail,
  FileSpreadsheet,
  Eye,
  Code2,
  Check,
  FileText,
  HelpCircle,
  Save,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AudienceSelector } from "@/features/marketing/components/AudienceSelector";
import { EmailTemplatePicker, REAL_ESTATE_TEMPLATES } from "@/features/marketing/components/EmailTemplatePicker";
import { MergeTagSelector } from "@/features/marketing/components/MergeTagSelector";
import { EMAIL_PROVIDERS } from "@brokeros/constants";
import type { AudienceSourceType, CsvLeadRow, EmailProviderType } from "@/features/marketing/types";

const DRAFT_STORAGE_KEY = "brokeros_campaign_draft_v1";

export default function NewCampaignPage() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendStatus, setTestSendStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [editorTab, setEditorTab] = useState<"preview" | "code">("preview");

  // Auto-Save & Draft State
  const [draftCampaignId, setDraftCampaignId] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isCpCampaign, setIsCpCampaign] = useState(false);
  const [fromName, setFromName] = useState("Sales Team");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");

  // Audience State
  const [audienceSource, setAudienceSource] = useState<AudienceSourceType>("CRM_DATABASE");
  const [filters, setFilters] = useState<{
    temperatures?: Array<"HOT" | "WARM" | "COLD">;
    statuses?: string[];
    projectId?: string;
    minBudget?: number;
  }>({
    statuses: [],
    temperatures: [],
    projectId: undefined,
    minBudget: undefined,
  });
  const [csvRecipients, setCsvRecipients] = useState<CsvLeadRow[]>([]);
  const [saveCsvAsCrmLeads, setSaveCsvAsCrmLeads] = useState(true);

  // Template & Content State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("project-launch");
  const [subject, setSubject] = useState(REAL_ESTATE_TEMPLATES[0].subject);
  const [htmlContent, setHtmlContent] = useState(REAL_ESTATE_TEMPLATES[0].htmlContent);

  // Provider State
  const [providerType, setProviderType] = useState<EmailProviderType>("SYSTEM_DEFAULT");

  // Real Database Projects & Integrations
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [integrations, setIntegrations] = useState<
    Array<{
      id: string;
      provider: EmailProviderType;
      name: string;
      fromEmail: string;
      fromName: string;
      isActive: boolean;
    }>
  >([]);

  // 1. Fetch Projects & Integrations from DB
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingProjects(true);
        const [projRes, intRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/projects`),
          fetch(`${baseUrl}/api/marketing/integrations`),
        ]);

        if (projRes.ok) {
          const data = await projRes.json();
          if (Array.isArray(data)) setProjects(data);
        }
        if (intRes.ok) {
          const intData = await intRes.json();
          if (Array.isArray(intData)) setIntegrations(intData);
        }
      } catch {
        setProjects([]);
        setIntegrations([]);
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadData();
  }, [baseUrl]);

  // 2. Restore Draft from localStorage on Initial Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.title) setTitle(parsed.title);
          if (parsed.projectId) setProjectId(parsed.projectId);
          if (parsed.isCpCampaign !== undefined) setIsCpCampaign(parsed.isCpCampaign);
          if (parsed.fromName) setFromName(parsed.fromName);
          if (parsed.fromEmail) setFromEmail(parsed.fromEmail);
          if (parsed.replyTo) setReplyTo(parsed.replyTo);
          if (parsed.audienceSource) setAudienceSource(parsed.audienceSource);
          if (parsed.filters) setFilters(parsed.filters);
          if (parsed.csvRecipients) setCsvRecipients(parsed.csvRecipients);
          if (parsed.saveCsvAsCrmLeads !== undefined) setSaveCsvAsCrmLeads(parsed.saveCsvAsCrmLeads);
          if (parsed.selectedTemplateId) setSelectedTemplateId(parsed.selectedTemplateId);
          if (parsed.subject) setSubject(parsed.subject);
          if (parsed.htmlContent) setHtmlContent(parsed.htmlContent);
          if (parsed.providerType) setProviderType(parsed.providerType);
          if (parsed.draftCampaignId) setDraftCampaignId(parsed.draftCampaignId);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
          setHasRestoredDraft(true);
        }
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // 3. Save Draft to Database & LocalStorage Function
  const saveDraftToDatabase = useCallback(
    async (stepToSave?: number) => {
      // Don't save empty state before user typed anything
      if (!title.trim() && !subject.trim() && !projectId) return;

      setIsSavingDraft(true);
      try {
        const payload = {
          campaignId: draftCampaignId || undefined,
          title: title.trim() || "Untitled Draft Campaign",
          projectId: projectId || undefined,
          isCpCampaign,
          fromName: fromName || "Sales Team",
          fromEmail: fromEmail || "",
          replyTo: replyTo || undefined,
          audienceSource,
          audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
          csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
          saveCsvAsCrmLeads: audienceSource === "CSV_UPLOAD" ? saveCsvAsCrmLeads : false,
          templateId: undefined, // UI presets are stored as raw htmlContent, not DB FKs
          subject,
          htmlContent,
          providerType,
        };

        // 1. Save to Backend Database
        const res = await fetch(`${baseUrl}/api/marketing/campaigns/draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let savedId = draftCampaignId;
        if (res.ok) {
          const data = await res.json();
          if (data?.id) {
            savedId = data.id;
            setDraftCampaignId(data.id);
          }
        }

        // 2. Save snapshot to LocalStorage for instant refresh recovery
        const snapshot = {
          ...payload,
          selectedTemplateId,
          draftCampaignId: savedId,
          currentStep: stepToSave ?? currentStep,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(snapshot));

        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      } catch {
        // Fallback to local storage only if network offline
        const snapshot = {
          title,
          projectId,
          isCpCampaign,
          fromName,
          fromEmail,
          replyTo,
          audienceSource,
          filters,
          csvRecipients,
          saveCsvAsCrmLeads,
          selectedTemplateId,
          subject,
          htmlContent,
          providerType,
          draftCampaignId,
          currentStep: stepToSave ?? currentStep,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(snapshot));
      } finally {
        setIsSavingDraft(false);
      }
    },
    [
      title,
      projectId,
      isCpCampaign,
      fromName,
      fromEmail,
      replyTo,
      audienceSource,
      filters,
      csvRecipients,
      saveCsvAsCrmLeads,
      selectedTemplateId,
      subject,
      htmlContent,
      providerType,
      draftCampaignId,
      currentStep,
      baseUrl,
    ]
  );

  // 4. Auto-save when moving across steps
  const handleStepChange = (newStep: number) => {
    saveDraftToDatabase(newStep);
    setCurrentStep(newStep);
  };

  // 5. Debounced auto-save on field edits
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (title.trim() || subject.trim()) {
        saveDraftToDatabase();
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [title, projectId, subject, htmlContent, fromName, fromEmail, filters, audienceSource, saveDraftToDatabase]);

  // 6. Clear / Discard Draft
  const handleDiscardDraft = () => {
    if (confirm("Are you sure you want to discard this draft and start fresh?")) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setTitle("");
      setProjectId("");
      setIsCpCampaign(false);
      setFromName("Sales Team");
      setFromEmail("");
      setReplyTo("");
      setAudienceSource("CRM_DATABASE");
      setFilters({ statuses: [], temperatures: [], projectId: undefined, minBudget: undefined });
      setCsvRecipients([]);
      setSaveCsvAsCrmLeads(true);
      setSelectedTemplateId("project-launch");
      setSubject(REAL_ESTATE_TEMPLATES[0].subject);
      setHtmlContent(REAL_ESTATE_TEMPLATES[0].htmlContent);
      setProviderType("SYSTEM_DEFAULT");
      setDraftCampaignId(null);
      setLastSavedTime(null);
      setHasRestoredDraft(false);
      setCurrentStep(1);
    }
  };

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
      setTestSendStatus({ ok: false, msg: "Please enter a valid email address." });
      return;
    }

    const activeInt = integrations.find((i) => i.provider === providerType && i.isActive);

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
          fromName: fromName || activeInt?.fromName || "Sales Team",
          fromEmail: fromEmail || activeInt?.fromEmail || "marketing@example.com",
          providerType,
          integrationId: activeInt?.id,
          projectId: projectId || undefined,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setTestSendStatus({ ok: true, msg: "✓ Test email sent! Please check your inbox." });
      } else {
        setTestSendStatus({
          ok: false,
          msg: data?.error ? `❌ Test Send Failed: ${data.error}` : "❌ Test email failed to dispatch.",
        });
      }
    } catch (err: any) {
      setTestSendStatus({
        ok: false,
        msg: `❌ Network error: ${err?.message || "Failed to reach server"}`,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!title.trim()) {
      alert("Please enter a campaign title before launching");
      setCurrentStep(1);
      return;
    }

    const activeInt = integrations.find((i) => i.provider === providerType && i.isActive);

    setIsSubmitting(true);
    try {
      const payload = {
        campaignId: draftCampaignId || undefined,
        title,
        projectId: projectId || undefined,
        isCpCampaign,
        fromName: fromName || activeInt?.fromName || "Sales Team",
        fromEmail: fromEmail || activeInt?.fromEmail || "marketing@example.com",
        replyTo: replyTo || undefined,
        audienceSource,
        audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
        csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
        saveCsvAsCrmLeads: audienceSource === "CSV_UPLOAD" ? saveCsvAsCrmLeads : false,
        subject,
        htmlContent,
        providerType,
        integrationId: activeInt?.id,
      };

      const res = await fetch(`${baseUrl}/api/marketing/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to create campaign");
      }

      // Cleanup local draft on successful launch
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      const data = await res.json();
      router.push(`/dashboard/marketing/email/campaigns/${data.id}`);
    } catch (err: any) {
      alert(err?.message || "Failed to launch campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Campaign Info", desc: "Title & Sender Profile" },
    { num: 2, label: "Audience Target", desc: "CRM Filter or CSV" },
    { num: 3, label: "Template & Content", desc: "Visual Email Body" },
    { num: 4, label: "Provider & Launch", desc: "Engine & Pre-flight" },
  ];

  const selectedProjectObj = projects.find((p) => p.id === projectId);

  return (
    <DashboardPageWrapper
      loading={false}
      title="Create Email Campaign"
      subtitle="Follow the step-by-step wizard to target buyers, compose rich HTML templates, and dispatch high-deliverability emails."
      headerRight={
        <div className="flex items-center gap-2.5">
          {/* Auto-Save & Discard Controls */}
          {(draftCampaignId || lastSavedTime) && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-[var(--text-secondary)] shadow-xs">
              <Save className={`w-3.5 h-3.5 ${isSavingDraft ? "animate-spin text-[var(--brand-600)]" : "text-emerald-600"}`} />
              <span>
                {isSavingDraft ? "Saving draft..." : lastSavedTime ? `Draft saved (${lastSavedTime})` : "Draft saved in DB"}
              </span>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => saveDraftToDatabase()}
            disabled={isSavingDraft}
            className="gap-1.5 text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDiscardDraft}
            className="gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Draft</span>
          </Button>

          <Link href="/dashboard/marketing/email">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Campaigns</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── RESTORED DRAFT BANNER ── */}
      {hasRestoredDraft && (
        <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-[var(--brand-600)]" />
            <span className="text-xs font-bold text-[var(--brand-900)]">
              Restored in-progress campaign draft. Your progress is automatically saved to the database.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasRestoredDraft(false)}
            className="text-xs font-bold text-[var(--brand-700)] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── STEPPER HEADER ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {steps.map((s) => {
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => handleStepChange(s.num)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] ${isCurrent
                  ? "bg-purple-50/80 border-[var(--brand-500)] shadow-xs ring-2 ring-purple-500/15"
                  : isCompleted
                    ? "bg-emerald-50/50 border-emerald-300/80 hover:bg-emerald-50"
                    : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60"
                  }`}
              >
                {/* Step Icon / Number Indicator */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-colors ${isCurrent
                    ? "bg-[var(--brand-600)] text-white shadow-xs"
                    : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                    }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} /> : s.num}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-extrabold truncate ${isCurrent
                      ? "text-[var(--brand-700)]"
                      : isCompleted
                        ? "text-emerald-900"
                        : "text-[var(--text-primary)]"
                      }`}
                  >
                    {s.label}
                  </div>
                  <div className="text-[10px] font-medium text-[var(--text-muted)] truncate">
                    {s.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: CAMPAIGN INFORMATION ── */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-enter">
          {/* Card 1: Overview & Scope */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                General Campaign Setup
              </h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">
                Define campaign title and optionally link to a specific real estate project.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="campaignTitle"
                  className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                >
                  Campaign Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="campaignTitle"
                  type="text"
                  required
                  placeholder="e.g. Festive Launch Special — Towers A & B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="associatedProject"
                    className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                  >
                    Associated Real Estate Project
                  </label>
                  <select
                    id="associatedProject"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                  >
                    <option value="">No Project (General Outbound Broadcast)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {projects.length === 0 && !isLoadingProjects && (
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      No active projects in inventory. You can still send a general broadcast.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Target Business World
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCpCampaign(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${!isCpCampaign
                        ? "bg-purple-50 border-[var(--brand-500)] text-[var(--brand-700)] shadow-xs"
                        : "bg-slate-50 border-slate-200 text-[var(--text-secondary)] hover:bg-slate-100"
                        }`}
                    >
                      Direct Brokerage (Buyers)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCpCampaign(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${isCpCampaign
                        ? "bg-purple-50 border-[var(--brand-500)] text-[var(--brand-700)] shadow-xs"
                        : "bg-slate-50 border-slate-200 text-[var(--text-secondary)] hover:bg-slate-100"
                        }`}
                    >
                      Channel Partner Network
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Sender Profile */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Sender Identity & Reply Channels
                </h3>
                <p className="text-xs font-medium text-[var(--text-tertiary)]">
                  Recipients will see this sender name and email in their inbox.
                </p>
              </div>
              <Badge variant="default" className="text-[10px]">
                Sender Config
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="fromName"
                  className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                >
                  From Name
                </label>
                <input
                  id="fromName"
                  type="text"
                  placeholder="e.g. Skyline Sales Team"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="fromEmail"
                  className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                >
                  From Email Address
                </label>
                <input
                  id="fromEmail"
                  type="email"
                  placeholder="e.g. sales@yourdomain.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="replyTo"
                  className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                >
                  Reply-To Email Address
                </label>
                <input
                  id="replyTo"
                  type="email"
                  placeholder="e.g. inquiries@yourdomain.com"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: AUDIENCE TARGETING ── */}
      {currentStep === 2 && (
        <div className="animate-enter">
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
        </div>
      )}

      {/* ── STEP 3: TEMPLATE & CONTENT COMPOSER ── */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-enter">
          {/* Template Selector Card */}
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
              onSelectTemplate={handleSelectTemplate}
            />
          </div>

          {/* Subject Line & Merge Tag Insertion Card */}
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
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
              />
            </div>

            <MergeTagSelector onInsertTag={handleInsertTag} />

            {/* Split / Tabbed Editor & Live Visual Preview */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[var(--text-primary)]">
                  Email Body Content
                </label>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${editorTab === "preview"
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
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${editorTab === "code"
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
                        .replace(/\{\{project\.name\}\}/g, selectedProjectObj?.name || "The Grand Horizon")
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
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: PROVIDER SELECTION & PRE-FLIGHT LAUNCH ── */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-enter">
          {/* Pre-flight Campaign Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Pre-Flight Campaign Summary
                </h3>
                <p className="text-xs font-medium text-[var(--text-tertiary)]">
                  Review all campaign parameters before initiating final broadcast.
                </p>
              </div>
              <Badge variant="success" className="text-[10px]">
                Ready to Launch
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                  Target Audience
                </div>
                <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1">
                  {audienceSource === "CRM_DATABASE" ? "CRM Filtered Leads" : "CSV Contact List"}
                </div>
                <div className="text-[11px] font-bold text-[var(--brand-600)] mt-0.5">
                  {audienceSource === "CSV_UPLOAD"
                    ? `${csvRecipients.length} Uploaded Rows`
                    : "Live CRM Query"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                  Associated Project
                </div>
                <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
                  {selectedProjectObj?.name || "Direct Broadcast"}
                </div>
                <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
                  {isCpCampaign ? "Channel Partner" : "Direct Buyer"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                  Sender Identity
                </div>
                <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
                  {fromName || "Sales Team"}
                </div>
                <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 truncate">
                  {fromEmail || "Configured Sender"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                  Selected Engine
                </div>
                <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
                  {EMAIL_PROVIDERS[providerType]?.name || providerType}
                </div>
                <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                  Automated DKIM / SPF
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Provider Selection */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Select Dispatch Engine
              </h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">
                Choose the sending provider for this broadcast.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div
                onClick={() => setProviderType("SYSTEM_DEFAULT")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${providerType === "SYSTEM_DEFAULT"
                  ? "border-[var(--brand-500)] bg-purple-50/50 shadow-xs ring-2 ring-purple-500/15"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-xs text-[var(--text-primary)]">
                    BrokerOS Master Engine (AWS SES)
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    Active
                  </Badge>
                </div>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Zero setup required, automatic high-inbox placement, $0.10/1k credits.
                </p>
              </div>

              {(["SENDGRID", "BREVO", "MAILCHIMP"] as const).map((prov) => {
                const activeInt = integrations.find((i) => i.provider === prov && i.isActive);
                const isSelected = providerType === prov;

                return (
                  <div
                    key={prov}
                    onClick={() => {
                      setProviderType(prov);
                      if (activeInt && (!fromEmail || fromEmail === "marketing@example.com")) {
                        setFromEmail(activeInt.fromEmail);
                        setFromName(activeInt.fromName);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                      ? "border-[var(--brand-500)] bg-purple-50/50 shadow-xs ring-2 ring-purple-500/15"
                      : "border-slate-200/80 bg-white hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-[var(--text-primary)]">
                        {EMAIL_PROVIDERS[prov].name}
                      </span>
                      {activeInt ? (
                        <Badge variant="success" className="text-[10px]">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px]">
                          BYO Provider
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                      {activeInt
                        ? `Connected as ${activeInt.fromName} (${activeInt.fromEmail})`
                        : EMAIL_PROVIDERS[prov].description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Send Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div>
              <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                Send Instant Test Email (Optional)
              </h4>
              <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Send a sample email to your personal inbox to inspect layout and render quality on mobile.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                placeholder="Enter test email address (e.g. personal@gmail.com)..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="w-full sm:w-auto"
              >
                {isSendingTest ? "Dispatching Test..." : "Send Test Preview"}
              </Button>
            </div>

            {testSendStatus && (
              <p
                className={`text-xs font-bold ${testSendStatus.ok ? "text-emerald-600" : "text-rose-600"
                  }`}
              >
                {testSendStatus.msg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER WIZARD CONTROLS ── */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 bg-white p-4 rounded-2xl shadow-xs">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          &larr; Previous Step
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => handleStepChange(Math.min(4, currentStep + 1))}
            className="gap-2"
          >
            <span>Next: {steps[currentStep].label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="luxury"
            size="default"
            onClick={handleLaunchCampaign}
            disabled={isSubmitting}
            className="gap-2 font-extrabold shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Launching Campaign..." : "Launch Campaign Now 🚀"}</span>
          </Button>
        )}
      </div>
    </DashboardPageWrapper>
  );
}
