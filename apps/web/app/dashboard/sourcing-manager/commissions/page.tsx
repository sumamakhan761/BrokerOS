"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Search,
  Handshake,
  Building,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { CommissionCompleteDialog } from "@/components/commissions/CommissionCompleteDialog";
import { toast } from "sonner";

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/brokers/commissions/all`);
      if (res.ok) {
        const data = await res.json();
        setCommissions(data);
      }
    } catch (e) {
      console.error("Failed to fetch commissions:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteClick = (record: any) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const handleConfirmPayment = async (file: File | null) => {
    if (!selectedRecord) return;
    try {
      setIsSaving(true);

      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${baseUrl}/api/brokers/commissions/${selectedRecord.id}/complete`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        await fetchCommissions();
        setDialogOpen(false);
        setSelectedRecord(null);
        toast.success("Broker commission marked as paid.");
      } else {
        toast.error("Failed to mark commission as paid.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving commission payment.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCommissions = commissions.filter((record) => {
    const matchesSearch =
      record.broker?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.booking?.unit?.floor?.tower?.project?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((acc, c) => acc + Number(c.netPayable || 0), 0);
  const totalPaid = commissions
    .filter((c) => c.status === "PAID")
    .reduce((acc, c) => acc + Number(c.paidAmount || 0), 0);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Handshake size={18} />
            </div>
            <span>External Broker Commission Payouts</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Audit channel partner settlements, brokerage claims & upload disbursement payment receipts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200/60 text-amber-600">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 m-0">
              Total Pending Settlements
            </p>
            <p className="text-2xl font-black text-amber-700 tabular-nums m-0">
              ₹{totalPending.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-200/60 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 m-0">
              Total Disbursed Payouts
            </p>
            <p className="text-2xl font-black text-emerald-700 tabular-nums m-0">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by broker or project name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all shadow-2xs placeholder:text-slate-400"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 w-fit">
          {["ALL", "PENDING", "PAID"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-600)]" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Loading broker commissions…
          </p>
        </div>
      ) : filteredCommissions.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-slate-200 border-dashed space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs">
            <Handshake size={18} />
          </div>
          <h3 className="text-xs font-bold text-slate-700 m-0">
            No broker commissions found
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] font-medium m-0">
            Adjust search criteria or filter status above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCommissions.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-extrabold text-[var(--text-primary)] m-0">
                      {record.broker?.name || "Unknown Broker"}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] mt-0.5">
                      <Building size={12} />
                      <span>
                        {record.booking?.unit?.floor?.tower?.project?.name ||
                          "Unknown Project"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                      record.status === "PAID"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 mb-3 text-xs">
                  <div>
                    <p className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 m-0">
                      Unit Allocated
                    </p>
                    <p className="font-bold text-slate-800 tabular-nums m-0">
                      {record.booking?.unit?.floor?.tower?.name || "T-?"} • Unit{" "}
                      {record.booking?.unit?.unitNumber || "?"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 m-0">
                      Booking Value
                    </p>
                    <p className="font-bold text-slate-800 tabular-nums m-0">
                      ₹{Number(record.bookingValue).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 m-0">
                        Commission Due (
                        {record.brokeragePercent
                          ? `${record.brokeragePercent}%`
                          : "Fixed"}
                        )
                      </p>
                      <p className="text-base font-extrabold text-emerald-600 tabular-nums m-0">
                        ₹{Number(record.brokerageAmount).toLocaleString("en-IN")}
                      </p>
                    </div>
                    {record.status === "PAID" && (
                      <div className="text-right">
                        <p className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider mb-0.5 m-0">
                          Paid On
                        </p>
                        <p className="font-bold text-emerald-800 tabular-nums text-xs m-0">
                          {new Date(record.paidAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {record.status === "PENDING" ? (
                  <button
                    onClick={() => handleCompleteClick(record)}
                    className="w-full py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold rounded-xl transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>Disburse Payment & Complete</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Disbursed
                    </span>
                    {record.paymentReference && (
                      <a
                        href={record.paymentReference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-700)] bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl transition-colors border border-purple-200/60 no-underline"
                      >
                        <FileText size={12} />
                        <span>Receipt</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CommissionCompleteDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleConfirmPayment}
        isSaving={isSaving}
        commissionAmount={selectedRecord?.netPayable || 0}
      />
    </div>
  );
}
