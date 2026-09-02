"use client";

import React from "react";
import { Zap } from "lucide-react";

export interface StudioVapiSettingsProps {
  transcriberModel?: string;
  transcriberLanguage?: string;
  voiceSpeed?: number;
  maxTurnSilenceMs?: number;
  backgroundSound?: "off" | "office";
  voicemailDetection?: "off" | "machine_detection";
  maxDurationSeconds?: number;
  onChange: (fields: {
    transcriberModel?: string;
    transcriberLanguage?: string;
    voiceSpeed?: number;
    maxTurnSilenceMs?: number;
    backgroundSound?: "off" | "office";
    voicemailDetection?: "off" | "machine_detection";
    maxDurationSeconds?: number;
  }) => void;
}

export function StudioVapiSettings({
  transcriberModel = "nova-3",
  transcriberLanguage = "en",
  voiceSpeed = 1.0,
  maxTurnSilenceMs = 400,
  backgroundSound = "off",
  voicemailDetection = "off",
  maxDurationSeconds = 600,
  onChange,
}: StudioVapiSettingsProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div>
        <h4 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Vapi Real-Time Speech & Transcriber Studio</span>
        </h4>
        <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
          Fine-tune transcription language, speech-to-text latency, and background ambient office realism.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Transcriber Model */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">Speech-to-Text Engine</label>
          <select
            value={transcriberModel}
            onChange={(e) => onChange({ transcriberModel: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="nova-3">Deepgram Nova-3 (Ultra Accuracy)</option>
            <option value="universal-3-5-pro">AssemblyAI 3.5 Pro (Conversational)</option>
            <option value="flux-general-multi">Deepgram Flux (Multilingual)</option>
            <option value="whisper">OpenAI Whisper (Standard)</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">Transcriber Language</label>
          <select
            value={transcriberLanguage}
            onChange={(e) => onChange({ transcriberLanguage: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="en">English (US / India Global)</option>
            <option value="hi">Hindi (hi-IN / Hinglish)</option>
            <option value="multi">Multilingual (Auto-Detect)</option>
          </select>
        </div>

        {/* Speaking Speed */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-slate-700">Voice Speed</label>
            <span className="text-[10px] font-mono font-bold text-indigo-600">{voiceSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.05"
            value={voiceSpeed}
            onChange={(e) => onChange({ voiceSpeed: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-100 rounded-lg accent-indigo-600 cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>Calm (0.8x)</span>
            <span>Normal</span>
            <span>Fast (1.2x)</span>
          </div>
        </div>

        {/* Silence Turn Threshold */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-slate-700">Turn Silence Delay</label>
            <span className="text-[10px] font-mono font-bold text-indigo-600">{maxTurnSilenceMs} ms</span>
          </div>
          <input
            type="range"
            min="200"
            max="800"
            step="50"
            value={maxTurnSilenceMs}
            onChange={(e) => onChange({ maxTurnSilenceMs: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-100 rounded-lg accent-indigo-600 cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>Snappy (200ms)</span>
            <span>400ms</span>
            <span>Patient (800ms)</span>
          </div>
        </div>
      </div>

      {/* Realism Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        {/* Background Ambience */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-800">Office Ambient Sound</p>
            <p className="text-[10px] text-slate-400">Realistic sales floor background</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ backgroundSound: backgroundSound === "office" ? "off" : "office" })}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
              backgroundSound === "office"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {backgroundSound === "office" ? "Active (Office)" : "Off"}
          </button>
        </div>

        {/* Voicemail Detection */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-800">Voicemail Auto-Hangup</p>
            <p className="text-[10px] text-slate-400">Don&apos;t burn minutes on machines</p>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                voicemailDetection: voicemailDetection === "machine_detection" ? "off" : "machine_detection",
              })
            }
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
              voicemailDetection === "machine_detection"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {voicemailDetection === "machine_detection" ? "Enabled" : "Off"}
          </button>
        </div>

        {/* Call Timeout */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-800">Max Call Duration</p>
            <p className="text-[10px] text-slate-400">Automatic safety limit</p>
          </div>
          <select
            value={maxDurationSeconds}
            onChange={(e) => onChange({ maxDurationSeconds: parseInt(e.target.value) })}
            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value={300}>5 Mins</option>
            <option value={600}>10 Mins</option>
            <option value={900}>15 Mins</option>
          </select>
        </div>
      </div>
    </div>
  );
}
