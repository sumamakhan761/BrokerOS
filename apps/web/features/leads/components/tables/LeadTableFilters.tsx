import React from "react";
import { Search, SlidersHorizontal, X, Calendar } from "lucide-react";

const STATUS_GROUPS: { label: string; value: string; color: string }[] = [
  { label: "All", value: "", color: "var(--text-secondary)" },
  { label: "New", value: "NEW", color: "oklch(0.535 0.235 275)" },
  { label: "Contacted", value: "CONTACTED", color: "oklch(0.48 0.18 240)" },
  { label: "Interested", value: "INTERESTED", color: "oklch(0.42 0.16 145)" },
  { label: "SV Scheduled", value: "SITE_VISIT_SCHEDULED", color: "oklch(0.50 0.17 80)" },
  { label: "SV Done", value: "SITE_VISIT_COMPLETED", color: "oklch(0.455 0.215 275)" },
  { label: "Negotiation", value: "NEGOTIATION", color: "oklch(0.55 0.18 45)" },
  { label: "Booking", value: "BOOKING", color: "oklch(0.42 0.16 145)" },
  { label: "Lost", value: "LOST", color: "oklch(0.46 0.20 25)" },
];

interface LeadTableFiltersProps {
  isManagerView?: boolean;
  status: string;
  setStatus: (val: string) => void;
  scoreRange: string;
  setScoreRange: (val: string) => void;
  followUpDate: string;
  setFollowUpDate: (val: string) => void;
  siteVisitDate: string;
  setSiteVisitDate: (val: string) => void;
  search?: string;
  setSearch?: (val: string) => void;
}

export function LeadTableFilters({
  isManagerView,
  status,
  setStatus,
  scoreRange,
  setScoreRange,
  followUpDate,
  setFollowUpDate,
  siteVisitDate,
  setSiteVisitDate,
  search = "",
  setSearch,
}: LeadTableFiltersProps) {
  const hasActive = status || scoreRange || followUpDate || siteVisitDate || search;

  const clearAll = () => {
    setStatus("");
    setScoreRange("");
    setFollowUpDate("");
    setSiteVisitDate("");
    setSearch?.("");
  };

  return (
    <div className="flex flex-col gap-3.5 mb-5">
      {/* Search & Filter Row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search Input */}
        {setSearch !== undefined && (
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by lead name or phone…"
              className="w-full h-9 ps-9 pe-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium text-[var(--text-primary)] placeholder:text-slate-400 outline-none transition-all focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15"
            />
          </div>
        )}

        {/* Follow-up Date */}
        <div className="relative min-w-[170px]">
          <Calendar
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            title="Filter by Follow-up Date"
            className={`w-full h-9 ps-8 pe-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold outline-none transition-all focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer ${
              followUpDate ? "text-[var(--brand-700)]" : "text-slate-400"
            }`}
          />
          {followUpDate && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-[var(--brand-700)] bg-purple-100 px-1.5 py-0.5 rounded">
              F-UP
            </span>
          )}
        </div>

        {/* Site Visit Date */}
        <div className="relative min-w-[170px]">
          <Calendar
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="date"
            value={siteVisitDate}
            onChange={(e) => setSiteVisitDate(e.target.value)}
            title="Filter by Site Visit Date"
            className={`w-full h-9 ps-8 pe-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold outline-none transition-all focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer ${
              siteVisitDate ? "text-purple-700" : "text-slate-400"
            }`}
          />
          {siteVisitDate && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
              SV
            </span>
          )}
        </div>

        {/* Score Range Filter */}
        {!isManagerView && (
          <div className="relative min-w-[140px]">
            <SlidersHorizontal
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              value={scoreRange}
              onChange={(e) => setScoreRange(e.target.value)}
              className={`w-full h-9 ps-8 pe-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold outline-none transition-all focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer appearance-none ${
                scoreRange ? "text-[var(--text-primary)]" : "text-slate-400"
              }`}
            >
              <option value="">All AI Scores</option>
              <option value="0-60">Low (0–60)</option>
              <option value="60-80">Medium (60–80)</option>
              <option value="80-100">High (80–100)</option>
            </select>
          </div>
        )}

        {/* Clear All Button */}
        {hasActive && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold transition-all active:scale-[0.96] press-effect flex-shrink-0 cursor-pointer"
          >
            <X size={13} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Status Pill Filters */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        {STATUS_GROUPS.map((opt) => {
          const active = status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-[0.96] press-effect whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-[var(--brand-600)] text-white shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-[var(--text-secondary)] border border-slate-200/80"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
