'use client';

import React, { useState } from 'react';
import { Download, UploadCloud, CheckCircle2 } from 'lucide-react';

interface AudienceCsvUploaderProps {
  apiBaseUrl: string;
  csvFileName: string | null;
  csvRecipientsLength: number;
  handleFileUpload: (file: File) => void;
  saveCsvAsCrmLeads: boolean;
  onSaveCsvAsCrmLeadsChange: (val: boolean) => void;
}

export const AudienceCsvUploader: React.FC<AudienceCsvUploaderProps> = ({
  apiBaseUrl,
  csvFileName,
  csvRecipientsLength,
  handleFileUpload,
  saveCsvAsCrmLeads,
  onSaveCsvAsCrmLeadsChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-5 shadow-xs">
      {/* Header & Download Template Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
            Upload External Prospect List
          </h4>
          <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
            Upload CSV exports from property expos, 99acres/MagicBricks, or exhibitions.
          </p>
        </div>

        <a
          href={`${apiBaseUrl}/api/marketing/sample-csv`}
          download="sample_marketing_leads.csv"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--brand-600)] bg-purple-50 hover:bg-purple-100/70 rounded-xl border border-purple-200/80 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample CSV Template</span>
        </a>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? 'border-[var(--brand-500)] bg-purple-50/50 shadow-xs'
            : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-600)] mb-3 shadow-xs">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-xs font-bold text-[var(--text-primary)] mb-1">
          Drag & drop your CSV file here, or{' '}
          <label className="text-[var(--brand-600)] hover:underline cursor-pointer font-extrabold">
            browse file
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />
          </label>
        </p>
        <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
          Supported columns: Full Name, Email, Phone Number, City, Budget, Project, Temperature
        </p>

        {csvFileName && (
          <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Loaded: {csvFileName} ({csvRecipientsLength} rows detected)
            </span>
          </div>
        )}
      </div>

      {/* CRM Sync Toggle */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="saveCsvLeads"
            checked={saveCsvAsCrmLeads}
            onChange={(e) => onSaveCsvAsCrmLeadsChange(e.target.checked)}
            className="w-4 h-4 accent-[var(--brand-600)] rounded-sm"
          />
          <label htmlFor="saveCsvLeads" className="text-xs text-[var(--text-secondary)] cursor-pointer">
            <span className="font-extrabold text-[var(--text-primary)]">
              Also import contacts as permanent CRM Leads
            </span>
            <br />
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
              Automatically adds them to the main Lead Management database with source &apos;MARKETING_CSV_IMPORT&apos;.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
