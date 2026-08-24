"use client";

import React, { useEffect, useState } from "react";
import { Plus, MessageSquare, ShieldCheck, Loader2 } from "lucide-react";
import CreateApprovalModal from "@/features/approvals/components/modals/CreateApprovalModal";
import ApprovalTicket from "@/features/approvals/components/ticket/ApprovalTicket";

export default function SalesExecutiveApprovalPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketData, setSelectedTicketData] = useState<any | null>(
    null
  );
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/approvals`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (id: string) => {
    setSelectedTicketId(id);
    fetchTicketDetails(id);
  };

  const fetchTicketDetails = async (id: string) => {
    try {
      setTicketLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/approvals/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicketData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTicketLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-4 md:p-0 max-w-[1600px] mx-auto space-y-6 animate-enter">
      {!selectedTicketId ? (
        <>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
                  <ShieldCheck size={18} />
                </div>
                <span>Approval Requests</span>
              </h1>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
                Submit and track manager reviews for discounted bookings & agreements
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>New Approval Request</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 flex-col gap-3">
              <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Loading approval requests…
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] mx-auto border border-purple-200 shadow-2xs">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] m-0">
                  No approval tickets created
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-medium mt-1 max-w-sm mx-auto m-0">
                  When you submit discount waivers or special unit booking approvals, they will appear here.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-[0.96] press-effect cursor-pointer"
              >
                Create First Request
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider w-20">
                      ID
                    </th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                      Subject / Title
                    </th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                      Assigned Manager
                    </th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      onClick={() => handleOpenTicket(req.id)}
                    >
                      <td className="px-5 py-3.5 font-bold text-[var(--brand-700)] tabular-nums">
                        #{req.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-700)] transition-colors">
                        {req.messages[0]?.title || "Approval Request"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-purple-50 text-[var(--brand-700)] border border-purple-200/60 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                          {req.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-semibold">
                        {req.manager?.name || "Manager"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-medium tabular-nums">
                        {new Date(req.updatedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`${getStatusBadge(
                            req.status
                          )} px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-wider border inline-block`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="animate-enter">
          {ticketLoading || !selectedTicketData ? (
            <div className="flex items-center justify-center py-10 flex-col gap-3">
              <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Loading approval ticket thread…
              </p>
            </div>
          ) : (
            <ApprovalTicket
              ticket={selectedTicketData}
              role="SALES_EXECUTIVE"
              onBack={() => {
                setSelectedTicketId(null);
                fetchRequests();
              }}
              onUpdate={() => fetchTicketDetails(selectedTicketId)}
            />
          )}
        </div>
      )}

      <CreateApprovalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
