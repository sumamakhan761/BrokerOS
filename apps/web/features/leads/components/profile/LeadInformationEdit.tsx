import React from "react";
import {
  Globe,
  IndianRupee,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
} from "lucide-react";

interface LeadInformationEditProps {
  leadInfoData: any;
  setLeadInfoData: (data: any) => void;
  availableSources: any[];
  availableProjects: any[];
}

export function LeadInformationEdit({
  leadInfoData,
  setLeadInfoData,
  availableSources,
  availableProjects,
}: LeadInformationEditProps) {
  return (
    <div className="space-y-3 animate-enter">
      {/* Source */}
      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
          <Globe size={12} className="text-slate-400" /> Source Channel
        </label>
        <select
          value={leadInfoData.sourceId}
          onChange={(e) =>
            setLeadInfoData({ ...leadInfoData, sourceId: e.target.value })
          }
          className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
        >
          <option value="">Select source…</option>
          {availableSources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Budget */}
      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
          <IndianRupee size={12} className="text-slate-400" /> Budget (INR)
        </label>
        <input
          type="number"
          value={leadInfoData.budget}
          onChange={(e) =>
            setLeadInfoData({ ...leadInfoData, budget: e.target.value })
          }
          placeholder="e.g. 15000000"
          className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
        />
      </div>

      {/* Project */}
      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
          <Building2 size={12} className="text-slate-400" /> Project
        </label>
        <select
          value={leadInfoData.interestedProjectId}
          onChange={(e) =>
            setLeadInfoData({
              ...leadInfoData,
              interestedProjectId: e.target.value,
            })
          }
          className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
        >
          <option value="">Select project…</option>
          {availableProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Preferred Location */}
      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
          <MapPin size={12} className="text-slate-400" /> Preferred Location
        </label>
        <input
          type="text"
          placeholder="e.g. Bandra, Andheri West"
          value={leadInfoData.preferredLocation}
          onChange={(e) =>
            setLeadInfoData({
              ...leadInfoData,
              preferredLocation: e.target.value,
            })
          }
          className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
          <Briefcase size={12} className="text-slate-400" /> Requirements
        </label>
        <input
          type="text"
          placeholder="e.g. 2 BHK, Sea view, High floor"
          value={leadInfoData.requirements}
          onChange={(e) =>
            setLeadInfoData({
              ...leadInfoData,
              requirements: e.target.value,
            })
          }
          className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
        />
      </div>

      {/* Last Contacted */}
      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
          <Calendar size={12} className="text-slate-400" /> Last Contact Date
        </label>
        <input
          type="date"
          value={leadInfoData.lastContactDate}
          onChange={(e) =>
            setLeadInfoData({
              ...leadInfoData,
              lastContactDate: e.target.value,
            })
          }
          className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
        />
      </div>

      {/* Next Follow-up */}
      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
          <Calendar size={12} className="text-slate-400" /> Next Follow-up Date
        </label>
        <input
          type="date"
          value={leadInfoData.nextFollowUpDate}
          onChange={(e) =>
            setLeadInfoData({
              ...leadInfoData,
              nextFollowUpDate: e.target.value,
            })
          }
          className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
        />
      </div>
    </div>
  );
}
