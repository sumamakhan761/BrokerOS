"use client";

import React from "react";
import { MessageSquare, Sparkles, Volume2, Loader2 } from "lucide-react";
import { DEFAULT_VOICE_SCRIPTS } from "@brokeros/constants";

export interface VoiceScriptEditorProps {
  scriptPrompt: string;
  firstMessage?: string;
  currentPlatform?: string;
  isSynthesizing?: boolean;
  isSpeakingCustom?: "first_message" | "prompt" | null;
  onSpeakCustomText: (text: string, mode: "first_message" | "prompt") => void;
  onChange: (fields: { scriptPrompt?: string; firstMessage?: string }) => void;
}

export function VoiceScriptEditor({
  scriptPrompt,
  firstMessage = "",
  currentPlatform = "VAPI",
  isSynthesizing = false,
  isSpeakingCustom = null,
  onSpeakCustomText,
  onChange,
}: VoiceScriptEditorProps) {
  const smartTags = [
    { tag: "{{lead.firstName}}", label: "First Name" },
    { tag: "{{lead.fullName}}", label: "Full Name" },
    { tag: "{{project.name}}", label: "Project Name" },
    { tag: "{{project.city}}", label: "City" },
    { tag: "{{lead.budget}}", label: "Budget" },
  ];

  const insertTag = (tag: string, field: "scriptPrompt" | "firstMessage") => {
    const currentVal = field === "scriptPrompt" ? scriptPrompt : firstMessage;
    onChange({ [field]: `${currentVal ? currentVal + " " : ""}${tag}` });
  };

  const loadTemplate = (template: (typeof DEFAULT_VOICE_SCRIPTS)[number]) => {
    onChange({
      scriptPrompt: template.systemPrompt,
      firstMessage: template.firstMessage,
    });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
      <div>
        <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Opening Greeting & AI Script</span>
        </h3>
        <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
          Compose the opening spoken sentence and the conversational system prompt that guides your agent.
        </p>
      </div>

      {/* Pre-built Script Templates Picker */}
      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-black text-slate-700">Quick-Load Real Estate Script Templates:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {DEFAULT_VOICE_SCRIPTS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => loadTemplate(t)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all shadow-2xs"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* First Spoken Message */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-extrabold text-[var(--text-primary)]">
              First Spoken Message (Instant greeting spoken upon call pick-up)
            </label>
            <button
              type="button"
              disabled={isSynthesizing && isSpeakingCustom !== "first_message"}
              onClick={() =>
                onSpeakCustomText(firstMessage || "Hello! How may I assist you with your property search today?", "first_message")
              }
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border shadow-2xs flex items-center gap-1 transition-all ${
                isSpeakingCustom === "first_message"
                  ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
              }`}
              title="Quick listen opening sentence in selected voice"
            >
              {isSynthesizing && isSpeakingCustom === "first_message" ? (
                <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
              ) : (
                <Volume2 className={`w-3 h-3 ${isSpeakingCustom === "first_message" ? "text-white" : "text-indigo-600"}`} />
              )}
              <span>{isSpeakingCustom === "first_message" ? "Stop" : "Listen Spoken"}</span>
            </button>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold">Insert tag:</span>
            {smartTags.map((st) => (
              <button
                key={st.tag}
                type="button"
                onClick={() => insertTag(st.tag, "firstMessage")}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-indigo-600 hover:bg-indigo-50 border border-slate-200/60 shadow-2xs"
              >
                {st.tag}
              </button>
            ))}
          </div>
        </div>
        <input
          type="text"
          value={firstMessage}
          onChange={(e) => onChange({ firstMessage: e.target.value })}
          placeholder="e.g. Hi {{lead.firstName}}, this is Sarah from Skyline Realty. Am I speaking with you?"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
        />
      </div>

      {/* Full System Prompt */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-extrabold text-[var(--text-primary)]">
              Full Conversational Agent System Prompt <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              disabled={isSynthesizing && isSpeakingCustom !== "prompt"}
              onClick={() =>
                onSpeakCustomText(
                  scriptPrompt?.slice(0, 220) || "You are an articulate real estate consultant.",
                  "prompt"
                )
              }
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border shadow-2xs flex items-center gap-1 transition-all ${
                isSpeakingCustom === "prompt"
                  ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
              }`}
              title="Quick listen sample prompt turn in selected voice"
            >
              {isSynthesizing && isSpeakingCustom === "prompt" ? (
                <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
              ) : (
                <Volume2 className={`w-3 h-3 ${isSpeakingCustom === "prompt" ? "text-white" : "text-indigo-600"}`} />
              )}
              <span>{isSpeakingCustom === "prompt" ? "Stop" : "Listen Prompt"}</span>
            </button>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold">Insert tag:</span>
            {smartTags.map((st) => (
              <button
                key={st.tag}
                type="button"
                onClick={() => insertTag(st.tag, "scriptPrompt")}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-indigo-600 hover:bg-indigo-50 border border-slate-200/60 shadow-2xs"
              >
                {st.tag}
              </button>
            ))}
          </div>
        </div>
        <textarea
          required
          rows={9}
          value={scriptPrompt}
          onChange={(e) => onChange({ scriptPrompt: e.target.value })}
          placeholder="You are an articulate, courteous Senior Real Estate Consultant..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed shadow-2xs"
        />
      </div>

      {/* Retell Expressive Emotional Nuances */}
      {currentPlatform === "RETELL" && (
        <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Retell Expressive Emotional Inflection Tags (Click to inject into script):</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { tag: "[excited]", desc: "Upbeat inflection" },
              { tag: "[empathetic]", desc: "Warm listening tone" },
              { tag: "[sigh]", desc: "Thoughtful exhale" },
              { tag: "[clear throat]", desc: "Human pause" },
              { tag: "[pause]", desc: "1 sec conversational cadence" },
              { tag: "[emphasis]", desc: "Highlight prime value" },
            ].map((em) => (
              <button
                key={em.tag}
                type="button"
                onClick={() => insertTag(em.tag, "scriptPrompt")}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-all shadow-2xs"
                title={em.desc}
              >
                {em.tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
