'use client';

import React, { useState } from 'react';
import { FileText, Banknote, PenTool, Key, CheckCircle, Clock } from 'lucide-react';
import { DocumentForm } from '@/features/leads/components/post-sales/DocumentForm';
import { LoanForm } from '@/features/leads/components/post-sales/LoanForm';
import { AgreementForm } from '@/features/leads/components/post-sales/AgreementForm';
import { HandoverForm } from '@/features/leads/components/post-sales/HandoverForm';
import { authClient } from '@/lib/auth-client';

interface PostSalesPipelineCardsProps {
  leadId: string;
  leadStatus: string;
  leadSubStatus: string;
  booking: any;
  userRole?: string;
  onRefresh: () => void;
}

export function PostSalesPipelineCards({ leadId, leadStatus, leadSubStatus, booking, userRole, onRefresh }: PostSalesPipelineCardsProps) {
  const [saving, setSaving] = useState(false);

  const handleMarkStageDone = async (status: string, subStatus: string) => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      await fetch(`${apiUrl}/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, subStatus }),
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (type: 'loan' | 'agreement' | 'handover', fieldName: string, file: File) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', booking.id);
    formData.append('type', type);
    formData.append('fieldName', fieldName);

    await fetch(`${apiUrl}/api/leads/${leadId}/booking/post-sales-file`, {
      method: 'POST',
      body: formData,
    });
    onRefresh();
  };

  const uploadDoc = async (docType: string, file: File, description?: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    formData.append('bookingId', booking.id);
    if (description) {
      formData.append('description', description);
    }

    await fetch(`${apiUrl}/api/leads/${leadId}/booking/documents`, {
      method: 'POST',
      body: formData,
    });
    onRefresh();
  };

  const saveModelData = async (endpoint: string, data: any) => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      await fetch(`${apiUrl}/api/leads/${leadId}/booking/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, data }),
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  // --- Stage Checks ---
  const stages = ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'];
  const currentIdx = stages.indexOf(leadStatus);

  const getStageState = (statusKey: string) => {
    const thisIdx = stages.indexOf(statusKey);
    const isPast = currentIdx > thisIdx;
    const isCurrent = currentIdx === thisIdx;
    const isDone = isPast || (isCurrent && leadSubStatus === 'DONE');
    const isLocked = currentIdx < thisIdx;
    return { isPast, isCurrent, isDone, isLocked };
  };

  const renderCardWrapper = (title: string, icon: any, statusKey: string, description: string, children: React.ReactNode) => {
    const { isCurrent, isDone, isLocked } = getStageState(statusKey);

    if (isLocked) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm opacity-60 pointer-events-none">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50/80 flex items-center justify-center border border-gray-100/50 text-gray-400">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-400 font-medium">Locked until previous stage completes</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-2xl border ${isDone ? 'border-emerald-200 shadow-sm' : 'border-indigo-200 ring-4 ring-indigo-50/50 shadow-sm'} transition-all overflow-hidden`}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDone ? 'bg-emerald-50/80 border-emerald-100/50 text-emerald-600' : 'bg-indigo-50/80 border-indigo-100/50 text-indigo-600'}`}>
            {isDone ? <CheckCircle className="w-5 h-5" /> : icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className={`flex items-center gap-1 text-xs font-medium ${isDone ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {isDone ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>In Progress</span>
                </>
              )}
            </div>
          </div>
          {isCurrent && !isDone && userRole !== 'CHANNEL_PARTNER' && (
            <button
              onClick={() => handleMarkStageDone(statusKey, 'DONE')}
              disabled={saving}
              className="text-sm bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
              {saving ? 'Saving...' : 'Mark as Done'}
            </button>
          )}
        </div>

        {(!isLocked) && (
          <div className="p-6 space-y-5 bg-gray-50/30">
            {isCurrent && !isDone && <p className="text-sm font-medium text-gray-600">{description}</p>}
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderCardWrapper('Documentation', <FileText className="w-5 h-5" />, 'DOCUMENT', 'Collect and verify all KYC and property related documents.',
        <DocumentForm booking={booking} saving={saving} uploadDoc={uploadDoc} userRole={userRole} />
      )}
      {renderCardWrapper('Loan Processing', <Banknote className="w-5 h-5" />, 'LOAN', 'Process home loan applications and await disbursement.',
        <LoanForm booking={booking} saving={saving} saveModelData={saveModelData} uploadFile={uploadFile} userRole={userRole} />
      )}
      {renderCardWrapper('Agreement Execution', <PenTool className="w-5 h-5" />, 'AGREEMENT', 'Draft and execute the final agreement to sell / sale deed.',
        <AgreementForm booking={booking} saving={saving} saveModelData={saveModelData} uploadFile={uploadFile} userRole={userRole} />
      )}
      {renderCardWrapper('Handover', <Key className="w-5 h-5" />, 'HANDOVER', 'Complete final snagging, clear dues, and hand over the keys.',
        <HandoverForm booking={booking} saving={saving} saveModelData={saveModelData} uploadFile={uploadFile} userRole={userRole} />
      )}
    </div>
  );
}
