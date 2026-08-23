import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export function EmployeeLeadsView({ employeeId }: { employeeId: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<any[]>(`/api/leads/employee/${employeeId}`, { baseURL: baseUrl });
        if (res.data) setLeads(res.data);
      } catch (e) {
        console.error("Failed to load leads", e);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="font-medium">Loading leads...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Lead Name</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Status</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Score</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Next Follow-up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {lead.score || 0}/100
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'None'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
