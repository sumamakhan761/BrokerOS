import React, { useRef, useState } from "react";
import { Upload, Users, Shuffle, CheckSquare, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

interface NewLeadsToolbarProps {
  selectedLeadIds: Set<string>;
  subordinates: any[];
  onAssign: (leadIds: string[], targetUserId?: string, roundRobin?: boolean) => void;
  onUploadSuccess: () => void;
}

export function NewLeadsToolbar({
  selectedLeadIds,
  subordinates,
  onAssign,
  onUploadSuccess,
}: NewLeadsToolbarProps) {
  const [bulkAssignTarget, setBulkAssignTarget] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
          const res = await fetch(`${baseUrl}/api/leads/bulk-create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              results.data.map((row: any) => ({
                firstName: row["First Name"] || row["FirstName"] || row["Name"],
                lastName: row["Last Name"] || row["LastName"],
                phone: row["Phone"] || row["Mobile"],
                email: row["Email"],
                source: row["Source"] || row["Source Name"],
                project: row["Project"] || row["Interested Project"],
                preferredLocation: row["Preferred Location"] || row["Location"],
                budget: row["Budget"],
                requirements: row["Requirements"],
              }))
            ),
          });

          if (res.ok) {
            toast.success("Leads uploaded successfully");
            onUploadSuccess();
          } else {
            toast.error("Failed to upload leads.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error uploading leads.");
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
    });
  };

  const numSelected = selectedLeadIds.size;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
      {/* Left: Selection & Bulk Assignment */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {numSelected > 0 ? (
          <div className="flex items-center gap-2.5 bg-purple-50/80 border border-purple-200/80 rounded-xl p-1.5 px-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-700)] tabular-nums">
              <CheckSquare size={14} /> {numSelected} selected
            </span>

            {/* Select Employee Dropdown */}
            <div className="relative min-w-[150px]">
              <Users
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={bulkAssignTarget}
                onChange={(e) => setBulkAssignTarget(e.target.value)}
                className="w-full h-8 ps-7 pe-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer appearance-none"
              >
                <option value="">Select executive…</option>
                {subordinates.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name || sub.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign Button */}
            <button
              onClick={() => onAssign(Array.from(selectedLeadIds), bulkAssignTarget)}
              disabled={!bulkAssignTarget}
              className="h-8 px-3.5 rounded-lg bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.96] press-effect shadow-xs cursor-pointer"
            >
              Assign
            </button>

            <div className="w-px h-5 bg-purple-200" />

            {/* Round Robin Button */}
            <button
              onClick={() => onAssign(Array.from(selectedLeadIds), undefined, true)}
              className="h-8 px-3.5 rounded-lg bg-[var(--brand-700)] hover:bg-[var(--brand-800)] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 active:scale-[0.96] press-effect shadow-xs cursor-pointer"
            >
              <Shuffle size={12} />
              <span>Round Robin</span>
            </button>
          </div>
        ) : (
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            Select checkboxes below to bulk-assign leads
          </span>
        )}
      </div>

      {/* Right: CSV Upload */}
      <div>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:shadow-lg disabled:opacity-50 active:scale-[0.96] press-effect cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Uploading CSV…</span>
            </>
          ) : (
            <>
              <Upload size={13} />
              <span>Upload Leads CSV</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
