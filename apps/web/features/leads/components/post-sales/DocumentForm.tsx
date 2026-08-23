import React, { useState } from 'react';
import { Upload, Download, CheckCircle2, FileText } from 'lucide-react';

interface DocumentFormProps {
  booking: any;
  saving: boolean;
  uploadDoc: (docType: string, file: File, description?: string) => void;
  userRole?: string;
}

export function DocumentForm({ booking, saving, uploadDoc, userRole }: DocumentFormProps) {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const docTypes = [
    { key: 'AADHAAR', label: 'Aadhaar Card' },
    { key: 'PAN', label: 'PAN Card' },
    { key: 'INCOME_DOCUMENT', label: 'Income Proof' },
    { key: 'OTHER', label: 'Other Docs' },
  ];

  return (
    <div className="space-y-4">
      {docTypes.map(doc => {
        const existing = booking?.documents?.find((d: any) => d.type === doc.key);
        return (
          <div key={doc.key} className="flex flex-col gap-2 p-4 border border-gray-100 rounded-xl hover:bg-gray-50/80 bg-white shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${existing ? 'bg-emerald-50/80 border-emerald-100/50 text-emerald-600' : 'bg-gray-50/80 border-gray-100/50 text-gray-400'}`}>
                  {existing ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <p className="text-sm font-semibold text-gray-900">{doc.label}</p>
              </div>
              <div className="flex items-center gap-2">
                {existing ? (
                  <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-lg font-bold transition-all">
                    <Download className="w-3.5 h-3.5" /> View
                  </a>
                ) : userRole !== 'CHANNEL_PARTNER' ? (
                  <label className="cursor-pointer flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-1.5 rounded-lg font-bold transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadDoc(doc.key, e.target.files[0], descriptions[doc.key]); }} disabled={saving} />
                  </label>
                ) : null}
              </div>
            </div>
            {!existing && userRole !== 'CHANNEL_PARTNER' && (
              <input type="text" placeholder={`Add description for ${doc.label}...`} value={descriptions[doc.key] || ''} onChange={e => setDescriptions({ ...descriptions, [doc.key]: e.target.value })} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder:text-gray-400 mt-1" />
            )}
            {existing && existing.description && (
              <p className="text-xs text-gray-500 italic px-1 mt-1">{existing.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
