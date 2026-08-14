"use client";

import React, { useState } from 'react';
import { Save, X, Building, MapPin } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isCpProject?: boolean;
}

export default function NewProjectModal({ isOpen, onClose, onSuccess, isCpProject = false }: NewProjectModalProps) {
  const [form, setForm] = useState({
    name: '',
    builderName: '',
    type: 'RESIDENTIAL',
    city: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/inventory/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isCpProject })
      });
      if (!res.ok) throw new Error("Failed to create project");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to create project");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">New Project</h2>
              <p className="text-sm text-slate-500">Create a new real estate project.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name *</label>
              <input 
                required
                type="text" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Skyline Towers"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Builder Name *</label>
                <input 
                  required
                  type="text" 
                  value={form.builderName}
                  onChange={e => setForm({ ...form, builderName: e.target.value })}
                  placeholder="e.g. DLF Group"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Type</label>
                <select 
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="MIXED">Mixed Use</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
              <textarea 
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Full site address..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="project-form"
            disabled={isSaving || !form.name.trim() || !form.builderName.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
