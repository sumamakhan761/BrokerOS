'use client';

import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Inbox } from 'lucide-react';
import ApprovalTicket from '@/features/approvals/components/ticket/ApprovalTicket';

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
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50">
      <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
        {!selectedTicketId ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Team Approvals</h1>
              <p className="text-slate-500">Review and manage approval requests from your team.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" /></div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                <p className="text-slate-500 mb-4">There are no pending requests from your team.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium text-slate-500">ID</th>
                      <th className="px-6 py-4 font-medium text-slate-500">Type</th>
                      <th className="px-6 py-4 font-medium text-slate-500">Sales Executive</th>
                      <th className="px-6 py-4 font-medium text-slate-500">Latest Request Title</th>
                      <th className="px-6 py-4 font-medium text-slate-500">Updated At</th>
                      <th className="px-6 py-4 font-medium text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map(req => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleOpenTicket(req.id)}
                      >
                        <td className="px-6 py-4 font-medium text-blue-600">#{req.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          {req.type === 'BOOKING' && (
                            <Badge variant="default" className="bg-indigo-50 text-indigo-600 border-indigo-200 font-bold px-2 py-0.5 border">
                              {req.type}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-800 font-semibold">{req.salesExec?.name || '-'}</td>
                        <td className="px-6 py-4 text-slate-600">{req.messages[0]?.title || 'No Title'}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(req.updatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant="default" className={`${getStatusColor(req.status)} px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider shadow-sm border`}>{req.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 h-full min-h-0">
            {ticketLoading || !selectedTicketData ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
              </div>
            ) : (
              <ApprovalTicket
                ticket={selectedTicketData}
                role="SALES_MANAGER"
                onBack={() => { setSelectedTicketId(null); fetchRequests(); }}
                onUpdate={() => fetchTicketDetails(selectedTicketId)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
