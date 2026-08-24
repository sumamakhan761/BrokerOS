import React from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Plus, RefreshCw, Wand2 } from "lucide-react";

interface InventoryHeaderProps {
  title: string;
  backLink: string;
  loading: boolean;
  canManageTowers: boolean;
  onRefresh: () => void;
  onManualClick: () => void;
  onAiClick: () => void;
}

export function InventoryHeader({
  title,
  backLink,
  loading,
  canManageTowers,
  onRefresh,
  onManualClick,
  onAiClick,
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-enter">
      <div className="flex items-center gap-3">
        <Link
          href={backLink}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all active:scale-[0.96] press-effect shadow-2xs cursor-pointer"
          title="Back to projects"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Building2 size={18} />
            </div>
            <span>{title}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={onRefresh}
          className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition-all active:scale-[0.96] press-effect shadow-2xs cursor-pointer"
          title="Refresh inventory grid"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>

        {canManageTowers && (
          <>
            <button
              onClick={onManualClick}
              className="flex-1 md:flex-none h-8 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs transition-all active:scale-[0.96] press-effect shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Manual Tower</span>
            </button>
            <button
              onClick={onAiClick}
              className="flex-1 md:flex-none h-8 px-3.5 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl font-bold text-xs transition-all active:scale-[0.96] press-effect shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wand2 size={13} />
              <span>AI Generate</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
