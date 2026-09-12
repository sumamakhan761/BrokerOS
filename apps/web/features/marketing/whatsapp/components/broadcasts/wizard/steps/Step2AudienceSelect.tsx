'use client';

import React from 'react';
import {
  Upload,
  Users,
  ArrowRight,
  ArrowLeft,
  Building2,
  Flame,
  Filter,
  Check,
  Tag,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { TagItem } from './types';

export interface WhatsAppCrmFilters {
  projectId?: string;
  temperatures?: Array<'HOT' | 'WARM' | 'COLD'>;
  statuses?: string[];
  minBudget?: number;
}

interface Step2AudienceSelectProps {
  contactsCount: number;
  audienceType: 'all' | 'tags' | 'crm_leads' | 'csv' | 'custom_field';
  setAudienceType: (t: 'all' | 'tags' | 'crm_leads' | 'csv' | 'custom_field') => void;
  allTags: TagItem[];
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  crmFilters: WhatsAppCrmFilters;
  setCrmFilters: React.Dispatch<React.SetStateAction<WhatsAppCrmFilters>>;
  projects: Array<{ id: string; name: string }>;
  csvFileName: string;
  handleCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalAudienceCount: number;
  isEstimating?: boolean;
  onBack: () => void;
  onNext: () => void;
}

const CRM_STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Active Stages' },
  { id: 'NEW', label: 'New Inbound' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'INTERESTED', label: 'Interested' },
  { id: 'QUALIFIED', label: 'Qualified' },
];

