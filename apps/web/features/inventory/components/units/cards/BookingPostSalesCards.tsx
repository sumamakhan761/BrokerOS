import React from 'react';
import { FileText, Banknote, PenTool, Key, CheckCircle2, Download } from 'lucide-react';

interface BookingPostSalesCardsProps {
  booking: any;
  renderField: (label: string, value: any) => React.ReactNode;
  renderDocLink: (label: string, url: string | null) => React.ReactNode | null;
}

export function BookingPostSalesCards({ booking, renderField, renderDocLink }: BookingPostSalesCardsProps) {
  const { loanCase, agreement, possession, documents } = booking;

  return (
    <>
      {/* Documentation Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Documentation</h3>
        </div>
        <div className="p-4">
          {documents && documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{doc.type}</p>
                      {doc.description && <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>}
                    </div>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-md font-bold transition-all">
                    <Download className="w-3.5 h-3.5" /> View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
          )}
        </div>
      </div>

      {/* Loan Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Loan Processing</h3>
        </div>
        <div className="p-4">
          {!loanCase ? (
            <p className="text-sm text-slate-500 italic">No loan details available.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {renderField('Status', loanCase.status?.replace(/_/g, ' '))}
                {renderField('Bank Name', loanCase.bankName)}
                {renderField('App No.', loanCase.loanApplicationNumber)}
                {renderField('Amount', loanCase.loanAmount ? `₹${Number(loanCase.loanAmount).toLocaleString('en-IN')}` : null)}
                {renderField('Approved', loanCase.approvedAmount ? `₹${Number(loanCase.approvedAmount).toLocaleString('en-IN')}` : null)}
                {renderField('Agent / DSA', loanCase.dsaName)}
              </div>
              {loanCase.internalNotes && (
                <div className="pt-2 border-t border-slate-50">
                  <p className="text-xs text-slate-500 font-medium mb-1">Notes</p>
                  <p className="text-sm text-slate-700">{loanCase.internalNotes}</p>
                </div>
              )}
              {renderDocLink('Sanction Letter', loanCase.sanctionLetterUrl)}
            </div>
          )}
        </div>
      </div>

      {/* Agreement Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Agreement</h3>
        </div>
        <div className="p-4">
          {!agreement ? (
            <p className="text-sm text-slate-500 italic">No agreement details available.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {renderField('Status', agreement.status?.replace(/_/g, ' '))}
                {renderField('Agreement No.', agreement.agreementNumber)}
                {renderField('Sub-Registrar', agreement.subRegistrarOffice)}
                {renderField('Lawyer', agreement.lawyerName)}
                {renderField('Stamp Duty', agreement.stampDutyAmount ? `₹${Number(agreement.stampDutyAmount).toLocaleString('en-IN')}` : null)}
                {renderField('Appt Time', agreement.appointmentTime ? new Date(agreement.appointmentTime).toLocaleString() : null)}
              </div>
              <div className="space-y-2 pt-2">
                {renderDocLink('Draft Document', agreement.draftDocumentUrl)}
                {renderDocLink('Final Document', agreement.finalDocumentUrl)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Handover Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Handover</h3>
        </div>
        <div className="p-4">
          {!possession ? (
            <p className="text-sm text-slate-500 italic">No handover details available.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {renderField('Status', possession.status?.replace(/_/g, ' '))}
                {renderField('Scheduled Date', possession.scheduledDate ? new Date(possession.scheduledDate).toLocaleDateString() : null)}
                {renderField('Parking Slot', possession.parkingSlotNumber)}
                {renderField('Electricity Meter', possession.electricityMeterNumber)}
                {renderField('Water Meter', possession.waterMeterNumber)}
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Checklist</p>
                  <div className="flex flex-col gap-1 text-sm font-medium">
                    <span className={possession.snagResolved ? 'text-emerald-600' : 'text-slate-400'}>
                      {possession.snagResolved ? '✓' : '○'} Snags Resolved
                    </span>
                    <span className={possession.keysHandedOver ? 'text-emerald-600' : 'text-slate-400'}>
                      {possession.keysHandedOver ? '✓' : '○'} Keys Handed Over
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                {renderDocLink('Occupancy Certificate', possession.occupancyCertUrl)}
                {renderDocLink('Completion Certificate', possession.completionCertUrl)}
                {renderDocLink('Handover Document', possession.handoverDocUrl)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
