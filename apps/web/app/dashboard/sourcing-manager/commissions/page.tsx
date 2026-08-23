"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Filter, Handshake, Building, MapPin, CheckCircle2, Clock, UploadCloud, FileText } from 'lucide-react';
import { CommissionCompleteDialog } from '@/components/commissions/CommissionCompleteDialog';
import { toast } from 'sonner';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/commissions/all`);
      if (res.ok) {
        const data = await res.json();
        setCommissions(data);
      }
    } catch (e) {
      console.error('Failed to fetch commissions:', e);
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
        formData.append('file', file);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/commissions/${selectedRecord.id}/complete`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await fetchCommissions();
        setDialogOpen(false);
        setSelectedRecord(null);
      } else {
        toast.error('Failed to mark commission as paid.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving commission payment.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCommissions = commissions.filter(record => {
    const matchesSearch = record.broker?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.booking?.unit?.floor?.tower?.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = commissions.filter(c => c.status === 'PENDING').reduce((acc, c) => acc + Number(c.netPayable || 0), 0);
  const totalPaid = commissions.filter(c => c.status === 'PAID').reduce((acc, c) => acc + Number(c.paidAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Broker Commissions</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage pending and completed brokerage payouts.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 z-0" />
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 relative z-10 border border-amber-200">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pending</p>
            <p className="text-3xl font-black text-amber-700">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 z-0" />
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0 relative z-10 border border-emerald-200">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Paid</p>
            <p className="text-3xl font-black text-emerald-700">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by broker or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl h-[50px]">
          {['ALL', 'PENDING', 'PAID'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 rounded-lg text-sm font-semibold transition-all ${filterStatus === status
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCommissions.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-600">No commissions found</p>
            <p className="text-slate-500 mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          filteredCommissions.map(record => (
            <div key={record.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900">{record.broker?.name || 'Unknown Broker'}</span>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <Building className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{record.booking?.unit?.floor?.tower?.project?.name || 'Unknown Project'}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1
                  ${record.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}
                `}>
                  {record.status === 'PAID' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {record.status}
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Unit Info</p>
                  <p className="text-sm font-bold text-slate-700">
                    {record.booking?.unit?.floor?.tower?.name || 'T-?'} / Unit {record.booking?.unit?.unitNumber || '?'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Booking Value</p>
                  <p className="text-sm font-bold text-slate-700">₹{Number(record.bookingValue).toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Commission ({record.brokeragePercent ? `${record.brokeragePercent}%` : 'Flat'})</p>
                  <p className="text-lg font-black text-emerald-600">₹{Number(record.brokerageAmount).toLocaleString('en-IN')}</p>
                </div>

                {record.status === 'PAID' && (
                  <div>
                    <p className="text-xs text-emerald-600/70 font-bold uppercase mb-1">Paid On</p>
                    <p className="text-sm font-bold text-emerald-700">{new Date(record.paidAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 mt-auto flex items-center justify-between">
                {record.status === 'PENDING' ? (
                  <button
                    onClick={() => handleCompleteClick(record)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
                  >
                    Mark as Paid
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Payment Completed
                    </span>
                    {record.paymentReference && (
                      <a
                        href={record.paymentReference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors border border-indigo-100"
                      >
                        <FileText className="w-4 h-4" />
                        View Receipt
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <CommissionCompleteDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelectedRecord(null); }}
        onConfirm={handleConfirmPayment}
        isSaving={isSaving}
        commissionAmount={selectedRecord?.netPayable || 0}
      />
    </div>
  );
}
