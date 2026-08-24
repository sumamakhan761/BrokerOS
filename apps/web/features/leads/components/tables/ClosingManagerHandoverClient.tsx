"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Handshake, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ClosingManagerHandoverFormModal } from "../modals/ClosingManagerHandoverFormModal";
import { StatusPill } from "./TablePrimitives";

function ClosingManagerHandoverContent() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      const statuses =
        activeTab === "pending"
          ? ["BOOKING", "AGREEMENT"]
          : ["HANDOVER", "SOLD"];

      let allLeads: any[] = [];

      for (const st of statuses) {
        const res = await authClient.$fetch<any[]>(
          `/api/leads?status=${st}&isCpProject=true`,
          { baseURL: apiUrl }
        );
        if (res.data) {
          allLeads = [...allLeads, ...res.data];
        }
      }

      // Unique leads
      let uniqueLeads = Array.from(
        new Map(allLeads.map((item) => [item.id, item])).values()
      );
      uniqueLeads.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLeads(uniqueLeads);
    } catch (e) {
      console.error("Failed to fetch handover leads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab]);

  return (
    <Card className="space-y-5 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
            {activeTab === "pending"
              ? "Leads Ready for Post-Sales Handover"
              : "Completed Handovers"}
          </h2>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
            {activeTab === "pending"
              ? "Prospects that have finalized closing negotiations and are awaiting formal post-sales induction."
              : "Prospects successfully transitioned to post-sales processing."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-[0.96] press-effect ${
              activeTab === "pending"
                ? "bg-white text-[var(--brand-700)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Pending Handover
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-[0.96] press-effect ${
              activeTab === "completed"
                ? "bg-white text-[var(--brand-700)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80">
            <tr>
              <th className="py-3 px-4 font-extrabold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Customer Name
              </th>
              <th className="py-3 px-4 font-extrabold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Phone
              </th>
              <th className="py-3 px-4 font-extrabold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-4 font-extrabold text-[10px] text-[var(--text-muted)] uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs font-semibold text-[var(--text-muted)]">
                  Loading handover leads…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs font-semibold text-[var(--text-muted)]">
                  {activeTab === "pending"
                    ? "No leads currently pending handover."
                    : "No completed handovers on record."}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                  onClick={() =>
                    router.push(
                      `/dashboard/closing-manager/lead-management/${lead.id}`
                    )
                  }
                >
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-700)] transition-colors">
                    {lead.firstName} {lead.lastName || ""}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-secondary)] tabular-nums">
                    {lead.phone || "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusPill status={lead.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {activeTab === "pending" ? (
                      <Button
                        size="sm"
                        variant="luxury"
                        className="gap-1.5 text-xs py-1 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                      >
                        <Handshake className="w-3.5 h-3.5" />
                        <span>Handover</span>
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Handed Over</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLead && (
        <ClosingManagerHandoverFormModal
          isOpen={!!selectedLead}
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSuccess={() => {
            setSelectedLead(null);
            fetchLeads();
          }}
        />
      )}
    </Card>
  );
}

export function ClosingManagerHandoverClient() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-semibold text-[var(--text-muted)]">
          Loading handover workspace…
        </div>
      }
    >
      <ClosingManagerHandoverContent />
    </Suspense>
  );
}
