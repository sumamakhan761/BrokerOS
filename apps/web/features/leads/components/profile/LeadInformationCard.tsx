import React from "react";
import { Edit2, Check, X, Briefcase } from "lucide-react";
import { LeadInformationDisplay } from "@/features/leads/components/profile/LeadInformationDisplay";
import { LeadInformationEdit } from "@/features/leads/components/profile/LeadInformationEdit";

interface LeadInformationCardProps {
  lead: any;
  isEditingLeadInfo: boolean;
  setIsEditingLeadInfo: (val: boolean) => void;
  leadInfoData: any;
  setLeadInfoData: (data: any) => void;
  handleLeadInfoSave: () => void;
  availableSources: any[];
  availableProjects: any[];
}

export function LeadInformationCard({
  lead,
  isEditingLeadInfo,
  setIsEditingLeadInfo,
  leadInfoData,
  setLeadInfoData,
  handleLeadInfoSave,
  availableSources,
  availableProjects,
}: LeadInformationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-tight m-0 flex items-center gap-2">
          <Briefcase size={15} className="text-[var(--brand-600)]" />
          <span>Lead Parameters</span>
        </h3>

        <div className="flex items-center gap-1.5">
          {!isEditingLeadInfo ? (
            <button
              onClick={() => setIsEditingLeadInfo(true)}
              title="Edit parameters"
              className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-[var(--brand-700)] flex items-center justify-center transition-all active:scale-[0.96] press-effect cursor-pointer"
            >
              <Edit2 size={12} />
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditingLeadInfo(false);
                  setLeadInfoData({
                    budget: lead.budget || "",
                    lastContactDate: lead.lastContactDate
                      ? new Date(lead.lastContactDate).toISOString().split("T")[0]
                      : "",
                    nextFollowUpDate: lead.nextFollowUpDate
                      ? new Date(lead.nextFollowUpDate)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    sourceId: lead.sourceId || "",
                    interestedProjectId: lead.interestedProjectId || "",
                    preferredLocation: lead.preferredLocation || "",
                    requirements: lead.requirements || "",
                  });
                }}
                className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center transition-all active:scale-[0.96] press-effect cursor-pointer"
                title="Cancel"
              >
                <X size={12} />
              </button>
              <button
                onClick={handleLeadInfoSave}
                className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
                title="Save parameters"
              >
                <Check size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {!isEditingLeadInfo ? (
        <LeadInformationDisplay lead={lead} />
      ) : (
        <LeadInformationEdit
          leadInfoData={leadInfoData}
          setLeadInfoData={setLeadInfoData}
          availableSources={availableSources}
          availableProjects={availableProjects}
        />
      )}
    </div>
  );
}
