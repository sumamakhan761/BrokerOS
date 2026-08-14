import React, { useState, useEffect } from 'react';
import { Upload, Download } from 'lucide-react';

interface LoanFormProps {
  booking: any;
  saving: boolean;
  saveModelData: (endpoint: string, data: any) => void;
  uploadFile: (type: 'loan' | 'agreement' | 'handover', fieldName: string, file: File) => void;
}

export function LoanForm({ booking, saving, saveModelData, uploadFile }: LoanFormProps) {
  const [loanData, setLoanData] = useState(booking?.loanCase || {});

  useEffect(() => {
    if (booking?.loanCase) {
      setLoanData(booking.loanCase);
    }
  }, [booking?.loanCase]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Loan Application No." value={loanData.loanApplicationNumber || ''} onChange={e => setLoanData({ ...loanData, loanApplicationNumber: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <select value={loanData.status || 'NOT_APPLIED'} onChange={e => setLoanData({ ...loanData, status: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900">
          <option value="NOT_APPLIED">Not Applied</option>
          <option value="APPLIED">Applied</option>
          <option value="DOCUMENTS_SUBMITTED">Documents Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="DISBURSED">Disbursed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input type="text" placeholder="Bank Name" value={loanData.bankName || ''} onChange={e => setLoanData({ ...loanData, bankName: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="text" placeholder="Branch" value={loanData.bankBranch || ''} onChange={e => setLoanData({ ...loanData, bankBranch: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="text" placeholder="DSA / Agent Name" value={loanData.dsaName || ''} onChange={e => setLoanData({ ...loanData, dsaName: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="text" placeholder="DSA Contact" value={loanData.dsaContact || ''} onChange={e => setLoanData({ ...loanData, dsaContact: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="number" placeholder="Applied Amount (₹)" value={loanData.loanAmount || ''} onChange={e => setLoanData({ ...loanData, loanAmount: Number(e.target.value) })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="number" placeholder="Approved Amount (₹)" value={loanData.approvedAmount || ''} onChange={e => setLoanData({ ...loanData, approvedAmount: Number(e.target.value) })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="number" placeholder="Interest Rate (%)" value={loanData.interestRate || ''} onChange={e => setLoanData({ ...loanData, interestRate: Number(e.target.value) })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
        <input type="number" placeholder="Tenure (Months)" value={loanData.tenure || ''} onChange={e => setLoanData({ ...loanData, tenure: Number(e.target.value) })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400" />
      </div>
      <textarea placeholder="Internal Notes / Remarks" value={loanData.internalNotes || ''} onChange={e => setLoanData({ ...loanData, internalNotes: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 resize-none" rows={2}></textarea>
      <button onClick={() => saveModelData('loan-case', loanData)} disabled={saving} className="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all active:scale-95">
        Save Details
      </button>

      <div className="mt-5 border-t border-gray-100 pt-5 space-y-3">
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/80 bg-white shadow-sm transition-all">
          <p className="text-sm font-semibold text-gray-900">Sanction Letter</p>
          {booking?.loanCase?.sanctionLetterUrl ? (
            <a href={booking.loanCase.sanctionLetterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-lg font-bold transition-all"><Download className="w-3.5 h-3.5" /> View</a>
          ) : (
            <label className="cursor-pointer flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-1.5 rounded-lg font-bold transition-all">
              <Upload className="w-3.5 h-3.5" /> Upload
              <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadFile('loan', 'sanctionLetterUrl', e.target.files[0]); }} disabled={saving} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
