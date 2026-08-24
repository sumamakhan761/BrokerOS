"use client";

import React, { useState } from "react";
import { Bot, Send, Loader2, RefreshCcw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { UnitGrid } from "@/features/inventory/components/units/UnitGrid";
import { UnitDetailsDrawer } from "@/features/inventory/components/units/UnitDetailsDrawer";

interface AiTowerGeneratorProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AiTowerGenerator({
  projectId,
  onSuccess,
  onCancel,
}: AiTowerGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${baseUrl}/api/inventory/projects/${projectId}/towers/ai-generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!res.ok) throw new Error("AI Generation failed");
      const data = await res.json();
      setGeneratedData(data);
      toast.success("Tower structure generated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate tower");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData) return;
    try {
      setIsSaving(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${baseUrl}/api/inventory/projects/${projectId}/towers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(generatedData),
        }
      );

      if (!res.ok) throw new Error("Failed to save generated tower");
      toast.success("Tower saved to project inventory");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save tower");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualUnitUpdate = async (unitId: string, updates: any) => {
    setGeneratedData((prev: any) => {
      const newData = { ...prev };
      for (const floor of newData.floors) {
        const unitIndex = floor.units.findIndex(
          (u: any) => (u.id || u.unitNumber) === unitId
        );
        if (unitIndex !== -1) {
          floor.units[unitIndex] = { ...floor.units[unitIndex], ...updates };
        }
      }
      return newData;
    });
    setSelectedUnit(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col h-[85vh] max-h-[800px] w-full max-w-4xl mx-auto animate-enter">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <Bot size={16} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              AI Tower Generator
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
              Describe the architectural tower configuration in plain English
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body / Preview */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
        {!generatedData ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] border border-purple-200 shadow-2xs">
              <Bot size={28} />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
                Example Generation Prompt
              </h3>
              <p className="text-xs text-[var(--text-secondary)] italic bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs leading-relaxed m-0">
                &ldquo;Create a 12 floor tower named Tower Horizon. Ground floor has 4 retail shops at ₹25L base price. Floors 2 through 12 have three 2BHKs and one 3BHK facing East at ₹85L base price with 2% brokerage.&rdquo;
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] m-0">
                  Preview: {generatedData.name}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 m-0 font-medium">
                  {generatedData.floors?.length || 0} floors generated • Click any unit to tweak parameters
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full uppercase tracking-wider">
                Draft Preview
              </span>
            </div>

            <UnitGrid
              tower={generatedData}
              onUnitClick={(unit) => setSelectedUnit(unit)}
            />
          </div>
        )}
      </div>

      {/* Input & Action Bar */}
      <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
        {generatedData && (
          <div className="flex gap-2.5">
            <button
              onClick={() => setGeneratedData(null)}
              className="flex-1 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all active:scale-[0.96] press-effect flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw size={13} />
              <span>Start Over</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all active:scale-[0.96] press-effect shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              <span>Finalize & Save Tower</span>
            </button>
          </div>
        )}

        <form onSubmit={handleGenerate} className="flex gap-2 relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              generatedData
                ? "Refine tower structure..."
                : "Type instructions to generate tower floors and units..."
            }
            className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 pr-10 text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:bg-white focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
            disabled={isGenerating || isSaving}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating || isSaving}
            className="absolute right-1.5 top-1.5 w-7 h-7 bg-[var(--brand-600)] text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--brand-700)] transition-all flex items-center justify-center cursor-pointer shadow-2xs"
          >
            {isGenerating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
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
