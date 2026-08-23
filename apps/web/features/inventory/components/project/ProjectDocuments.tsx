"use client";

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { toast } from 'sonner';

export function ProjectDocuments({ projectId, towerId, towers, readOnly = false }: { projectId: string; towerId?: string; towers: any[], readOnly?: boolean }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { data: session } = authClient.useSession();

  const [selectedTowerId, setSelectedTowerId] = useState(towerId || "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("BROCHURE");
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/inventory/projects/${projectId}/documents${selectedTowerId ? `?towerId=${selectedTowerId}` : ''}`);
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
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('isPublic', String(isPublic));
      if (selectedTowerId) formData.append('towerId', selectedTowerId);

      const res = await fetch(`${baseUrl}/api/inventory/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
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
      const res = await fetch(`${baseUrl}/api/inventory/projects/${projectId}/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDocs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col ${readOnly ? '' : 'md:flex-row'} gap-8`}>
      {/* Upload Form */}
      {!readOnly && (
      <div className="w-full md:w-1/3 bg-slate-50 p-6 rounded-xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <UploadCloud className="w-5 h-5 text-indigo-600" />
          Upload Document
        </h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              required type="text" 
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
              value={title} onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={category} onChange={e => setCategory(e.target.value)}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Tower (Optional)</label>
            <select 
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedTowerId} onChange={e => setSelectedTowerId(e.target.value)}
            >
              <option value="">All Towers (Project Level)</option>
              {towers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" id="isPublic"
              checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPublic" className="text-sm font-medium text-slate-700">Make visible to Sales Executives</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
            <input 
              required type="file" 
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button 
            type="submit" 
            disabled={uploading || !file}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>
      )}

      {/* Document List */}
      <div className={`w-full ${readOnly ? '' : 'md:w-2/3'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Document Vault</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                <div className={`p-3 rounded-lg ${doc.isPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate" title={doc.title}>{doc.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{doc.category.replace('_', ' ')}</span>
                    {doc.isPublic ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase"><ShieldCheck className="w-3 h-3"/> Public</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><ShieldAlert className="w-3 h-3"/> Private</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                    {!readOnly && (
                    <button onClick={() => handleDelete(doc.id)} className="text-sm font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
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
