'use client';

// ============================================================================
// BrokerOS — WhatsApp Contacts CSV Import Modal
// ============================================================================

import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Table,
  ArrowRight,
} from 'lucide-react';

interface ImportContactsModalProps {
  open: boolean;
  onClose: () => void;
  accountId?: string;
  onImportSuccess: (count: number) => void;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  open,
  onClose,
  accountId,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

  // Column Mappings
  const [phoneCol, setPhoneCol] = useState<string>('');
  const [nameCol, setNameCol] = useState<string>('');
  const [emailCol, setEmailCol] = useState<string>('');
  const [companyCol, setCompanyCol] = useState<string>('');
  const [tagsCol, setTagsCol] = useState<string>('');

  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    parseCsv(selected);
  };

  const parseCsv = (csvFile: File) => {
    setFile(csvFile);
    setError(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setError('CSV file must have a header row and at least one contact row.');
        return;
      }

      const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      setHeaders(rawHeaders);

      // Auto-detect common column headers
      const lower = rawHeaders.map((h) => h.toLowerCase());
      const pIdx = lower.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('whatsapp') || h.includes('tel'));
      if (pIdx >= 0) setPhoneCol(rawHeaders[pIdx]);

      const nIdx = lower.findIndex((h) => h.includes('name') || h.includes('contact') || h.includes('full'));
      if (nIdx >= 0) setNameCol(rawHeaders[nIdx]);

      const eIdx = lower.findIndex((h) => h.includes('email') || h.includes('mail'));
      if (eIdx >= 0) setEmailCol(rawHeaders[eIdx]);

      const cIdx = lower.findIndex((h) => h.includes('company') || h.includes('org') || h.includes('business'));
      if (cIdx >= 0) setCompanyCol(rawHeaders[cIdx]);

      const tIdx = lower.findIndex((h) => h.includes('tag') || h.includes('group') || h.includes('label'));
      if (tIdx >= 0) setTagsCol(rawHeaders[tIdx]);

      const parsedRows = lines.slice(1, 10).map((line) =>
        line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, '')),
      );
      setRows(parsedRows);
    };

    reader.readAsText(csvFile);
  };

  const handleExecuteImport = async () => {
    if (!file || !phoneCol) {
      setError('Please select which column represents the Phone Number.');
      return;
    }

    try {
      setImporting(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));

          const pIdx = rawHeaders.indexOf(phoneCol);
          const nIdx = nameCol ? rawHeaders.indexOf(nameCol) : -1;
          const eIdx = emailCol ? rawHeaders.indexOf(emailCol) : -1;
          const cIdx = companyCol ? rawHeaders.indexOf(companyCol) : -1;
          const tIdx = tagsCol ? rawHeaders.indexOf(tagsCol) : -1;

          const contactsToImport = lines.slice(1).map((line) => {
            const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
            const phone = cols[pIdx] || '';
            const name = nIdx >= 0 ? cols[nIdx] : undefined;
            const email = eIdx >= 0 ? cols[eIdx] : undefined;
            const company = cIdx >= 0 ? cols[cIdx] : undefined;
            const tags = tIdx >= 0 && cols[tIdx] ? cols[tIdx].split(';').map((t) => t.trim()) : undefined;

            return { phone, name, email, company, tags };
          }).filter((c) => c.phone.length >= 6);

          const query = accountId ? `?accountId=${accountId}` : '';
          const res = await fetch(`${baseUrl}/api/marketing/whatsapp/contacts/bulk-import${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contacts: contactsToImport }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to import contacts');
          }

          const result = await res.json();
          setSuccessCount(result.imported || contactsToImport.length);
          onImportSuccess(result.imported || contactsToImport.length);
        } catch (subErr: any) {
          setError(subErr?.message || 'Failed to complete import');
        } finally {
          setImporting(false);
        }
      };

      reader.readAsText(file);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse file');
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">
                Import WhatsApp Contacts from CSV
              </h3>
              <p className="text-[11px] text-text-tertiary">
                Bulk upload customer numbers and map contact tags
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success banner */}
        {successCount !== null && (
          <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Successfully imported {successCount} contacts into WhatsApp CRM!</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
              file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-border-default hover:border-brand-500 bg-bg-base/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileText className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-emerald-500' : 'text-text-tertiary'}`} />
            {file ? (
              <div>
                <p className="text-xs font-semibold text-text-primary">{file.name}</p>
                <p className="text-[11px] text-text-tertiary">
                  {(file.size / 1024).toFixed(1)} KB — Click to choose different file
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-text-primary">
                  Click to select CSV file
                </p>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  CSV must include phone numbers with country code
                </p>
              </div>
            )}
          </div>

          {/* Column Mapping Section */}
          {headers.length > 0 && (
            <div className="space-y-3 bg-bg-base p-4 rounded-xl border border-border-default">
              <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-brand-600" />
                <span>Map CSV Columns</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Phone Column <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={phoneCol}
                    onChange={(e) => setPhoneCol(e.target.value)}
                    className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-lg text-xs"
                  >
                    <option value="">Select phone column...</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Name Column
                  </label>
                  <select
                    value={nameCol}
                    onChange={(e) => setNameCol(e.target.value)}
                    className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-lg text-xs"
                  >
                    <option value="">None / Ignored</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Email Column
                  </label>
                  <select
                    value={emailCol}
                    onChange={(e) => setEmailCol(e.target.value)}
                    className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-lg text-xs"
                  >
                    <option value="">None / Ignored</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Tags Column (semi-colon separated)
                  </label>
                  <select
                    value={tagsCol}
                    onChange={(e) => setTagsCol(e.target.value)}
                    className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded-lg text-xs"
                  >
                    <option value="">None / Ignored</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sample Rows Preview */}
          {rows.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-text-tertiary mb-1.5">
                Preview (First {rows.length} rows):
              </p>
              <div className="overflow-x-auto border border-border-default rounded-xl max-h-36">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-bg-subtle text-text-secondary">
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="px-3 py-1.5 whitespace-nowrap font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-bg-surface">
                    {rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((val, j) => (
                          <td key={j} className="px-3 py-1.5 whitespace-nowrap text-text-primary">
                            {val || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-default bg-bg-surface">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:bg-bg-subtle border border-border-default transition-colors"
          >
            {successCount !== null ? 'Close' : 'Cancel'}
          </button>
          {successCount === null && (
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!file || !phoneCol || importing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              {importing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <span>Execute Import</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
