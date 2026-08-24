import React from "react";
import { Search, Calendar, X } from "lucide-react";

const POST_SALES_STATUS_OPTIONS = [
  {
    label: "All Stages",
    value: "BOOKING,DOCUMENT,LOAN,AGREEMENT,HANDOVER",
    color: "var(--text-secondary)",
  },
  { label: "Booking", value: "BOOKING", color: "oklch(0.42 0.16 145)" },
  { label: "Document", value: "DOCUMENT", color: "oklch(0.50 0.17 80)" },
  { label: "Loan", value: "LOAN", color: "oklch(0.48 0.18 240)" },
  { label: "Agreement", value: "AGREEMENT", color: "oklch(0.535 0.235 275)" },
  { label: "Handover", value: "HANDOVER", color: "oklch(0.55 0.22 350)" },
];

interface PostSalesTableFiltersProps {
  status: string;
  setStatus: (v: string) => void;
  followUpDate: string;
  setFollowUpDate: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  completedHandoversOnly?: boolean;
}

export function PostSalesTableFilters({
  status,
  setStatus,
  followUpDate,
  setFollowUpDate,
  search,
  setSearch,
  completedHandoversOnly,
}: PostSalesTableFiltersProps) {
  const hasActive =
    (status !== "BOOKING,DOCUMENT,LOAN,AGREEMENT,HANDOVER" && status !== "") ||
    followUpDate ||
    search;

  return (
    <div className="flex flex-col gap-3.5 mb-5">
      {/* Row 1: Search + Date Filter */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or phone…"
            className="w-full h-9 ps-9 pe-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium text-[var(--text-primary)] placeholder:text-slate-400 outline-none transition-all focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15"
          />
        </div>

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
            title="Follow-Up Date"
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

        {hasActive && (
          <button
            onClick={() => {
              setStatus("BOOKING,DOCUMENT,LOAN,AGREEMENT,HANDOVER");
              setFollowUpDate("");
              setSearch("");
            }}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold transition-all active:scale-[0.96] press-effect flex-shrink-0 cursor-pointer"
          >
            <X size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Row 2: Status Pills */}
      {!completedHandoversOnly && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {POST_SALES_STATUS_OPTIONS.map((opt) => {
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
      )}
    </div>
  );
}