const TEMPERATURE_OPTIONS: Array<{ id: 'HOT' | 'WARM' | 'COLD'; label: string; color: string }> = [
  { id: 'HOT', label: 'Hot Leads', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  { id: 'WARM', label: 'Warm Leads', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  { id: 'COLD', label: 'Cold Leads', color: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
];

export const Step2AudienceSelect: React.FC<Step2AudienceSelectProps> = ({
  contactsCount,
  audienceType,
  setAudienceType,
  allTags,
  selectedTagIds,
  setSelectedTagIds,
  crmFilters,
  setCrmFilters,
  projects,
  csvFileName,
  handleCsvUpload,
  totalAudienceCount,
  isEstimating = false,
  onBack,
  onNext,
}) => {
  const toggleTemperature = (temp: 'HOT' | 'WARM' | 'COLD') => {
    const current = crmFilters.temperatures || [];
    const exists = current.includes(temp);
    const updated = exists ? current.filter((t) => t !== temp) : [...current, temp];
    setCrmFilters((prev) => ({ ...prev, temperatures: updated }));
  };

  const toggleStatus = (st: string) => {
    if (st === 'ALL') {
      setCrmFilters((prev) => ({ ...prev, statuses: ['ALL'] }));
      return;
    }
    const current = (crmFilters.statuses || []).filter((s) => s !== 'ALL');
    const exists = current.includes(st);
    const updated = exists ? current.filter((s) => s !== st) : [...current, st];
    setCrmFilters((prev) => ({
      ...prev,
      statuses: updated.length === 0 ? ['ALL'] : updated,
    }));
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs animate-enter">
      <div>
        <h3 className="text-base font-bold text-text-primary">
          Step 2 — Define Campaign Audience
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Select who receives this WhatsApp broadcast. Target CRM leads by project and intent, filter by contact tags, or import an audience CSV.
        </p>
      </div>

      {/* Segment Mode Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          {
            id: 'crm_leads',
            title: 'CRM Lead Segmentation',
            desc: 'Filter by Project, Stage, & Lead Temperature',
            icon: Filter,
            badge: 'Recommended',
          },
          {
            id: 'tags',
            title: 'WhatsApp Contact Tags',
            desc: 'Target contacts categorized with specific labels',
            icon: Tag,
          },
          {
            id: 'all',
            title: 'All WhatsApp Contacts',
            desc: `Broadcast to all ${contactsCount} synced contacts`,
            icon: Users,
          },
          {
            id: 'csv',
            title: 'Upload CSV Audience',
            desc: 'Import verified phone numbers with lead attributes',
            icon: FileSpreadsheet,
          },
        ].map((opt) => {
          const Icon = opt.icon;
          const isSelected = audienceType === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setAudienceType(opt.id as any)}
              className={cn(
                'relative rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between',
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500/30'
                  : 'border-border-default bg-bg-surface hover:border-emerald-500/40',
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs',
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-bg-subtle text-text-muted',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {opt.badge && (
                    <Badge variant="brand" className="text-[9px] py-0 px-1.5">
                      {opt.badge}
                    </Badge>
                  )}
                </div>
                <h4 className="text-xs font-bold text-text-primary">{opt.title}</h4>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  {opt.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 1. CRM LEADS SEGMENTATION ── */}
      {audienceType === 'crm_leads' && (
        <div className="rounded-xl border border-border-default bg-bg-subtle/50 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border-default pb-3">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-text-primary">
              CRM Multi-Dimensional Filters
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Filter */}
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1.5">
                Target Project
              </label>
              <select
                value={crmFilters.projectId || 'ALL'}
                onChange={(e) =>
                  setCrmFilters((prev) => ({
                    ...prev,
                    projectId: e.target.value === 'ALL' ? undefined : e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Projects (Firm-wide)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Budget */}
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1.5">
                Minimum Lead Budget (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 5000000 (₹50 Lakhs)"
                value={crmFilters.minBudget || ''}
                onChange={(e) =>
                  setCrmFilters((prev) => ({
                    ...prev,
                    minBudget: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Lead Temperature Chips */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Lead Temperature</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPERATURE_OPTIONS.map((t) => {
                const active = (crmFilters.temperatures || []).includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTemperature(t.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5',
                      active
                        ? `${t.color} border-current shadow-xs`
                        : 'border-border-default bg-bg-surface text-text-muted hover:text-text-primary',
                    )}
                  >
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pipeline Stage Chips */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-text-primary block">
              Lead Lifecycle Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {CRM_STATUS_OPTIONS.map((st) => {
                const isAll = st.id === 'ALL';
                const active = isAll
                  ? !crmFilters.statuses?.length || crmFilters.statuses.includes('ALL')
                  : (crmFilters.statuses || []).includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleStatus(st.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                      active
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-border-default bg-bg-surface text-text-secondary hover:border-emerald-500/40',
                    )}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. TAGS PICKER ── */}
      {audienceType === 'tags' && (
        <div className="rounded-xl border border-border-default bg-bg-subtle/50 p-4 space-y-3">
          <label className="text-xs font-semibold text-text-primary block">
            Select Target Tags:
          </label>
          {allTags.length === 0 ? (
            <p className="text-xs text-text-muted italic">No tags created yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tg) => {
                const active = selectedTagIds.includes(tg.id);
                return (
                  <button
                    key={tg.id}
                    type="button"
                    onClick={() =>
                      setSelectedTagIds((prev) =>
                        active ? prev.filter((id) => id !== tg.id) : [...prev, tg.id],
                      )
                    }
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors flex items-center gap-1.5',
                      active
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-border-default bg-bg-surface text-text-secondary hover:border-emerald-500/40',
                    )}
                  >
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{tg.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. CSV UPLOADER ── */}
      {audienceType === 'csv' && (
        <div className="rounded-xl border border-dashed border-border-default bg-bg-subtle/50 p-6 text-center space-y-3">
          <Upload className="h-8 w-8 text-text-muted mx-auto" />
          <div>
            <p className="text-xs font-semibold text-text-primary">
              {csvFileName ? `Loaded File: ${csvFileName}` : 'Drop CSV file here or click to browse'}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Recommended format: <code className="font-mono text-emerald-600">phone,name,param1,param2</code>
            </p>
          </div>
          <label className="inline-flex cursor-pointer rounded-lg bg-bg-surface border border-border-default px-4 py-2 text-xs font-semibold text-text-primary hover:bg-bg-subtle shadow-xs">
            <span>Choose CSV File</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Audience Summary Box */}
      <div className="rounded-xl bg-bg-subtle p-4 flex items-center justify-between border border-border-default">
        <div>
          <span className="text-xs text-text-muted">Estimated Audience Reach:</span>
          <p className="text-xl font-extrabold text-text-primary tabular-nums">
            {isEstimating ? (
              <span className="text-sm font-medium text-text-muted">Calculating audience...</span>
            ) : (
              `${totalAudienceCount.toLocaleString()} Target Recipients`
            )}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border-default">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
        </Button>
        <Button
          onClick={() => {
            if (totalAudienceCount === 0) {
              toast.error('Selected audience contains 0 recipients.');
              return;
            }
            onNext();
          }}
          disabled={totalAudienceCount === 0}
          className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold px-5"
        >
          Continue to Personalize
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
