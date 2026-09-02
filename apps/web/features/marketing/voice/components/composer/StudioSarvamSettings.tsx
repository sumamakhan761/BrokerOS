"use client";

import React from "react";
import { Zap } from "lucide-react";

export interface StudioSarvamSettingsProps {
  languageCode?: string;
  voiceSpeed?: number;
  maxDurationSeconds?: number;
  onChange: (fields: {
    languageCode?: string;
    voiceSpeed?: number;
    maxDurationSeconds?: number;
  }) => void;
}

export function StudioSarvamSettings({
  languageCode = "hi-IN",
  voiceSpeed = 1.0,
  maxDurationSeconds = 600,
  onChange,
}: StudioSarvamSettingsProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div>
        <h4 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sarvam AI Indic Neural TTS Studio (Bulbul v3)</span>
        </h4>
        <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
          Configure native Indic multilingual dialects, conversational pace, and call limits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Indic Language Code */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">Indic Language / Dialect</label>
          <select
            value={languageCode}
            onChange={(e) => onChange({ languageCode: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="hi-IN">Hindi (hi-IN / Hinglish)</option>
            <option value="en-IN">Indian English (en-IN)</option>
            <option value="mr-IN">Marathi (mr-IN)</option>
            <option value="ta-IN">Tamil (ta-IN)</option>
            <option value="te-IN">Telugu (te-IN)</option>
            <option value="kn-IN">Kannada (kn-IN)</option>
            <option value="gu-IN">Gujarati (gu-IN)</option>
            <option value="bn-IN">Bengali (bn-IN)</option>
            <option value="pa-IN">Punjabi (pa-IN)</option>
            <option value="ml-IN">Malayalam (ml-IN)</option>
            <option value="or-IN">Odia (or-IN)</option>
          </select>
        </div>

        {/* Speaking Pace */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-slate-700">Voice Pace</label>
            <span className="text-[10px] font-mono font-bold text-emerald-600">{voiceSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.3"
            step="0.05"
            value={voiceSpeed}
            onChange={(e) => onChange({ voiceSpeed: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-100 rounded-lg accent-emerald-600 cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>Relaxed (0.7x)</span>
            <span>1.0x</span>
            <span>Fast (1.3x)</span>
          </div>
        </div>

        {/* Max Call Duration */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">Max Call Duration</label>
          <select
            value={maxDurationSeconds}
            onChange={(e) => onChange({ maxDurationSeconds: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value={300}>5 Mins</option>
            <option value={600}>10 Mins</option>
            <option value={900}>15 Mins</option>
            <option value={1800}>30 Mins</option>
          </select>
        </div>
      </div>
    </div>
  );
}
