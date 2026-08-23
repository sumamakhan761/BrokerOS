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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <Link href={backLink} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button onClick={onRefresh} className="p-2.5 mr-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        {canManageTowers && (
          <>
            <button
              onClick={onManualClick}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Manual
            </button>
            <button
              onClick={onAiClick}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              <Wand2 className="w-4 h-4" />
              AI Generate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
