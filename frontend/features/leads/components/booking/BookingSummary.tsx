import React, { useState } from 'react';
import { FileText, Download, Upload, CheckCircle, Landmark, XCircle, FileCheck, Send } from 'lucide-react';
import { toast } from 'sonner';

const DOC_TYPES = [
  { key: 'AADHAAR', label: 'Aadhaar Card' },
  { key: 'PAN', label: 'PAN Card' },
  { key: 'PASSPORT_PHOTO', label: 'Passport Photo' },
  { key: 'BOOKING_FORM', label: 'Signed Booking Form' },
  { key: 'INCOME_DOCUMENT', label: 'Income Proof (optional)' },
  { key: 'OTHER', label: 'Other Document' },
];

interface BookingData {
  id: string;
  unitDescription?: string;
  agreedPrice?: number;
  bookingAmount?: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  paymentMode?: string;
  transactionRef?: string;
  loanRequired?: boolean;
  remarks?: string;
  documents: { type: string; fileUrl: string; title: string }[];
  status: string;
  createdAt: string;
}

interface BookingSummaryProps {
  booking: BookingData;
  leadId: string;
  onRefresh: () => void;
  onEdit?: () => void;
  userRole?: string;
}

export function BookingSummary({ booking, leadId, onRefresh, onEdit, userRole }: BookingSummaryProps) {
  const [saving, setSaving] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !booking) return;

    setUploadingType(docType);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);
      formData.append('bookingId', booking.id);

      await fetch(`${apiUrl}/api/leads/${leadId}/booking/documents`, {
        method: 'POST',
        body: formData,
      });
      onRefresh();
    } finally {
      setUploadingType(null);
    }
  };

  const handleRequestApproval = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Booking Approval: Lead`,
          description: `Please approve the booking. Agreed Price: ₹${booking.agreedPrice}, Booking Amount: ₹${booking.bookingAmount}`,
          type: 'BOOKING',
          bookingId: booking.id,
        }),
      });
      
      if (!res.ok) {
        toast.error('Failed to send approval request');
        return;
      }
      
      toast.success('Booking approval request sent to manager.');
      onRefresh();
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsDone = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/booking/done`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      
      if (!res.ok) {
        toast.error('Failed to mark booking as done');
        return;
      }
      
      toast.success('Booking marked as done.');
      onRefresh();
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl ${booking.status === 'CONFIRMED' ? 'bg-emerald-50/80 border border-emerald-100/50' : 'bg-amber-50/80 border border-amber-100/50'} flex items-center justify-center`}>
          {booking.status === 'CONFIRMED' ? (
            <CheckCircle className="w-5.5 h-5.5 text-emerald-600" />
          ) : (
            <FileText className="w-5.5 h-5.5 text-amber-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {booking.status === 'CONFIRMED' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-100/50 px-2.5 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Booking Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-wider uppercase text-amber-700 bg-amber-100/50 px-2.5 py-0.5 rounded-full">
                Documentation Pending
              </span>
            )}
          </div>
        </div>
        {booking.status !== 'CONFIRMED' && userRole !== 'CHANNEL_PARTNER' && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                disabled={saving}
                className="text-xs bg-white text-gray-700 border border-gray-300 px-3 py-2 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                Edit Booking
              </button>
            )}
            {userRole === 'CLOSING_MANAGER' ? (
              <button
                onClick={handleMarkAsDone}
                disabled={saving}
                className="text-xs bg-emerald-600 text-white px-3 py-2 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                {saving ? 'Saving...' : <><CheckCircle className="w-3.5 h-3.5" /> Mark as Done</>}
              </button>
            ) : (
              <button
                onClick={handleRequestApproval}
                disabled={saving}
                className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                {saving ? 'Sending...' : <><Send className="w-3.5 h-3.5" /> Send for Approval</>}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4">
          {booking.unitDescription && (
            <div className="col-span-2 bg-gray-50/80 rounded-xl p-4 border border-gray-100/50">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Unit</p>
              <p className="text-sm font-semibold text-gray-900">{booking.unitDescription}</p>
            </div>
          )}
          {booking.agreedPrice && (
            <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-100/50">
              <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold mb-1">Agreed Price</p>
              <p className="text-xl font-bold text-emerald-900">₹{Number(booking.agreedPrice).toLocaleString('en-IN')}</p>
            </div>
          )}
          {booking.bookingAmount && (
            <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100/50">
              <p className="text-[11px] uppercase tracking-wider text-blue-700 font-bold mb-1">Booking Amount</p>
              <p className="text-xl font-bold text-blue-900">₹{Number(booking.bookingAmount).toLocaleString('en-IN')}</p>
            </div>
          )}
          {booking.commissionPercentage && (
            <div className="bg-purple-50/80 rounded-xl p-4 border border-purple-100/50">
              <p className="text-[11px] uppercase tracking-wider text-purple-700 font-bold mb-1">Commission</p>
              <p className="text-xl font-bold text-purple-900">{booking.commissionPercentage}% <span className="text-sm font-medium text-purple-600 ml-1">(₹{Number(booking.commissionAmount).toLocaleString('en-IN')})</span></p>
            </div>
          )}
          {booking.paymentMode && (
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100/50">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Payment Mode</p>
              <p className="text-sm font-semibold text-gray-900">{booking.paymentMode}</p>
            </div>
          )}
          {booking.transactionRef && (
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100/50">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Reference</p>
              <p className="text-sm font-semibold text-gray-900">{booking.transactionRef}</p>
            </div>
          )}
          {booking.loanRequired !== undefined && (
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100/50 flex flex-col justify-center">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Home Loan</p>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                {booking.loanRequired ? (
                  <><Landmark className="w-4 h-4 text-amber-600" /> Required</>
                ) : (
                  <><XCircle className="w-4 h-4 text-gray-400" /> Not Required</>
                )}
              </p>
            </div>
          )}
        </div>

        {booking.remarks && (
          <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-100/50">
            <p className="text-[11px] uppercase tracking-wider text-amber-700 font-bold mb-1">Remarks</p>
            <p className="text-sm text-amber-900 leading-relaxed">{booking.remarks}</p>
          </div>
        )}

        {/* Documents Section */}
        <div className="pt-2">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileCheck className="w-4.5 h-4.5 text-gray-400" /> Required Documents
          </h4>
          <div className="space-y-3">
            {DOC_TYPES.map(doc => {
              const existing = booking.documents?.find(d => d.type === doc.key);
              return (
                <div key={doc.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/80 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${existing ? 'bg-emerald-50 border-emerald-100/50' : 'bg-gray-50 border-gray-200'}`}>
                      {existing ? <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> : <FileText className="w-4.5 h-4.5 text-gray-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{doc.label}</p>
                      {existing && <p className="text-xs text-gray-500 font-medium mt-0.5">{existing.title || 'Document'}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {existing ? (
                      <a
                        href={existing.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium px-2 py-2 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        View File
                      </a>
                    ) : userRole !== 'CHANNEL_PARTNER' ? (
                      <label className="cursor-pointer flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium px-4 py-2 rounded-lg transition-all">
                        <Upload className="w-4 h-4" />
                        {uploadingType === doc.key ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => handleDocumentUpload(e, doc.key)}
                          disabled={uploadingType !== null}
                        />
                      </label>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

