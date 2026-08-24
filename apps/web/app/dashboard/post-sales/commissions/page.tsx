"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  Loader2,
  Handshake,
  CheckCircle2,
  Search,
  Building,
  IndianRupee,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { InboundCommissionReceiveDialog } from "@/components/commissions/InboundCommissionReceiveDialog";
import { toast } from "sonner";

export default function PostSalesCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, RECEIVED

  const [selectedComm, setSelectedComm] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch(
        "/api/dashboard/post-sales/commissions",
        { baseURL: baseUrl }
      );
      if (res.error) throw res.error;
      setCommissions(res.data as any[]);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load commissions: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleReceive = async (data: {
    file: File | null;
    remarks: string;
  }) => {
    if (!selectedComm) return;
    try {
      setIsSaving(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch(
        `/api/dashboard/post-sales/commissions/${selectedComm.id}/receive`,
        {
          method: "PUT",
          baseURL: baseUrl,
          body: { remarks: data.remarks },
        }
      );
      if (res.error) throw res.error;
      toast.success("Commission marked as received.");
      setIsModalOpen(false);
      fetchCommissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = commissions.filter((c) => {
    if (filter !== "ALL" && c.status !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      const proj = (c.project?.name || "").toLowerCase();
      const unit = (c.unit?.unitNumber || "").toLowerCase();
      const cust = (c.booking?.customer?.firstName || "").toLowerCase();
      return (
        proj.includes(term) || unit.includes(term) || cust.includes(term)
      );
    }
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Handshake size={18} />
            </div>
            <span>Inbound Builder Commissions</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Track receivables and commission payouts owed by property developers upon handover
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search project, unit, or customer…"
            className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all shadow-2xs placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 w-fit">
          {["ALL", "PENDING", "RECEIVED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f === "ALL" ? "All" : f === "PENDING" ? "Pending" : "Received"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-600)]" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Loading inbound commissions…
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-slate-200 border-dashed space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs">
            <Handshake size={18} />
          </div>
          <h3 className="text-xs font-bold text-slate-700 m-0">
            No inbound commissions found
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] font-medium m-0">
            Commissions will populate automatically when units complete the handover pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comm) => (
            <div
              key={comm.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)] m-0">
                      {comm.project?.name || "Project"}
                    </h3>
                    <p className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1 mt-0.5 m-0 tabular-nums">
                      <Building size={12} /> Unit {comm.unit?.unitNumber}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                      comm.status === "RECEIVED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {comm.status === "RECEIVED" ? "Received" : "Pending"}
                  </span>
                </div>

                <div className="bg-purple-50/60 rounded-2xl p-3 mb-3 border border-purple-100/60">
                  <p className="text-[9px] font-extrabold text-[var(--brand-700)] uppercase tracking-wider mb-0.5 m-0">
                    Receivable Commission
                  </p>
                  <p className="text-xl font-extrabold text-purple-950 tabular-nums m-0">
                    ₹{Number(comm.commissionAmount).toLocaleString("en-IN")}
                  </p>
                  {comm.unit?.commissionPercentage && (
                    <p className="text-[10px] font-bold text-[var(--brand-700)] mt-0.5 m-0 tabular-nums">
                      {comm.unit.commissionPercentage}% builder cut
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-semibold">
                      Customer:
                    </span>
                    <span className="font-bold text-[var(--text-primary)] truncate max-w-[140px]">
                      {comm.booking?.customer?.firstName}{" "}
                      {comm.booking?.customer?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-semibold">
                      Sales Exec:
                    </span>
                    <span className="font-bold text-slate-700">
                      {comm.booking?.salesExec?.name || "Executive"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-semibold">
                      Triggered:
                    </span>
                    <span className="font-bold text-slate-700 tabular-nums">
                      {new Date(comm.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {comm.status === "RECEIVED" && comm.receivedAt && (
                    <div className="flex justify-between pt-1.5 border-t border-slate-100">
                      <span className="text-[var(--text-muted)] font-semibold">
                        Received On:
                      </span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1 tabular-nums">
                        <CheckCircle2 size={12} />{" "}
                        {new Date(comm.receivedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {comm.status === "PENDING" && (
                <button
                  onClick={() => {
                    setSelectedComm(comm);
                    setIsModalOpen(true);
                  }}
                  className="w-full mt-4 py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  <span>Mark as Received</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedComm && (
        <InboundCommissionReceiveDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleReceive}
          isSaving={isSaving}
          commissionAmount={selectedComm.commissionAmount}
        />
      )}
    </div>
  );
}
