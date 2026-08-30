"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Sparkles,
  Volume2,
  Brain,
  MessageSquare,
  FileText,
  Copy,
  Plus,
  Zap,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { DEFAULT_VOICE_SCRIPTS, VOICE_AGENT_PLATFORMS } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VoiceModelSelector } from "../components/VoiceModelSelector";
import { VoicePickerModal } from "../components/VoicePickerModal";
import { InBrowserAudioPlayer } from "../components/InBrowserAudioPlayer";
import type { VoiceAgentIntegrationRecord, CsvLeadRow } from "@/features/marketing/types";

export interface VoiceStep4AgentComposerProps {
  formData: {
    agentPlatformId?: string;
    llmModel: string;
    voiceProvider: string;
    voiceId: string;
    voiceName: string;
    scriptPrompt: string;
    firstMessage?: string;
    transcriberModel?: string;
    transcriberLanguage?: string;
    maxTurnSilenceMs?: number;
    voiceSpeed?: number;
    firstMessageMode?: "assistant-speaks-first" | "assistant-waits-for-user";
    voicemailDetection?: "off" | "machine_detection";
    backgroundSound?: "off" | "office";
    maxDurationSeconds?: number;
  };
  onChange: (fields: Partial<VoiceStep4AgentComposerProps["formData"]>) => void;
  agentIntegrations?: VoiceAgentIntegrationRecord[];
  csvRecipients?: CsvLeadRow[];
  selectedProject?: { id: string; name: string; city?: string };
  apiBaseUrl?: string;
  onBack?: () => void;
  onNext?: () => void;
}

