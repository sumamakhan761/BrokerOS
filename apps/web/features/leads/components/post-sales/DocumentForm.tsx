import React, { useState } from "react";
import { Upload, Download, CheckCircle2, FileText } from "lucide-react";

interface DocumentFormProps {
  booking: any;
  saving: boolean;
  uploadDoc: (docType: string, file: File, description?: string) => void;
  userRole?: string;
}

export function DocumentForm({
  booking,
  saving,
  uploadDoc,
  userRole,
}: DocumentFormProps) {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const isReadOnly = userRole === "CHANNEL_PARTNER";

  const docTypes = [
    { key: "AADHAAR", label: "Aadhaar Card Copy" },
    { key: "PAN", label: "PAN Card Copy" },
    { key: "INCOME_DOCUMENT", label: "Income & Bank Proof" },
    { key: "OTHER", label: "Other Verification Documents" },
  ];

  return (
    <div className="space-y-3">
      {docTypes.map((doc) => {
        const existing = booking?.documents?.find(
          (d: any) => d.type === doc.key
        );

        return (
          <div
            key={doc.key}
            className="flex flex-col gap-2.5 p-3.5 border border-slate-200/80 rounded-xl hover:bg-slate-50/80 bg-white shadow-2xs transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    existing
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  {existing ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <FileText size={18} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)] m-0">
                    {doc.label}
                  </p>
                  {existing && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 m-0">
                      ✓ Document Verified & Stored
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {existing ? (
                  <a
                    href={existing.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-[0.96] press-effect cursor-pointer"
                  >
                    <Download size={13} />
                    <span>View File</span>
                  </a>
                ) : !isReadOnly ? (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-[0.96] press-effect">
                    <Upload size={13} />
                    <span>Upload Document</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          uploadDoc(
                            doc.key,
                            e.target.files[0],
                            descriptions[doc.key]
                          );
                      }}
                      disabled={saving}
                    />
                  </label>
                ) : null}
              </div>
            </div>

            {!existing && !isReadOnly && (
              <input
                type="text"
                placeholder={`Optional description or notes for ${doc.label}…`}
                value={descriptions[doc.key] || ""}
                onChange={(e) =>
                  setDescriptions({
                    ...descriptions,
                    [doc.key]: e.target.value,
                  })
                }
                className="w-full h-8 px-3 text-base sm:text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/15 transition-all text-[var(--text-primary)]"
              />
            )}

            {existing && existing.description && (
              <p className="text-xs text-[var(--text-muted)] italic px-1 m-0">
                Note: {existing.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
