"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Handshake, CheckCircle2, Clock, Filter, Search, Building } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { authClient } from '@/lib/auth-client';
import { InboundCommissionReceiveDialog } from '@/components/commissions/InboundCommissionReceiveDialog';

export default function PostSalesCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, RECEIVED

  const [selectedComm, setSelectedComm] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await authClient.$fetch('/api/dashboard/post-sales/commissions', { baseURL: baseUrl });
      if (res.error) throw res.error;
      setCommissions(res.data as any[]);
    } catch (err: any) {
      console.error(err);
      alert('Failed to load commissions: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleReceive = async (data: { file: File | null; remarks: string }) => {
    if (!selectedComm) return;
    try {
      setIsSaving(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await authClient.$fetch(`/api/dashboard/post-sales/commissions/${selectedComm.id}/receive`, {
        method: 'PUT',
        baseURL: baseUrl,
        body: { remarks: data.remarks }
      });
      if (res.error) throw res.error;
      alert('Commission marked as received.');
      setIsModalOpen(false);
      fetchCommissions();
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = commissions.filter(c => {
    if (filter !== 'ALL' && c.status !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      const proj = (c.project?.name || '').toLowerCase();
      const unit = (c.unit?.unitNumber || '').toLowerCase();
      const cust = (c.booking?.customer?.firstName || '').toLowerCase();
      return proj.includes(term) || unit.includes(term) || cust.includes(term);
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Handshake className="w-6 h-6 text-emerald-600" />
            Inbound Commissions
          </h1>
          <p className="text-slate-500 mt-1">Track commissions owed by developers on unit handover.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search project, unit, or customer..."
            className="pl-9 bg-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
          {['ALL', 'PENDING', 'RECEIVED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {f === 'ALL' ? 'All' : f === 'PENDING' ? 'Pending' : 'Received'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Handshake className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No commissions found</h3>
          <p className="text-slate-500 mt-1">Check back later when units are handed over.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(comm => (
            <Card key={comm.id} className="hover:shadow-md transition-shadow overflow-hidden border-slate-200">
              <div className={`h-1.5 w-full ${comm.status === 'RECEIVED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{comm.project?.name || 'Unknown Project'}</h3>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5" /> Unit {comm.unit?.unitNumber}
                    </p>
                  </div>
                  <Badge variant={comm.status === 'RECEIVED' ? 'success' : 'warning'}>
                    {comm.status === 'RECEIVED' ? 'Received' : 'Pending'}
                  </Badge>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-500 font-medium mb-1">Expected Commission</p>
                  <p className="text-2xl font-black text-emerald-600">₹{Number(comm.commissionAmount).toLocaleString('en-IN')}</p>
                  {comm.unit?.commissionPercentage && (
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">{comm.unit.commissionPercentage}% of agreement value</p>
                  )}
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-medium text-slate-900">{comm.booking?.customer?.firstName} {comm.booking?.customer?.lastName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Sales Exec:</span>
                    <span className="font-medium text-slate-900">{comm.booking?.salesExec?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Date Triggered:</span>
                    <span className="font-medium text-slate-900">{new Date(comm.createdAt).toLocaleDateString()}</span>
                  </div>
                  {comm.status === 'RECEIVED' && comm.receivedAt && (
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Received On:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {new Date(comm.receivedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {comm.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      setSelectedComm(comm);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Received
                  </button>
                )}
              </div>
            </Card>
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
