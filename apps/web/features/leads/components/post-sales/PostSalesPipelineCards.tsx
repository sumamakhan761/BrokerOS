"use client";

import React, { useState } from "react";
import {
  FileText,
  Landmark,
  PenTool,
  Key,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import { DocumentForm } from "@/features/leads/components/post-sales/DocumentForm";
import { LoanForm } from "@/features/leads/components/post-sales/LoanForm";
import { AgreementForm } from "@/features/leads/components/post-sales/AgreementForm";
import { HandoverForm } from "@/features/leads/components/post-sales/HandoverForm";

interface PostSalesPipelineCardsProps {
  leadId: string;
  leadStatus: string;
  leadSubStatus: string;
  booking: any;
  userRole?: string;
  onRefresh: () => void;
}

export function PostSalesPipelineCards({
  leadId,
  leadStatus,
  leadSubStatus,
  booking,
  userRole,
  onRefresh,
}: PostSalesPipelineCardsProps) {
  const [saving, setSaving] = useState(false);

  const handleMarkStageDone = async (status: string, subStatus: string) => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      await fetch(`${apiUrl}/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, subStatus }),
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (
    type: "loan" | "agreement" | "handover",
    fieldName: string,
    file: File
  ) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookingId", booking.id);
    formData.append("type", type);
    formData.append("fieldName", fieldName);

    await fetch(`${apiUrl}/api/leads/${leadId}/booking/post-sales-file`, {
      method: "POST",
      body: formData,
    });
    onRefresh();
  };

  const uploadDoc = async (
    docType: string,
    file: File,
    description?: string
  ) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);
    formData.append("bookingId", booking.id);
    if (description) {
      formData.append("description", description);
    }

    await fetch(`${apiUrl}/api/leads/${leadId}/booking/documents`, {
      method: "POST",
      body: formData,
    });
    onRefresh();
  };

  const saveModelData = async (endpoint: string, data: any) => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      await fetch(`${apiUrl}/api/leads/${leadId}/booking/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, data }),
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  // --- Stage Checks ---
  const stages = ["BOOKING", "DOCUMENT", "LOAN", "AGREEMENT", "HANDOVER"];
  const currentIdx = stages.indexOf(leadStatus);

  const getStageState = (statusKey: string) => {
    const thisIdx = stages.indexOf(statusKey);
    const isPast = currentIdx > thisIdx;
    const isCurrent = currentIdx === thisIdx;
    const isDone = isPast || (isCurrent && leadSubStatus === "DONE");
    const isLocked = currentIdx < thisIdx;
    return { isPast, isCurrent, isDone, isLocked };
  };

  const renderCardWrapper = (
    title: string,
    icon: React.ReactNode,
    statusKey: string,
    description: string,
    children: React.ReactNode
  ) => {
    const { isCurrent, isDone, isLocked } = getStageState(statusKey);

    if (isLocked) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-2xs opacity-60 pointer-events-none p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-400">
            <Lock size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] m-0">
              {title}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
              Locked until previous post-sales stage completes
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-white rounded-2xl border ${
          isDone
            ? "border-emerald-200 shadow-2xs"
            : "border-purple-300 ring-2 ring-purple-500/10 shadow-xs"
        } transition-all overflow-hidden`}
      >
        <div className="p-5 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDone
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-purple-50 border-purple-200 text-[var(--brand-700)]"
            }`}
          >
            {isDone ? <CheckCircle2 size={18} /> : icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-[var(--text-primary)] m-0">
              {title}
            </h3>
            <div
              className={`flex items-center gap-1 text-[11px] font-bold mt-0.5 ${
                isDone ? "text-emerald-700" : "text-[var(--brand-700)]"
              }`}
            >
              {isDone ? (
                <>
                  <CheckCircle2 size={12} />
                  <span>Stage Completed</span>
                </>
              ) : (
                <>
                  <Clock size={12} />
                  <span>Stage In Progress</span>
                </>
              )}
            </div>
          </div>

          {isCurrent && !isDone && userRole !== "CHANNEL_PARTNER" && (
            <button
              onClick={() => handleMarkStageDone(statusKey, "DONE")}
              disabled={saving}
              className="text-xs bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white px-4 py-2 rounded-xl font-bold disabled:opacity-50 transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
            >
              {saving ? "Saving…" : "Mark Stage as Done"}
            </button>
          )}
        </div>

        {!isLocked && (
          <div className="p-5 space-y-4 bg-white">
            {isCurrent && !isDone && (
              <p className="text-xs text-[var(--text-secondary)] font-medium m-0">
                {description}
              </p>
            )}
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderCardWrapper(
        "KYC Documentation",
        <FileText size={18} />,
        "DOCUMENT",
        "Collect, upload and verify all KYC and property-related identity proofs.",
        <DocumentForm
          booking={booking}
          saving={saving}
          uploadDoc={uploadDoc}
          userRole={userRole}
        />
      )}
      {renderCardWrapper(
        "Home Loan Processing",
        <Landmark size={18} />,
        "LOAN",
        "Process home loan applications, track underwriter reviews, and record disbursements.",
        <LoanForm
          booking={booking}
          saving={saving}
          saveModelData={saveModelData}
          uploadFile={uploadFile}
          userRole={userRole}
        />
      )}
      {renderCardWrapper(
        "Agreement to Sell Execution",
        <PenTool size={18} />,
        "AGREEMENT",
        "Draft, execute, and officially register the sale deed / agreement to sell.",
        <AgreementForm
          booking={booking}
          saving={saving}
          saveModelData={saveModelData}
          uploadFile={uploadFile}
          userRole={userRole}
        />
      )}
      {renderCardWrapper(
        "Possession & Handover",
        <Key size={18} />,
        "HANDOVER",
        "Complete final snagging checks, settle outstanding maintenance/meter dues, and hand over the keys.",
        <HandoverForm
          booking={booking}
          saving={saving}
          saveModelData={saveModelData}
          uploadFile={uploadFile}
          userRole={userRole}
        />
      )}
    </div>
  );
}
