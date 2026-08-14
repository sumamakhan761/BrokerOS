"use client";

import React, { useState } from 'react';
import { Bot, Send, Loader2, RefreshCcw, Save } from 'lucide-react';
import { UnitGrid } from '@/features/inventory/components/units/UnitGrid';
import { UnitDetailsDrawer } from '@/features/inventory/components/units/UnitDetailsDrawer';

interface AiTowerGeneratorProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AiTowerGenerator({ projectId, onSuccess, onCancel }: AiTowerGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  // For manual editing of AI generated units before saving
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/inventory/projects/${projectId}/towers/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) throw new Error("AI Generation failed");
      const data = await res.json();
      setGeneratedData(data);
    } catch (err: any) {
      alert(err?.message || "Failed to generate tower");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData) return;
    try {
      setIsSaving(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/inventory/projects/${projectId}/towers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedData)
      });

      if (!res.ok) throw new Error("Failed to save generated tower");
      onSuccess();
    } catch (err: any) {
      alert(err?.message || "Failed to save tower");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualUnitUpdate = async (unitId: string, updates: any) => {
    // In preview mode, unitId is usually undefined or just index based since it's not saved yet.
    // We update the local generatedData state.
    setGeneratedData((prev: any) => {
      const newData = { ...prev };
      for (const floor of newData.floors) {
        const unitIndex = floor.units.findIndex((u: any) => (u.id || u.unitNumber) === unitId);
        if (unitIndex !== -1) {
          floor.units[unitIndex] = { ...floor.units[unitIndex], ...updates };
        }
      }
      return newData;
    });
    setSelectedUnit(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[80vh] max-h-[800px] w-full max-w-3xl mx-auto">
      <div className="p-6 border-b border-slate-100 bg-indigo-50/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Tower Generator</h2>
            <p className="text-sm text-slate-500">Describe the tower structure naturally.</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-medium text-sm">
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {!generatedData ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Bot className="w-16 h-16 text-slate-300" />
            <div className="max-w-sm">
              <h3 className="text-slate-700 font-medium mb-2">Try saying something like:</h3>
              <p className="text-sm text-slate-500 italic bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                "Create a 10 floor tower named Tower B. The ground floor has 4 shops at $200k base price. Floors 2 through 10 have two 2BHKs and two 3BHKs facing East."
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Preview: {generatedData.name}</h3>
              <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">Draft Mode</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">You can click any unit below to manually edit its properties before saving.</p>

            <UnitGrid
              tower={generatedData}
              onUnitClick={(unit) => setSelectedUnit(unit)}
            />
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        {generatedData && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setGeneratedData(null)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCcw className="w-4 h-4" /> Start Over
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Finalize & Save Tower
            </button>
          </div>
        )}

        <form onSubmit={handleGenerate} className="flex gap-2 relative">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={generatedData ? "Refine the generated tower..." : "Describe the tower..."}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
            disabled={isGenerating || isSaving}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating || isSaving}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {selectedUnit && (
        <UnitDetailsDrawer
          unit={selectedUnit}
          isOpen={!!selectedUnit}
          onClose={() => setSelectedUnit(null)}
          onSave={handleManualUnitUpdate}
        />
      )}
    </div>
  );
}
