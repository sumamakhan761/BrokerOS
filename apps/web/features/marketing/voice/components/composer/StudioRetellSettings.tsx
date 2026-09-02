"use client";

import React from "react";
import { Zap } from "lucide-react";

export interface StudioRetellSettingsProps {
  retellVoiceModel?: string;
  retellEmotion?: string;
  retellLanguage?: string;
  voiceSpeed?: number;
  retellAmbientSound?: string;
  retellBackchannel?: boolean;
  retellReminderMs?: number;
  maxDurationSeconds?: number;
  onChange: (fields: {
    retellVoiceModel?: string;
    retellEmotion?: string;
    retellLanguage?: string;
    voiceSpeed?: number;
    retellAmbientSound?: string;
    retellBackchannel?: boolean;
    retellReminderMs?: number;
    maxDurationSeconds?: number;
  }) => void;
}

export function StudioRetellSettings({
  retellVoiceModel = "eleven_flash_v2_5",
  retellEmotion = "calm",
  retellLanguage = "hi-IN",
  voiceSpeed = 1.0,
  retellAmbientSound = "call-center",
  retellBackchannel = true,
  retellReminderMs = 10000,
  maxDurationSeconds = 600,
  onChange,
}: StudioRetellSettingsProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div>
        <h4 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-purple-600" />
          <span>Retell Real-Time Cadence, Emotion & Ambience Studio</span>
        </h4>
        <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
          Fine-tune TTS voice model engine, emotional inflection, background ambient realism, and active backchanneling.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Retell Voice Model */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">TTS Voice Model</label>
          <select
            value={retellVoiceModel}
            onChange={(e) => onChange({ retellVoiceModel: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="eleven_flash_v2_5">ElevenLabs Flash 2.5 (Fastest)</option>
            <option value="eleven_multilingual_v2">ElevenLabs Multilingual v2 (Hindi/Global)</option>
            <option value="sonic-3.5">Cartesia Sonic 3.5 (Expressive)</option>
            <option value="speech-02-turbo">MiniMax Speech Turbo (Natural Fluidity)</option>
            <option value="tts-1">OpenAI TTS Standard</option>
            <option value="gpt-4o-mini-tts">OpenAI Realtime TTS</option>
          </select>
        </div>

        {/* Voice Emotion */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">Voice Emotion</label>
          <select
            value={retellEmotion}
            onChange={(e) => onChange({ retellEmotion: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="calm">Calm & Composed</option>
            <option value="sympathetic">Sympathetic & Empathetic</option>
            <option value="happy">Happy & Upbeat</option>
            <option value="surprised">Surprised & Engaged</option>
            <option value="neutral">Neutral Professional</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">Agent Primary Language</label>
          <select
            value={retellLanguage}
            onChange={(e) => onChange({ retellLanguage: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="hi-IN">Hindi (hi-IN / Hinglish India)</option>
            <option value="en-IN">English (en-IN India Accent)</option>
            <option value="en-US">English (en-US Global)</option>
            <option value="mr-IN">Marathi (mr-IN India)</option>
            <option value="ta-IN">Tamil (ta-IN India)</option>
            <option value="kn-IN">Kannada (kn-IN India)</option>
            <option value="es-ES">Spanish (es-ES)</option>
            <option value="de-DE">German (de-DE)</option>
          </select>
        </div>

        {/* Speaking Speed */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-slate-700">Voice Speed</label>
            <span className="text-[10px] font-mono font-bold text-purple-600">{voiceSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={voiceSpeed}
            onChange={(e) => onChange({ voiceSpeed: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-100 rounded-lg accent-purple-600 cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>0.5x</span>
            <span>Normal (1.0x)</span>
            <span>Fast (1.5x)</span>
          </div>
        </div>
      </div>

      {/* Realism Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        {/* Ambient Background Audio */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">Ambient Background Audio</label>
          <select
            value={retellAmbientSound}
            onChange={(e) => onChange({ retellAmbientSound: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="call-center">Call Center (Office Sales Floor)</option>
            <option value="coffee-shop">Coffee Shop (Warm Ambience)</option>
            <option value="convention-hall">Convention Hall (Expo Echo)</option>
            <option value="summer-outdoor">Summer Outdoor (Nature)</option>
            <option value="static-noise">Static Noise (Phone Line)</option>
            <option value="off">Off (Clean Studio)</option>
          </select>
        </div>

        {/* Active Backchanneling */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-800">Backchanneling</p>
            <p className="text-[10px] text-slate-400">Natural (&quot;yeah&quot;, &quot;uh-huh&quot;) nods</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ retellBackchannel: !retellBackchannel })}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
              retellBackchannel
                ? "bg-purple-600 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {retellBackchannel ? "Active" : "Off"}
          </button>
        </div>

        {/* Unresponsive Silence Reminder */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700">Silence Reminder</label>
          <select
            value={retellReminderMs}
            onChange={(e) => onChange({ retellReminderMs: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value={10000}>Remind after 10s</option>
            <option value={15000}>Remind after 15s</option>
            <option value={20000}>Remind after 20s</option>
            <option value={0}>Disabled</option>
          </select>
        </div>

        {/* Call Timeout */}
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
