"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Inbox, CheckCircle2, Loader2, FileCheck } from "lucide-react";
import ApprovalTicket from "@/features/approvals/components/ticket/ApprovalTicket";

export default function SalesManagerApprovalPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketData, setSelectedTicketData] = useState<any | null>(null);
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
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider">
            Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider">
            Rejected
          </span>
        );
      case "CLOSED":
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider">
            Closed
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      {!selectedTicketId ? (
        <>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
                <FileCheck size={18} />
              </div>
              <span>Team Approval Requests</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
              Authorize booking discounts, unit allotment exceptions & payment plan overrides
            </p>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Loading team requests…
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-slate-200 border-dashed space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs">
                <Inbox size={18} />
              </div>
              <h3 className="text-xs font-bold text-slate-700 m-0">
                All caught up!
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] font-medium m-0">
                There are no pending tickets awaiting your authorization.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Sales Executive
                      </th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Request Subject
                      </th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Updated At
                      </th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        onClick={() => handleOpenTicket(req.id)}
                      >
                        <td className="px-5 py-3.5 font-extrabold text-[var(--brand-700)] tabular-nums">
                          #{req.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-purple-50 text-[var(--brand-700)] px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-purple-200/60 uppercase tracking-wider">
                            {req.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-800 font-bold">
                          {req.salesExec?.name || "Executive"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 font-medium max-w-xs truncate">
                          {req.messages[0]?.title || "Approval Request"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-semibold tabular-nums">
                          {new Date(req.updatedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          {getStatusBadge(req.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1">
          {ticketLoading || !selectedTicketData ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Loading approval thread…
              </p>
            </div>
          ) : (
            <ApprovalTicket
              ticket={selectedTicketData}
              role="SALES_MANAGER"
              onBack={() => {
                setSelectedTicketId(null);
                fetchRequests();
              }}
              onUpdate={() => fetchTicketDetails(selectedTicketId)}
            />
          )}
        </div>
      )}
    </div>
  );
}
