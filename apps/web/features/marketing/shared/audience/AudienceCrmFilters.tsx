'use client';

import React from 'react';
import { Filter, Flame, Building, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface AudienceCrmFiltersProps {
  filters: {
    temperatures?: Array<'HOT' | 'WARM' | 'COLD'>;
    statuses?: string[];
    projectId?: string;
    minBudget?: number;
    maxBudget?: number;
  };
  onFiltersChange: (filters: any) => void;
  enableTempFilter: boolean;
  setEnableTempFilter: (val: boolean) => void;
  enableProjectFilter: boolean;
  setEnableProjectFilter: (val: boolean) => void;
  enableBudgetFilter: boolean;
  setEnableBudgetFilter: (val: boolean) => void;
  projects?: Array<{ id: string; name: string }>;
}

export const AudienceCrmFilters: React.FC<AudienceCrmFiltersProps> = ({
  filters,
  onFiltersChange,
  enableTempFilter,
  setEnableTempFilter,
  enableProjectFilter,
  setEnableProjectFilter,
  enableBudgetFilter,
  setEnableBudgetFilter,
  projects = [],
}) => {
  const handleStatusChange = (status: string) => {
    if (status === 'ALL') {
      onFiltersChange({ ...filters, statuses: [] });
    } else {
      onFiltersChange({ ...filters, statuses: [status] });
    }
  };

  const handleToggleTemperature = (temp: 'HOT' | 'WARM' | 'COLD') => {
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
            { id: 'ALL', label: 'All Pre-Sales Leads' },
            { id: 'NEW', label: 'New Leads' },
            { id: 'CONTACTED', label: 'Contacted' },
            { id: 'INTERESTED', label: 'Interested' },
            { id: 'QUALIFIED', label: 'Qualified' },
          ].map((st) => {
            const isSelected =
              st.id === 'ALL'
                ? !filters.statuses?.length || filters.statuses.includes('ALL')
                : filters.statuses?.includes(st.id);

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStatusChange(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-purple-50 border-[var(--brand-500)] text-[var(--brand-700)] shadow-xs ring-2 ring-purple-500/15'
                    : 'bg-slate-50 border-slate-200/80 text-[var(--text-secondary)] hover:bg-slate-100'
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
            <span>{enableTempFilter ? 'Filter Enabled' : 'Off (Include All Temperatures)'}</span>
          </label>
        </div>

        {enableTempFilter && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70">
            {(['HOT', 'WARM', 'COLD'] as const).map((temp) => {
              const isSelected = filters.temperatures?.includes(temp);
              const colors = {
                HOT: isSelected
                  ? 'bg-rose-500 text-white border-rose-500 shadow-xs ring-2 ring-rose-500/20'
                  : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50',
                WARM: isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50',
                COLD: isSelected
                  ? 'bg-sky-500 text-white border-sky-500 shadow-xs ring-2 ring-sky-500/20'
                  : 'bg-white text-sky-700 border-sky-200 hover:bg-sky-50',
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
            <span>{enableProjectFilter ? 'Filter Enabled' : 'Off (Include All Leads & Unassigned)'}</span>
          </label>
        </div>

        {enableProjectFilter && (
          <div className="pt-2 border-t border-slate-200/70">
            <select
              value={filters.projectId || ''}
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
            <span>{enableBudgetFilter ? 'Filter Enabled' : 'Off'}</span>
          </label>
        </div>

        {enableBudgetFilter && (
          <div className="pt-2 border-t border-slate-200/70">
            <input
              type="number"
              placeholder="e.g. 5000000 (₹50 Lakhs)"
              value={filters.minBudget || ''}
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
  );
};
