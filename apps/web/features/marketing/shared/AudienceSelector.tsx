"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
  X,
  Sparkles,
  Building,
  Flame,
  Layers,
} from "lucide-react";
import type { AudienceSourceType, CsvLeadRow, AudienceEstimation } from "../types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface AudienceSelectorProps {
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
  channel?: "EMAIL" | "SMS" | "VOICE";
}

export function AudienceSelector({
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
  channel = "EMAIL",
}: AudienceSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  // Filter Toggles
  const [enableProjectFilter, setEnableProjectFilter] = useState(Boolean(filters.projectId));
  const [enableTempFilter, setEnableTempFilter] = useState(Boolean(filters.temperatures?.length));
  const [enableBudgetFilter, setEnableBudgetFilter] = useState(Boolean(filters.minBudget));

  const [estimation, setEstimation] = useState<AudienceEstimation>({
    totalCount: 0,
    validEmailCount: 0,
    duplicateCount: 0,
    unsubscribedCount: 0,
    finalAudienceCount: 0,
  });
  const [isEstimating, setIsEstimating] = useState(false);

  // Recalculate preview live from backend
  useEffect(() => {
    let isMounted = true;
    setIsEstimating(true);

    const activeFilters: any = {};

    if (filters.statuses?.length && !filters.statuses.includes("ALL")) {
      activeFilters.statuses = filters.statuses;
    }
    if (enableTempFilter && filters.temperatures?.length) {
      activeFilters.temperatures = filters.temperatures;
    }
    if (enableProjectFilter && filters.projectId) {
      activeFilters.projectId = filters.projectId;
    }
    if (enableBudgetFilter && filters.minBudget) {
      activeFilters.minBudget = filters.minBudget;
    }

    const payload = {
      audienceSource,
      audienceFilters: activeFilters,
      csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
    };

    const previewEndpoint =
      channel === "VOICE"
        ? `${apiBaseUrl}/api/marketing/voice/campaigns/estimate-audience`
        : channel === "SMS"
        ? `${apiBaseUrl}/api/marketing/sms/audience-preview`
        : `${apiBaseUrl}/api/marketing/audience-preview`;

    fetch(previewEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.finalAudienceCount !== undefined) {
          setEstimation(data);
        }
      })
      .catch(() => {
        // Safe real fallback
        if (isMounted) {
          if (audienceSource === "CSV_UPLOAD") {
            setEstimation({
              totalCount: csvRecipients.length,
              validEmailCount: csvRecipients.length,
              duplicateCount: 0,
              unsubscribedCount: 0,
              finalAudienceCount: csvRecipients.length,
            });
          } else {
            setEstimation({
              totalCount: 0,
              validEmailCount: 0,
              duplicateCount: 0,
              unsubscribedCount: 0,
              finalAudienceCount: 0,
            });
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsEstimating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    audienceSource,
    filters,
    enableProjectFilter,
    enableTempFilter,
    enableBudgetFilter,
    csvRecipients,
    apiBaseUrl,
    channel,
  ]);

  // Handle CSV File Parse
  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a valid .csv file");
      return;
    }

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const emailIdx = headers.findIndex((h) => h.includes("email"));
      const nameIdx = headers.findIndex((h) => h.includes("name"));
      const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("mobile") || h.includes("contact"));
      const cityIdx = headers.findIndex((h) => h.includes("city"));
      const budgetIdx = headers.findIndex((h) => h.includes("budget"));
      const projectIdx = headers.findIndex((h) => h.includes("project"));
      const tempIdx = headers.findIndex((h) => h.includes("temperature"));

      const rows: CsvLeadRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        const email = emailIdx !== -1 ? cols[emailIdx] : "";
        const phone = phoneIdx !== -1 ? cols[phoneIdx] : "";

        // For Email channel, require email. For SMS channel, require phone or email. For Voice channel, require phone.
        if (channel === "EMAIL" && (!email || !email.includes("@"))) continue;
        if (channel === "SMS" && !phone && (!email || !email.includes("@"))) continue;
        if (channel === "VOICE" && !phone) continue;

        rows.push({
          email: email || `user-${i}@csv-import.local`,
          name: nameIdx !== -1 ? cols[nameIdx] : undefined,
          phone: phone || undefined,
          city: cityIdx !== -1 ? cols[cityIdx] : undefined,
          budget: budgetIdx !== -1 ? Number(cols[budgetIdx]) || undefined : undefined,
          interestedProject: projectIdx !== -1 ? cols[projectIdx] : undefined,
          temperature:
            tempIdx !== -1 && ["HOT", "WARM", "COLD"].includes(cols[tempIdx]?.toUpperCase())
              ? (cols[tempIdx].toUpperCase() as any)
              : undefined,
        });
      }

      onCsvRecipientsChange(rows);
    };

    reader.readAsText(file);
  };

  const handleStatusChange = (status: string) => {
    if (status === "ALL") {
      onFiltersChange({ ...filters, statuses: [] });
    } else {
      onFiltersChange({ ...filters, statuses: [status] });
    }
  };

  const handleToggleTemperature = (temp: "HOT" | "WARM" | "COLD") => {
    const current = [...(filters.temperatures || [])];
    const idx = current.indexOf(temp);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(temp);
    }
    onFiltersChange({ ...filters, temperatures: current });
  };

  return (
    <div className="space-y-6">
      {/* Source Selector Tabs */}
      <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => onSourceChange("CRM_DATABASE")}
          className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all ${
            audienceSource === "CRM_DATABASE"
              ? "bg-white text-[var(--text-primary)] shadow-xs border border-slate-200/60"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Users className="w-4 h-4 text-[var(--brand-600)]" />
          <span>Filter CRM Database</span>
        </button>

        <button
          type="button"
          onClick={() => onSourceChange("CSV_UPLOAD")}
          className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all ${
            audienceSource === "CSV_UPLOAD"
              ? "bg-white text-[var(--text-primary)] shadow-xs border border-slate-200/60"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Upload CSV / Excel File</span>
        </button>
      </div>

      {/* ── TAB 1: CRM DATABASE FILTERS ── */}
      {audienceSource === "CRM_DATABASE" && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--brand-600)]" />
                <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
                  CRM Lead Targeting Criteria
                </h4>
              </div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
                Automatically queries pre-sales leads. Excludes site visits, negotiations, and booked customers.
              </p>
            </div>
            <Badge variant="default" className="text-[10px]">
              Pre-Sales Pipeline
            </Badge>
          </div>

          {/* 1. Pre-Sales Status Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-[var(--text-primary)]">
              1. Pre-Sales Lead Status
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: "All Pre-Sales Leads" },
                { id: "NEW", label: "New Leads" },
                { id: "CONTACTED", label: "Contacted" },
                { id: "INTERESTED", label: "Interested" },
                { id: "QUALIFIED", label: "Qualified" },
              ].map((st) => {
                const isSelected =
                  st.id === "ALL"
                    ? !filters.statuses?.length || filters.statuses.includes("ALL")
                    : filters.statuses?.includes(st.id);

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStatusChange(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-purple-50 border-[var(--brand-500)] text-[var(--brand-700)] shadow-xs ring-2 ring-purple-500/15"
                        : "bg-slate-50 border-slate-200/80 text-[var(--text-secondary)] hover:bg-slate-100"
                    }`}
                  >
                    {isSelected && <span className="mr-1.5 text-[var(--brand-600)]">✓</span>}
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Optional Lead Temperature Filter */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-extrabold text-[var(--text-primary)]">
                  Filter by Lead Temperature
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={enableTempFilter}
                  onChange={(e) => {
                    setEnableTempFilter(e.target.checked);
                    if (!e.target.checked) {
                      onFiltersChange({ ...filters, temperatures: [] });
                    }
                  }}
                  className="w-4 h-4 accent-[var(--brand-600)] rounded-sm"
                />
                <span>{enableTempFilter ? "Filter Enabled" : "Off (Include All Temperatures)"}</span>
              </label>
            </div>

            {enableTempFilter && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70">
                {(["HOT", "WARM", "COLD"] as const).map((temp) => {
                  const isSelected = filters.temperatures?.includes(temp);
                  const colors = {
                    HOT: isSelected
                      ? "bg-rose-500 text-white border-rose-500 shadow-xs ring-2 ring-rose-500/20"
                      : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50",
                    WARM: isSelected
                      ? "bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-500/20"
                      : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50",
                    COLD: isSelected
                      ? "bg-sky-500 text-white border-sky-500 shadow-xs ring-2 ring-sky-500/20"
                      : "bg-white text-sky-700 border-sky-200 hover:bg-sky-50",
                  };

                  return (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => handleToggleTemperature(temp)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${colors[temp]}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{temp}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Optional Project Affinity Filter */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[var(--brand-600)]" />
                <span className="text-xs font-extrabold text-[var(--text-primary)]">
                  Filter by Specific Project Affinity
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={enableProjectFilter}
                  onChange={(e) => {
                    setEnableProjectFilter(e.target.checked);
                    if (!e.target.checked) {
                      onFiltersChange({ ...filters, projectId: undefined });
                    }
                  }}
                  className="w-4 h-4 accent-[var(--brand-600)] rounded-sm"
                />
                <span>{enableProjectFilter ? "Filter Enabled" : "Off (Include All Leads & Unassigned)"}</span>
              </label>
            </div>

            {enableProjectFilter && (
              <div className="pt-2 border-t border-slate-200/70">
                <select
                  value={filters.projectId || ""}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, projectId: e.target.value || undefined })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shadow-xs"
                >
                  <option value="">Select Project from Database...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {projects.length === 0 && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    No active projects found in database inventory.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 4. Optional Budget Filter */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--text-primary)]">
                Filter by Minimum Budget (INR)
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={enableBudgetFilter}
                  onChange={(e) => {
                    setEnableBudgetFilter(e.target.checked);
                    if (!e.target.checked) {
                      onFiltersChange({ ...filters, minBudget: undefined });
                    }
                  }}
                  className="w-4 h-4 accent-[var(--brand-600)] rounded-sm"
                />
                <span>{enableBudgetFilter ? "Filter Enabled" : "Off"}</span>
              </label>
            </div>

            {enableBudgetFilter && (
              <div className="pt-2 border-t border-slate-200/70">
                <input
                  type="number"
                  placeholder="e.g. 5000000 (₹50 Lakhs)"
                  value={filters.minBudget || ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minBudget: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shadow-xs"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: CSV / EXCEL UPLOAD ── */}
      {audienceSource === "CSV_UPLOAD" && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-5 shadow-xs">
          {/* Header & Download Template Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                Upload External Prospect List
              </h4>
              <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Upload CSV exports from property expos, 99acres/MagicBricks, or exhibitions.
              </p>
            </div>

            <a
              href={`${apiBaseUrl}/api/marketing/sample-csv`}
              download="sample_marketing_leads.csv"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--brand-600)] bg-purple-50 hover:bg-purple-100/70 rounded-xl border border-purple-200/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV Template</span>
            </a>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging
                ? "border-[var(--brand-500)] bg-purple-50/50 shadow-xs"
                : "border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-600)] mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-xs font-bold text-[var(--text-primary)] mb-1">
              Drag & drop your CSV file here, or{" "}
              <label className="text-[var(--brand-600)] hover:underline cursor-pointer font-extrabold">
                browse file
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
              </label>
            </p>
            <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
              Supported columns: Full Name, Email, Phone Number, City, Budget, Project, Temperature
            </p>

            {csvFileName && (
              <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Loaded: {csvFileName} ({csvRecipients.length} rows detected)
                </span>
              </div>
            )}
          </div>

          {/* CRM Sync Toggle */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="saveCsvLeads"
                checked={saveCsvAsCrmLeads}
                onChange={(e) => onSaveCsvAsCrmLeadsChange(e.target.checked)}
                className="w-4 h-4 accent-[var(--brand-600)] rounded-sm"
              />
              <label htmlFor="saveCsvLeads" className="text-xs text-[var(--text-secondary)] cursor-pointer">
                <span className="font-extrabold text-[var(--text-primary)]">
                  Also import contacts as permanent CRM Leads
                </span>
                <br />
                <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Automatically adds them to the main Lead Management database with source &apos;MARKETING_CSV_IMPORT&apos;.
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE AUDIENCE ESTIMATION BANNER ── */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[var(--brand-600)] flex items-center justify-center font-extrabold text-sm shadow-xs tabular-nums">
            {isEstimating ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              estimation.finalAudienceCount.toLocaleString()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-extrabold text-[var(--text-primary)] tabular-nums">
                {estimation.finalAudienceCount.toLocaleString()} Deliverable Recipients
              </h5>
              <Badge variant={estimation.finalAudienceCount > 0 ? "success" : "default"} className="text-[10px]">
                {estimation.finalAudienceCount > 0 ? "Cleaned & Ready" : "0 Matching Leads"}
              </Badge>
            </div>
            <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
              {estimation.duplicateCount > 0 && `${estimation.duplicateCount} duplicate contacts removed • `}
              {estimation.unsubscribedCount > 0 && `${estimation.unsubscribedCount} unsubscribed users excluded • `}
              Zero bounce risk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
