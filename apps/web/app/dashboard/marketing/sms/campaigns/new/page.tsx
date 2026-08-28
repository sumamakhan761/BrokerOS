"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle2,
  Sparkles,
  Zap,
  Smartphone,
  Save,
  Trash2,
  RotateCcw,
  Check,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AudienceSelector } from "@/features/marketing/components/AudienceSelector";
import { SmsMessageEditor } from "@/features/marketing/components/SmsMessageEditor";
import { SmsPhoneMockup } from "@/features/marketing/components/SmsPhoneMockup";
import { SMS_PROVIDERS, DEFAULT_SMS_TEMPLATES } from "@brokeros/constants";
import type { AudienceSourceType, CsvLeadRow, SmsProviderType } from "@/features/marketing/types";

const SMS_DRAFT_STORAGE_KEY = "brokeros_sms_campaign_draft_v2";

export default function NewSmsCampaignPage() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendStatus, setTestSendStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Auto-Save & Draft State
  const [draftCampaignId, setDraftCampaignId] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isCpCampaign, setIsCpCampaign] = useState(false);
  const [providerType, setProviderType] = useState<SmsProviderType>("TWILIO");
  const [fromSender, setFromSender] = useState("SKYLIN");
  const [dltTemplateId, setDltTemplateId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

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

  // Message Content State
  const [messageContent, setMessageContent] = useState<string>(DEFAULT_SMS_TEMPLATES[0].message);

  // Database Projects & Integrations
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [integrations, setIntegrations] = useState<
    Array<{
      id: string;
      provider: SmsProviderType;
      name: string;
      fromSender: string;
      isActive: boolean;
      isDefault: boolean;
      dltEntityId?: string;
    }>
  >([]);

  // 1. Fetch Projects & Integrations from DB
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingProjects(true);
        const [projRes, intRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/sms/projects`),
          fetch(`${baseUrl}/api/marketing/sms/integrations`),
        ]);

        if (projRes.ok) {
          const data = await projRes.json();
          if (Array.isArray(data)) setProjects(data);
        }
        if (intRes.ok) {
          const intData = await intRes.json();
          if (Array.isArray(intData)) {
            setIntegrations(intData);
            const defaultGateway = intData.find((x) => x.isDefault) || intData[0];
            if (defaultGateway && !fromSender) {
              setProviderType(defaultGateway.provider);
              setFromSender(defaultGateway.fromSender);
              if (defaultGateway.dltEntityId) setDltTemplateId(defaultGateway.dltEntityId);
            }
          }
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
      const saved = localStorage.getItem(SMS_DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.title) setTitle(parsed.title);
          if (parsed.projectId) setProjectId(parsed.projectId);
          if (parsed.isCpCampaign !== undefined) setIsCpCampaign(parsed.isCpCampaign);
          if (parsed.providerType) setProviderType(parsed.providerType);
          if (parsed.fromSender) setFromSender(parsed.fromSender);
          if (parsed.dltTemplateId) setDltTemplateId(parsed.dltTemplateId);
          if (parsed.audienceSource) setAudienceSource(parsed.audienceSource);
          if (parsed.filters) setFilters(parsed.filters);
          if (parsed.csvRecipients) setCsvRecipients(parsed.csvRecipients);
          if (parsed.saveCsvAsCrmLeads !== undefined) setSaveCsvAsCrmLeads(parsed.saveCsvAsCrmLeads);
          if (parsed.messageContent) setMessageContent(parsed.messageContent);
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
      if (!title.trim() && !messageContent.trim() && !projectId) return;

      setIsSavingDraft(true);
      try {
        const payload = {
          campaignId: draftCampaignId || undefined,
          title: title.trim() || "Untitled SMS Campaign Draft",
          projectId: projectId || undefined,
          isCpCampaign,
          providerType,
          fromSender: fromSender.trim() || "BrokerOS",
          dltTemplateId: dltTemplateId || undefined,
          audienceSource,
          audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
          csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
          saveCsvAsCrmLeads: audienceSource === "CSV_UPLOAD" ? saveCsvAsCrmLeads : false,
          messageContent,
          scheduledAt: scheduledAt || undefined,
        };

        // 1. Save to Backend Database
        const res = await fetch(`${baseUrl}/api/marketing/sms/campaigns/draft`, {
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

        // 2. Save snapshot to LocalStorage for instant recovery
        const snapshot = {
          ...payload,
          draftCampaignId: savedId,
          currentStep: stepToSave ?? currentStep,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(SMS_DRAFT_STORAGE_KEY, JSON.stringify(snapshot));

        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      } catch {
        const snapshot = {
          title,
          projectId,
          isCpCampaign,
          providerType,
          fromSender,
          dltTemplateId,
          audienceSource,
          filters,
          csvRecipients,
          saveCsvAsCrmLeads,
          messageContent,
          scheduledAt,
          draftCampaignId,
          currentStep: stepToSave ?? currentStep,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(SMS_DRAFT_STORAGE_KEY, JSON.stringify(snapshot));
      } finally {
        setIsSavingDraft(false);
      }
    },
    [
      title,
      projectId,
      isCpCampaign,
      providerType,
      fromSender,
      dltTemplateId,
      audienceSource,
      filters,
      csvRecipients,
      saveCsvAsCrmLeads,
      messageContent,
      scheduledAt,
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
      if (title.trim() || messageContent.trim()) {
        saveDraftToDatabase();
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [title, projectId, messageContent, fromSender, filters, audienceSource, saveDraftToDatabase]);

  // 6. Clear / Discard Draft
  const handleDiscardDraft = () => {
    if (confirm("Are you sure you want to discard this SMS draft and start fresh?")) {
      localStorage.removeItem(SMS_DRAFT_STORAGE_KEY);
      setTitle("");
      setProjectId("");
      setIsCpCampaign(false);
      setProviderType("TWILIO");
      setFromSender("SKYLIN");
      setDltTemplateId("");
      setScheduledAt("");
      setAudienceSource("CRM_DATABASE");
      setFilters({ statuses: [], temperatures: [], projectId: undefined, minBudget: undefined });
      setCsvRecipients([]);
      setSaveCsvAsCrmLeads(true);
      setMessageContent(DEFAULT_SMS_TEMPLATES[0].message);
      setDraftCampaignId(null);
      setLastSavedTime(null);
      setHasRestoredDraft(false);
      setCurrentStep(1);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone || testPhone.length < 7) {
      setTestSendStatus({ ok: false, msg: "Please enter a valid mobile number with country code." });
      return;
    }

    setIsSendingTest(true);
    setTestSendStatus(null);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/campaigns/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone: testPhone,
          messageContent,
          fromSender: fromSender || "BrokerOS",
          providerType,
          projectId: projectId || undefined,
          dltTemplateId: dltTemplateId || undefined,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setTestSendStatus({ ok: true, msg: `✓ Test SMS dispatched to ${testPhone}! Check your phone.` });
      } else {
        setTestSendStatus({
          ok: false,
          msg: data?.error ? `❌ Test Send Failed: ${data.error}` : "❌ Test SMS failed to dispatch.",
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
    if (!messageContent.trim()) {
      alert("Please compose your SMS message copy before launching");
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        campaignId: draftCampaignId || undefined,
        title: title.trim(),
        isCpCampaign,
        projectId: projectId || undefined,
        providerType,
        fromSender: fromSender.trim() || "BrokerOS",
        messageContent,
        dltTemplateId: dltTemplateId || undefined,
        audienceSource,
        audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
        csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
        saveCsvAsCrmLeads: audienceSource === "CSV_UPLOAD" ? saveCsvAsCrmLeads : false,
        scheduledAt: scheduledAt || undefined,
      };

      const res = await fetch(`${baseUrl}/api/marketing/sms/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to launch SMS campaign");
      }

      localStorage.removeItem(SMS_DRAFT_STORAGE_KEY);
      const data = await res.json();
      router.push(`/dashboard/marketing/sms/campaigns/${data.id}`);
    } catch (err: any) {
      alert(err?.message || "Failed to launch SMS campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Campaign Info", desc: "Title & Gateway Header" },
    { num: 2, label: "Audience Target", desc: "CRM Filter or CSV" },
    { num: 3, label: "Message & Simulator", desc: "Copy & Live Handset" },
    { num: 4, label: "Review & Launch", desc: "Pre-flight & Test SMS" },
  ];

  const selectedProjectObj = projects.find((p) => p.id === projectId);

  return (
    <DashboardPageWrapper
      loading={false}
      title="Create SMS Campaign"
      subtitle="Follow the step-by-step wizard to target contacts, compose trackable shortlink messages, and dispatch high-speed SMS broadcasts."
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

          <Link href="/dashboard/marketing/sms">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SMS Hub</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── RESTORED DRAFT BANNER ── */}
      {hasRestoredDraft && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900">
              Restored in-progress SMS campaign draft. Your changes are automatically saved to the database.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasRestoredDraft(false)}
            className="text-xs font-bold text-amber-700 hover:underline"
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
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] ${
                  isCurrent
                    ? "bg-amber-50/80 border-amber-500 shadow-xs ring-2 ring-amber-500/15"
                    : isCompleted
                    ? "bg-emerald-50/50 border-emerald-300/80 hover:bg-emerald-50"
                    : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-colors ${
                    isCurrent
                      ? "bg-amber-600 text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} /> : s.num}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-extrabold truncate ${
                      isCurrent
                        ? "text-amber-900"
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

      {/* ── STEP 1: CAMPAIGN INFORMATION & SENDER IDENTITY ── */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-enter">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  General Campaign Setup
                </h3>
                <p className="text-xs font-medium text-[var(--text-tertiary)]">
                  Define campaign title, target business world, and optional linked real estate project.
                </p>
              </div>
              <Badge variant="default" className="text-[10px]">
                Setup
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="smsCampaignTitle"
                  className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                >
                  Campaign Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="smsCampaignTitle"
                  type="text"
                  required
                  placeholder="e.g. Skyline Luxuria — Pre-Launch VIP SMS Broadcast"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="smsProjectSelect"
                    className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                  >
                    Associated Real Estate Project
                  </label>
                  <select
                    id="smsProjectSelect"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                  >
                    <option value="">No Project (General Outbound SMS)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {projects.length === 0 && !isLoadingProjects && (
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      No active projects in inventory. You can still dispatch general broadcasts.
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
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        !isCpCampaign
                          ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-[var(--text-secondary)] hover:bg-slate-100"
                      }`}
                    >
                      Direct Brokerage (Buyers)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCpCampaign(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        isCpCampaign
                          ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs"
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

          {/* Card 2: Gateway & Sender Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Carrier Gateway & Sender Header
                </h3>
                <p className="text-xs font-medium text-[var(--text-tertiary)]">
                  Configure delivery route and registered sender identity.
                </p>
              </div>
              <Badge variant="default" className="text-[10px]">
                Carrier
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="smsProviderType"
                  className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                >
                  SMS Gateway Route
                </label>
                <select
                  id="smsProviderType"
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value as SmsProviderType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                >
                  {Object.values(SMS_PROVIDERS).map((meta) => (
                    <option key={meta.id} value={meta.id}>
                      {meta.name} ({meta.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="smsFromSender"
                  className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                >
                  Sender Phone / Alphanumeric Header <span className="text-rose-500">*</span>
                </label>
                <input
                  id="smsFromSender"
                  type="text"
                  required
                  placeholder="e.g. SKYLIN or +14155550199"
                  value={fromSender}
                  onChange={(e) => setFromSender(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="smsDltId"
                  className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
                >
                  DLT Principal Entity ID (Optional)
                </label>
                <input
                  id="smsDltId"
                  type="text"
                  placeholder="e.g. 1701159123456789"
                  value={dltTemplateId}
                  onChange={(e) => setDltTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleStepChange(2)}
              className="gap-2 text-xs font-bold"
            >
              <span>Continue to Audience</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: AUDIENCE TARGETING ── */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-enter">
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

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleStepChange(1)}
              className="gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Setup</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleStepChange(3)}
              className="gap-2 text-xs font-bold"
            >
              <span>Continue to Message Copy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: MESSAGE COMPOSER & PHONE SIMULATOR ── */}
      {currentStep === 3 && (
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
                  onChange={setMessageContent}
                  dltTemplateId={dltTemplateId}
                  onDltTemplateIdChange={setDltTemplateId}
                />
              </div>

              {/* Right 5 cols: Simulator */}
              <div className="lg:col-span-5 flex justify-center sticky top-4">
                <SmsPhoneMockup
                  sender={fromSender}
                  messageContent={messageContent}
                  projectName={selectedProjectObj?.name}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleStepChange(2)}
              className="gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Audience</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleStepChange(4)}
              className="gap-2 text-xs font-bold"
            >
              <span>Review & Pre-Flight</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: REVIEW, LIVE TEST SMS & LAUNCH ── */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-enter">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
                Audience Source
              </span>
              <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)]">
                {audienceSource === "CSV_UPLOAD" ? "CSV File Upload" : "CRM Leads Query"}
              </div>
              <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                {audienceSource === "CSV_UPLOAD"
                  ? `${csvRecipients.length.toLocaleString()} uploaded contacts`
                  : "Active pre-sales pipeline filters"}
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
                Sender Header & Route
              </span>
              <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)]">
                {fromSender || "BrokerOS"}
              </div>
              <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                Route: {SMS_PROVIDERS[providerType]?.name || providerType}
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
                Linked Project Asset
              </span>
              <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)] truncate">
                {selectedProjectObj?.name || "General Broadcast"}
              </div>
              <p className="text-xs font-bold text-amber-600 mt-0.5">
                Dynamic Shortlink & CTR Tracking Enabled
              </p>
            </div>
          </div>

          {/* Live Test SMS Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[var(--brand-600)]" />
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                    Dispatch Live Test SMS
                  </h3>
                </div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
                  Verify handset rendering, merge tags replacement, and shortlink redirection on your mobile device.
                </p>
              </div>
              <Badge variant="brand" className="text-[10px]">
                Pre-Flight
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="tel"
                placeholder="Enter mobile phone (e.g. +91 98765 43210)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full sm:flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={isSendingTest || !testPhone}
                className="w-full sm:w-auto h-9 px-4 text-xs font-bold gap-2"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingTest ? "animate-spin" : ""}`} />
                <span>{isSendingTest ? "Sending Test..." : "Send Test SMS"}</span>
              </Button>
            </div>

            {testSendStatus && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xs ${
                  testSendStatus.ok
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {testSendStatus.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testSendStatus.msg}</span>
              </div>
            )}
          </div>

          {/* Optional Schedule Time Picker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--brand-600)]" />
              <label
                htmlFor="smsScheduledAt"
                className="text-xs font-extrabold text-[var(--text-primary)]"
              >
                Schedule for Future Dispatch (Optional — Leave blank to launch immediately)
              </label>
            </div>
            <input
              id="smsScheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full sm:max-w-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleStepChange(3)}
              className="gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Message Editor</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleLaunchCampaign}
              disabled={isSubmitting}
              className="gap-2 text-xs font-bold shadow-md"
            >
              <Zap className="w-4 h-4" />
              <span>{isSubmitting ? "Launching Broadcast..." : "Launch SMS Campaign Now"}</span>
            </Button>
          </div>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
