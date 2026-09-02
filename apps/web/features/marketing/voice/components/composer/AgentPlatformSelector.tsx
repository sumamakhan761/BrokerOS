"use client";

import React from "react";
import Link from "next/link";
import { Radio, Plus, Sparkles } from "lucide-react";
import { VOICE_AGENT_PLATFORMS } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { VoiceAgentIntegrationRecord } from "@/features/marketing/types";

export interface AgentPlatformSelectorProps {
  selectedPlatformId?: string;
  onSelectPlatform: (platformId: string) => void;
  agentIntegrations: VoiceAgentIntegrationRecord[];
  dynamicAssistants?: any[];
  onApplyAssistant?: (asst: any) => void;
  currentPlatform?: string;
}

export function AgentPlatformSelector({
  selectedPlatformId,
  onSelectPlatform,
  agentIntegrations = [],
  dynamicAssistants = [],
  onApplyAssistant,
  currentPlatform = "VAPI",
}: AgentPlatformSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Platform Cards Header */}
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

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agentIntegrations.map((agent) => {
          const isSelected = selectedPlatformId === agent.id;
          const platformInfo = (VOICE_AGENT_PLATFORMS as any)[agent.platform] || {
            name: agent.platform,
            badge: "Voice Engine",
          };

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelectPlatform(agent.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                isSelected
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

      {/* Live Workspace Assistants/Agents Picker */}
      {dynamicAssistants.length > 0 && onApplyAssistant && (
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white p-5 rounded-2xl border border-purple-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--text-primary)]">
                  Live {currentPlatform === "RETELL" ? "Retell" : "Vapi"} Workspace Agents
                </h4>
                <p className="text-[11px] font-medium text-slate-500">
                  Select an agent from your {currentPlatform === "RETELL" ? "Retell" : "Vapi"} account to auto-populate prompt, voice, language, and model.
                </p>
              </div>
            </div>
            <Badge variant="default" className="text-[10px] bg-purple-100 text-purple-700 border-purple-200">
              {dynamicAssistants.length} Connected
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {dynamicAssistants.map((asst) => (
              <div
                key={asst.id}
                className="p-3.5 bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--text-primary)] truncate max-w-[180px]">
                    {asst.name}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onApplyAssistant(asst)}
                    className="text-[10px] h-6 px-2 font-bold border-purple-200 text-purple-700 hover:bg-purple-50 shrink-0"
                  >
                    Apply Config
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 font-medium">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                    {asst.model?.model || asst.model?.type || "LLM"}
                  </span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                    Voice: {asst.voice?.voiceId || "Default"}
                  </span>
                  {asst.language && (
                    <>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                        {asst.language}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
