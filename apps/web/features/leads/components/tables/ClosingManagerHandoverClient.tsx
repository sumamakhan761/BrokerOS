'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Handshake, CheckCircle2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { ClosingManagerHandoverFormModal } from '../modals/ClosingManagerHandoverFormModal';

function ClosingManagerHandoverContent() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

      const statuses = activeTab === 'pending'
        ? ['BOOKING', 'AGREEMENT']
        : ['HANDOVER', 'SOLD'];

      let allLeads: any[] = [];

      for (const st of statuses) {
        const res = await authClient.$fetch<any[]>(`/api/leads?status=${st}&isCpProject=true`, { baseURL: apiUrl });
        if (res.data) {
          allLeads = [...allLeads, ...res.data];
        }
      }

      // Unique leads
      let uniqueLeads = Array.from(new Map(allLeads.map(item => [item.id, item])).values());
      uniqueLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setLeads(uniqueLeads);
    } catch (e) {
      console.error('Failed to fetch leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [activeTab]);

  return (
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 pt-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {activeTab === 'pending' ? 'Leads Ready for Handover' : 'Completed Handovers'}
          </h2>
          <p className="text-sm text-gray-500">
            {activeTab === 'pending'
              ? 'Leads that have completed the closing process and are ready for Post Sales.'
              : 'Leads that you have successfully handed over or sold.'}
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'completed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">Loading leads...</td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  {activeTab === 'pending' ? 'No leads eligible for handover right now.' : 'No completed handovers found.'}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/closing-manager/lead-management/${lead.id}`)}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600">{lead.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {activeTab === 'pending' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                      >
                        <Handshake className="w-4 h-4" />
                        Handover
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 px-3 py-1.5 bg-green-50 rounded-md">
                        <CheckCircle2 className="w-4 h-4" />
                        Done
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
            fetchLeads(); // Refresh table after handover
          }}
        />
      )}
    </Card>
  );
}

export function ClosingManagerHandoverClient() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
      <ClosingManagerHandoverContent />
    </Suspense>
  );
}

