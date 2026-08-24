import React from "react";
import {
  Globe,
  User,
  UserCheck,
  IndianRupee,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
} from "lucide-react";

interface LeadInformationDisplayProps {
  lead: any;
}

export function LeadInformationDisplay({ lead }: LeadInformationDisplayProps) {
  return (
    <div className="space-y-3 text-xs flex-1">
      {/* Source */}
      <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <Globe size={13} className="text-slate-400" /> Source
        </span>
        <span className="font-bold text-[var(--text-primary)]">
          {lead.source?.name || "Organic Inbound"}
        </span>
      </div>

      {/* Agent */}
      <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <User size={13} className="text-slate-400" /> Assigned Agent
        </span>
        <span className="font-bold text-[var(--text-primary)]">
          {lead.assignedUser
            ? lead.assignedUser.name || lead.assignedUser.username
            : "Unassigned"}
        </span>
      </div>

      {/* Sales Executive */}
      <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <UserCheck size={13} className="text-slate-400" /> Sales Exec
        </span>
        <span className="font-bold text-[var(--text-primary)]">
          {lead.salesExecutive
            ? lead.salesExecutive.name || lead.salesExecutive.username
            : "Unassigned"}
        </span>
      </div>

      {/* Budget */}
      <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <IndianRupee size={13} className="text-slate-400" /> Budget Range
        </span>
        <span className="font-extrabold text-[var(--text-primary)] tabular-nums">
          {lead.budget
            ? `₹${Number(lead.budget).toLocaleString("en-IN")}`
            : "Not specified"}
        </span>
      </div>

      {/* Project */}
      <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <Building2 size={13} className="text-slate-400" /> Project
        </span>
        <span
          className="font-bold text-[var(--text-primary)] text-right max-w-[150px] truncate"
          title={lead.interestedProject?.name || "Any / None"}
        >
          {lead.interestedProject?.name || "Any / Open"}
        </span>
      </div>

      {/* Tower */}
      {lead.interestedTower && (
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
          <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
            <Building2 size={13} className="text-slate-400" /> Tower
          </span>
          <span
            className="font-bold text-[var(--text-primary)] text-right max-w-[150px] truncate"
            title={lead.interestedTower.name}
          >
            {lead.interestedTower.name}
          </span>
        </div>
      )}

      {/* Unit */}
      {lead.interestedUnit && (
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
          <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
            <Building2 size={13} className="text-slate-400" /> Unit No.
          </span>
          <span className="font-extrabold text-[var(--text-primary)] tabular-nums">
            {lead.interestedUnit.unitNumber}
          </span>
        </div>
      )}

      {/* Broker (CP World) */}
      {lead.broker && (
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
          <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
            <UserCheck size={13} className="text-slate-400" /> CP Broker
          </span>
          <span
            className="font-bold text-[var(--brand-700)] text-right max-w-[150px] truncate"
            title={lead.broker.name}
          >
            {lead.broker.name}
          </span>
        </div>
      )}

      {/* Preferred Location */}
      <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <MapPin size={13} className="text-slate-400" /> Pref. Location
        </span>
        <span
          className="font-bold text-[var(--text-primary)] text-right max-w-[150px] truncate"
          title={lead.preferredLocation || "Not specified"}
        >
          {lead.preferredLocation || "Not specified"}
        </span>
      </div>

      {/* Requirements */}
      <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <Briefcase size={13} className="text-slate-400" /> Requirements
        </span>
        <span
          className="font-bold text-[var(--text-primary)] text-right max-w-[150px] truncate"
          title={lead.requirements || "Not specified"}
        >
          {lead.requirements || "Not specified"}
        </span>
      </div>

      {/* Last Contact */}
      <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <Calendar size={13} className="text-slate-400" /> Last Contacted
        </span>
        <span className="font-semibold text-[var(--text-secondary)] tabular-nums">
          {lead.lastContactDate
            ? new Date(lead.lastContactDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            : "Never"}
        </span>
      </div>

      {/* Next Follow-up */}
      <div className="flex justify-between items-center py-1.5">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
          <Calendar size={13} className="text-slate-400" /> Next Follow-up
        </span>
        <span className="font-semibold text-[var(--brand-700)] tabular-nums">
          {lead.nextFollowUpDate
            ? new Date(lead.nextFollowUpDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            : "Not scheduled"}
        </span>
      </div>
    </div>
  );
}
