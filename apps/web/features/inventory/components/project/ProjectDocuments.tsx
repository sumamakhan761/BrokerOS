"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function ProjectDocuments({
  projectId,
  towerId,
  towers,
  readOnly = false,
}: {
  projectId: string;
  towerId?: string;
  towers: any[];
  readOnly?: boolean;
}) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [selectedTowerId, setSelectedTowerId] = useState(towerId || "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("BROCHURE");
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${baseUrl}/api/inventory/projects/${projectId}/documents${
          selectedTowerId ? `?towerId=${selectedTowerId}` : ""
        }`
      );
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [projectId, selectedTowerId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("isPublic", String(isPublic));
      if (selectedTowerId) formData.append("towerId", selectedTowerId);

      const res = await fetch(
        `${baseUrl}/api/inventory/projects/${projectId}/documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        toast.success("Document uploaded successfully");
        setFile(null);
        setTitle("");
        fetchDocs();
      } else {
        toast.error("Upload failed.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${baseUrl}/api/inventory/projects/${projectId}/documents/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Document removed");
        fetchDocs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col ${
        readOnly ? "" : "md:flex-row"
      } gap-8 animate-enter`}
    >
      {/* Upload Form */}
      {!readOnly && (
        <div className="w-full md:w-1/3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <UploadCloud size={15} />
            </div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-tight m-0">
              Upload Project Media
            </h3>
          </div>

          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Document Title *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Master Brochure 2026"
                className="w-full h-8 px-3 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Category
              </label>
              <select
                className="w-full h-8 px-3 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="BROCHURE">Brochure</option>
                <option value="FLOOR_PLAN">Floor Plan</option>
                <option value="PRICE_SHEET">Price Sheet</option>
                <option value="LEGAL">Legal Document</option>
                <option value="CONSTRUCTION_UPDATE">Construction Update</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Tower Scope (Optional)
              </label>
              <select
                className="w-full h-8 px-3 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
                value={selectedTowerId}
                onChange={(e) => setSelectedTowerId(e.target.value)}
              >
                <option value="">All Towers (Project-wide)</option>
                {towers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <label
                htmlFor="isPublic"
                className="text-xs font-bold text-[var(--text-primary)] cursor-pointer"
              >
                Visible to Sales Executives
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Select File
              </label>
              <input
                required
                type="file"
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-[var(--brand-700)] hover:file:bg-purple-100 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file || !title.trim()}
              className="w-full py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <UploadCloud size={14} />
              )}
              <span>{uploading ? "Uploading…" : "Upload Document"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Document List */}
      <div className={`w-full ${readOnly ? "" : "md:w-2/3"}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Document Vault
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-200 border-t-[var(--brand-600)] rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[var(--text-secondary)] m-0">
              No documents uploaded yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3.5 p-4 border border-slate-200/80 rounded-2xl hover:shadow-md transition-shadow bg-white shadow-2xs"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    doc.isPublic
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-purple-50 text-[var(--brand-700)] border-purple-200"
                  }`}
                >
                  <FileText size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className="font-bold text-xs text-[var(--text-primary)] truncate m-0"
                    title={doc.title}
                  >
                    {doc.title}
                  </h4>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] bg-slate-100 px-2 py-0.5 rounded-full">
                      {doc.category.replace("_", " ")}
                    </span>
                    {doc.isPublic ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <ShieldCheck size={11} /> Public
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-muted)]">
                        <ShieldAlert size={11} /> Private
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[var(--brand-700)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink size={11} />
                    </a>
                    {!readOnly && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-xs font-bold text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
