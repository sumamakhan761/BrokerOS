'use client';

import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, MessageSquare } from 'lucide-react';
import CreateApprovalModal from '@/features/approvals/components/modals/CreateApprovalModal';
import ApprovalTicket from '@/features/approvals/components/ticket/ApprovalTicket';

export default function SalesExecutiveApprovalPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketData, setSelectedTicketData] = useState<any | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'CLOSED': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 animate-[fadeUp_0.4s_ease_forwards]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div className="p-6 h-[calc(100vh-64px)] flex flex-col max-w-[1600px] mx-auto w-full">
        {!selectedTicketId ? (
          <>
            <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Approvals</h1>
                <p className="text-sm font-medium text-slate-500 mt-1.5">Manage your approval requests with your manager.</p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all rounded-xl h-10 px-4 font-bold">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 flex-col gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                <p className="text-sm font-medium text-slate-500">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 transition-all hover:border-indigo-200 hover:bg-indigo-50/30 group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-indigo-100 transition-colors">
                  <MessageSquare className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No requests found</h3>
                <p className="text-sm font-medium text-slate-500 mb-6 mt-1">You haven't created any approval requests yet.</p>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(true)} className="rounded-xl border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 font-bold">
                  Create First Request
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Manager</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Updated At</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50/50">
                    {requests.map(req => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                        onClick={() => handleOpenTicket(req.id)}
                      >
                        <td className="px-6 py-4 font-bold text-indigo-600 group-hover:text-indigo-700">#{req.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4 text-slate-900 font-bold">{req.messages[0]?.title || 'No Title'}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{req.manager?.name || '-'}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{new Date(req.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-6 py-4">
                          <Badge variant="default" className={`${getStatusColor(req.status)} px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider shadow-sm border`}>
                            {req.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 h-full min-h-0 animate-[fadeUp_0.4s_ease_forwards]">
            {ticketLoading || !selectedTicketData ? (
              <div className="flex items-center justify-center h-full flex-col gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                <p className="text-sm font-medium text-slate-500">Loading ticket...</p>
              </div>
            ) : (
              <ApprovalTicket
                ticket={selectedTicketData}
                role="SALES_EXECUTIVE"
                onBack={() => { setSelectedTicketId(null); fetchRequests(); }}
                onUpdate={() => fetchTicketDetails(selectedTicketId)}
              />
            )}
          </div>
        )}
      </div>

      <CreateApprovalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
