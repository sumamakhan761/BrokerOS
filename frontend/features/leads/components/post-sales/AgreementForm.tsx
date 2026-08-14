import React, { useState, useEffect } from 'react';
import { Upload, Download } from 'lucide-react';

interface AgreementFormProps {
  booking: any;
  saving: boolean;
  saveModelData: (endpoint: string, data: any) => void;
  uploadFile: (type: 'loan' | 'agreement' | 'handover', fieldName: string, file: File) => void;
}

export function AgreementForm({ booking, saving, saveModelData, uploadFile }: AgreementFormProps) {
  const [agreementData, setAgreementData] = useState(booking?.agreement || {});

  useEffect(() => {
    if (booking?.agreement) {
      setAgreementData(booking.agreement);
    }
  }, [booking?.agreement]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Agreement Number" value={agreementData.agreementNumber || ''} onChange={e => setAgreementData({ ...agreementData, agreementNumber: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <select value={agreementData.status || 'NOT_STARTED'} onChange={e => setAgreementData({ ...agreementData, status: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900">
          <option value="NOT_STARTED">Not Started</option>
          <option value="DRAFT_PREPARED">Draft Prepared</option>
          <option value="STAMP_DUTY_PAID">Stamp Duty Paid</option>
          <option value="REGISTERED">Registered</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <input type="text" placeholder="Sub-Registrar Office" value={agreementData.subRegistrarOffice || ''} onChange={e => setAgreementData({ ...agreementData, subRegistrarOffice: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="datetime-local" value={agreementData.appointmentTime ? new Date(agreementData.appointmentTime).toISOString().slice(0, 16) : ''} onChange={e => setAgreementData({ ...agreementData, appointmentTime: new Date(e.target.value).toISOString() })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="number" placeholder="Stamp Duty Amount (₹)" value={agreementData.stampDutyAmount || ''} onChange={e => setAgreementData({ ...agreementData, stampDutyAmount: Number(e.target.value) })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="number" placeholder="Registration Fee (₹)" value={agreementData.registrationFee || ''} onChange={e => setAgreementData({ ...agreementData, registrationFee: Number(e.target.value) })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="text" placeholder="Lawyer Name" value={agreementData.lawyerName || ''} onChange={e => setAgreementData({ ...agreementData, lawyerName: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="text" placeholder="Lawyer Contact" value={agreementData.lawyerContact || ''} onChange={e => setAgreementData({ ...agreementData, lawyerContact: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
      </div>
      <textarea placeholder="Remarks / Notes" value={agreementData.remarks || ''} onChange={e => setAgreementData({ ...agreementData, remarks: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 resize-none" rows={2}></textarea>
      <button onClick={() => saveModelData('agreement', agreementData)} disabled={saving} className="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all active:scale-95">
        Save Details
      </button>

      <div className="mt-5 border-t border-gray-100 pt-5 space-y-3">
        {['draftDocumentUrl', 'finalDocumentUrl'].map(field => (
          <div key={field} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/80 bg-white shadow-sm transition-all">
            <p className="text-sm font-semibold text-gray-900">{field === 'draftDocumentUrl' ? 'Draft Document' : 'Final Document'}</p>
            {booking?.agreement?.[field] ? (
              <a href={booking.agreement[field]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-lg font-bold transition-all"><Download className="w-3.5 h-3.5" /> View</a>
            ) : (
              <label className="cursor-pointer flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-1.5 rounded-lg font-bold transition-all">
                <Upload className="w-3.5 h-3.5" /> Upload
                <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadFile('agreement', field, e.target.files[0]); }} disabled={saving} />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