export function VoiceStep4AgentComposer({
  formData,
  onChange,
  agentIntegrations = [],
  csvRecipients = [],
  selectedProject,
  apiBaseUrl = "",
  onBack,
  onNext,
}: VoiceStep4AgentComposerProps) {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [dynamicModels, setDynamicModels] = useState<any[]>([]);
  const [dynamicVoices, setDynamicVoices] = useState<any[]>([]);
  const [dynamicAssistants, setDynamicAssistants] = useState<any[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  // Dynamic Variable Interpolation from 1st Lead / Project
  const firstLead = csvRecipients?.[0];
  const sampleLead = {
    firstName: firstLead?.name ? firstLead.name.trim().split(" ")[0] : "Rahul",
    fullName: firstLead?.name || "Rahul Sharma",
    budget: firstLead?.budget ? `₹${firstLead.budget}` : "₹3.5 Cr",
  };
  const sampleProject = selectedProject || { name: "DLF Privana West", city: "Gurugram" };

  const interpolateVariables = (template: string) => {
    if (!template) return "";
    return template
      .replace(/\{\{\s*lead\.firstName\s*\}\}/gi, sampleLead.firstName)
      .replace(/\{\{\s*lead\.fullName\s*\}\}/gi, sampleLead.fullName)
      .replace(/\{\{\s*project\.name\s*\}\}/gi, sampleProject.name)
      .replace(/\{\{\s*project\.city\s*\}\}/gi, sampleProject.city || "Gurugram")
      .replace(/\{\{\s*lead\.budget\s*\}\}/gi, sampleLead.budget);
  };

  // Vapi Advanced Studio Values from Parent Form State
  const transcriberModel = formData.transcriberModel || "nova-3";
  const transcriberLanguage = formData.transcriberLanguage || "en";
  const maxTurnSilenceMs = formData.maxTurnSilenceMs ?? 400;
  const voiceSpeed = formData.voiceSpeed ?? 1.0;
  const voicemailDetection = formData.voicemailDetection || "off";
  const backgroundSound = formData.backgroundSound || "off";
  const maxDurationSeconds = formData.maxDurationSeconds ?? 600;

  const selectedIntegration = agentIntegrations.find((a) => a.id === formData.agentPlatformId);
  const currentPlatform = selectedIntegration?.platform || "VAPI";

  // Fetch Live Models, Voices, and Assistants for the active AI platform
  React.useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoadingCatalog(true);
        const endpoint = formData.agentPlatformId
          ? `${apiBaseUrl}/api/marketing/voice/integrations/agents/${formData.agentPlatformId}/catalog`
          : `${apiBaseUrl}/api/marketing/voice/integrations/catalog/${currentPlatform}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (data.assistants && Array.isArray(data.assistants)) {
            setDynamicAssistants(data.assistants);
          }
          if (data.models && Array.isArray(data.models)) {
            setDynamicModels(data.models);
            if (!data.models.some((m: any) => m.id === formData.llmModel)) {
              onChange({ llmModel: data.models[0]?.id || "" });
            }
          }
          if (data.voices && Array.isArray(data.voices)) {
            setDynamicVoices(data.voices);
            if (!data.voices.some((v: any) => v.id === formData.voiceId)) {
              onChange({
                voiceId: data.voices[0]?.id || "",
                voiceName: data.voices[0]?.name || "",
                voiceProvider: data.voices[0]?.provider || "",
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch live AI platform catalog", err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }

    loadCatalog();
  }, [formData.agentPlatformId, currentPlatform, apiBaseUrl]);

  const applyVapiAssistant = (asst: any) => {
    onChange({
      llmModel: asst.model?.model || formData.llmModel,
      voiceId: asst.voice?.voiceId || formData.voiceId,
      voiceName: `${asst.name} Voice`,
      voiceProvider: asst.voice?.provider || formData.voiceProvider,
      scriptPrompt: asst.model?.systemPrompt || formData.scriptPrompt,
      firstMessage: asst.firstMessage || formData.firstMessage,
      voiceSpeed: asst.voice?.speed ?? voiceSpeed,
      transcriberModel: asst.transcriber?.model || "nova-3",
      transcriberLanguage: asst.transcriber?.language || "en",
      maxTurnSilenceMs: asst.transcriber?.maxTurnSilence || 400,
      backgroundSound: asst.backgroundSound || "off",
      voicemailDetection: asst.voicemailDetection || "off",
      maxDurationSeconds: asst.maxDurationSeconds || 600,
      firstMessageMode: asst.firstMessageMode || "assistant-speaks-first",
    });
  };

  const smartTags = [
    { tag: "{{lead.firstName}}", label: "First Name" },
    { tag: "{{lead.fullName}}", label: "Full Name" },
    { tag: "{{project.name}}", label: "Project Name" },
    { tag: "{{project.city}}", label: "City" },
    { tag: "{{lead.budget}}", label: "Budget" },
  ];

  const insertTag = (tag: string, field: "scriptPrompt" | "firstMessage") => {
    const currentVal = formData[field] || "";
    onChange({ [field]: `${currentVal} ${tag}` });
  };

  const isNextDisabled = !formData.scriptPrompt?.trim() || !formData.llmModel || !formData.voiceId;

  const loadTemplate = (template: (typeof DEFAULT_VOICE_SCRIPTS)[number]) => {
    onChange({
      scriptPrompt: template.systemPrompt,
      firstMessage: template.firstMessage,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
          Step 4: AI Voice Persona & Script Composer
        </h2>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Select your conversational engine, neural voice persona, and compose human-grade consultative sales scripts.
        </p>
      </div>

      {/* Select AI Voice Engine Platform */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[var(--text-primary)]">
            Active AI Voice Platform <span className="text-rose-500">*</span>
          </label>
          <Link
            href="/dashboard/marketing/voice/settings"
            className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Connect New AI Platform</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agentIntegrations.map((agent) => {
            const isSelected = formData.agentPlatformId === agent.id;
            const platformInfo = (VOICE_AGENT_PLATFORMS as any)[agent.platform] || {
              name: agent.platform,
              badge: "Voice Engine",
            };

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  onChange({
                    agentPlatformId: agent.id,
                  });
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${isSelected
                  ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-extrabold">
                    <Radio className="w-4 h-4" />
                  </div>
                  <Badge variant="default" className="text-[9px]">
                    {platformInfo.badge}
                  </Badge>
                </div>

                <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{agent.name}</h4>
                <p className="text-[10px] text-purple-600 font-bold uppercase mt-0.5">
                  {agent.platform} Engine
                </p>
              </button>
            );
          })}

          {agentIntegrations.length === 0 && (
            <div className="col-span-4 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Radio className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">No AI Platforms Connected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Connect your Vapi, Retell, ElevenLabs, or Sarvam keys in Settings.
              </p>
              <Link href="/dashboard/marketing/voice/settings">
                <Button size="sm" variant="outline" className="mt-3 text-xs">
                  Open Voice Gateways Settings
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 1.5: LIVE VAPI CONFIGURED ASSISTANTS PICKER ── */}
      {currentPlatform === "VAPI" && dynamicAssistants.length > 0 && (
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white p-5 rounded-2xl border border-purple-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--text-primary)]">
                  Live Vapi Workspace Assistants
                </h4>
                <p className="text-[11px] font-medium text-slate-500">
                  Select an assistant from your Vapi account to auto-populate prompt, voice, transcriber, and speed.
                </p>
              </div>
            </div>
            <Badge variant="default" className="text-[10px] bg-purple-100 text-purple-700 border-purple-200">
              {dynamicAssistants.length} Connected
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {dynamicAssistants.map((asst) => (
              <div
                key={asst.id}
                className="p-3.5 bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--text-primary)]">{asst.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => applyVapiAssistant(asst)}
                    className="text-[10px] h-6 px-2 font-bold border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    Apply Config
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 font-medium">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                    {asst.model?.model || "gpt-4o"}
                  </span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                    Voice: {asst.voice?.voiceId || "Elliot"}
                  </span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                    STT: {asst.transcriber?.model || "nova-3"} ({asst.transcriber?.language || "en"})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 2: CONVERSATIONAL REASONING ENGINE (LLM MODEL) ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>Conversational Reasoning Engine (LLM Model) <span className="text-rose-500">*</span></span>
          </label>
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
            Select the active AI reasoning model for real-time dialogue, low latency, and turn-taking.
          </p>
        </div>

        <VoiceModelSelector
          selectedModel={formData.llmModel}
          models={dynamicModels}
          onSelectModel={(modelId) => onChange({ llmModel: modelId })}
          loading={isLoadingCatalog}
        />
      </div>

      {/* ── SECTION 2.5: VAPI SPEECH CADENCE & TRANSCRIBER STUDIO ── */}
      {currentPlatform === "VAPI" && (
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
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${backgroundSound === "office"
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
                onClick={() => onChange({ voicemailDetection: voicemailDetection === "machine_detection" ? "off" : "machine_detection" })}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${voicemailDetection === "machine_detection"
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
      )}

      {/* ── SECTION 3: SYNTHETIC VOICE PERSONA & AUDIO PREVIEW ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Synthetic Voice Persona & Audio Test <span className="text-rose-500">*</span></span>
            </label>
            <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
              Choose the accent, gender, and speaking cadence for your conversational sales agent.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowVoiceModal(true)}
            className="text-xs font-bold gap-1.5 border-indigo-200 hover:bg-indigo-50 text-indigo-700 shadow-2xs self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Browse {dynamicVoices.length} Voices</span>
          </Button>
        </div>

        {/* Selected Voice Card & In-Browser Audio Player */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div
            onClick={() => setShowVoiceModal(true)}
            className="lg:col-span-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-100/80 transition-colors cursor-pointer shadow-2xs group"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">
                  {formData.voiceName || "Select Voice Persona"}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 uppercase">
                  {formData.voiceProvider || "Voice"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ID: {formData.voiceId || "None"}
              </p>
            </div>

            <Badge variant="default" className="text-[10px] shrink-0">
              Change
            </Badge>
          </div>

          {/* Audio Player Preview */}
          <div className="lg:col-span-7 space-y-2">
            <InBrowserAudioPlayer
              text={interpolateVariables(formData.firstMessage || formData.scriptPrompt || "Hello! I am calling regarding your recent luxury real estate inquiry.")}
              voiceId={formData.voiceId}
              voiceName={formData.voiceName}
              voiceProvider={formData.voiceProvider}
              agentPlatformId={formData.agentPlatformId}
              apiBaseUrl={apiBaseUrl}
            />
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl w-fit">
              <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>
                Audience Preview Simulation: &#123;&#123;lead.firstName&#125;&#125; &rarr; <strong className="text-slate-800">{sampleLead.firstName}</strong> · &#123;&#123;project.name&#125;&#125; &rarr; <strong className="text-slate-800">{sampleProject.name}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: OPENING GREETING & AI SCRIPT COMPOSER ── */}
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

        {/* First Message */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold text-[var(--text-primary)]">
                First Spoken Message (Instant greeting spoken upon call pick-up)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(
                      interpolateVariables(formData.firstMessage || "Hello! How may I assist you?")
                    );
                    utterance.rate = formData.voiceSpeed || 1.0;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs flex items-center gap-1"
                title="Quick listen opening sentence"
              >
                <Volume2 className="w-3 h-3 text-indigo-600" />
                <span>Listen Spoken</span>
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
            value={formData.firstMessage || ""}
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
                onClick={() => {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    const sampleText = interpolateVariables(
                      formData.scriptPrompt?.slice(0, 180) || "You are an articulate real estate consultant."
                    );
                    const utterance = new SpeechSynthesisUtterance(sampleText);
                    utterance.rate = formData.voiceSpeed || 1.0;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs flex items-center gap-1"
                title="Quick listen sample prompt turn"
              >
                <Volume2 className="w-3 h-3 text-indigo-600" />
                <span>Listen Prompt</span>
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
            value={formData.scriptPrompt || ""}
            onChange={(e) => onChange({ scriptPrompt: e.target.value })}
            placeholder="You are an articulate, courteous Senior Real Estate Consultant..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed shadow-2xs"
          />
        </div>
      </div>

      {/* Voice Picker Modal */}
      <VoicePickerModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedVoiceId={formData.voiceId}
        voices={dynamicVoices}
        onSelectVoice={(voice) => {
          onChange({
            voiceId: voice.id,
            voiceName: voice.name,
            voiceProvider: voice.provider,
          });
        }}
      />

      {/* Navigation Footer */}
      {(onBack || onNext) && (
        <div className="flex items-center justify-between pt-2">
          {onBack ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          ) : <div />}

          {onNext && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onNext}
              disabled={isNextDisabled}
              className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <span>Continue to Review & Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
