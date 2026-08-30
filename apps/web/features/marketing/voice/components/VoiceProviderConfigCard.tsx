"use client";

import React, { useState } from "react";
import {
  Phone,
  Radio,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Key,
  ShieldCheck,
  Globe,
  Loader2,
  ExternalLink,
  Sparkles,
  X,
  Cpu,
} from "lucide-react";
import { VOICE_TELEPHONY_PROVIDERS, VOICE_AGENT_PLATFORMS } from "@brokeros/constants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type {
  VoiceTelephonyIntegrationRecord,
  VoiceAgentIntegrationRecord,
  VoiceTelephonyType,
  VoiceAgentPlatform,
} from "@/features/marketing/types";

export interface VoiceProviderConfigCardProps {
  telephonyIntegrations: VoiceTelephonyIntegrationRecord[];
  agentIntegrations: VoiceAgentIntegrationRecord[];
  onAddTelephony: (data: any) => Promise<void>;
  onDeleteTelephony: (id: string) => Promise<void>;
  onAddAgent: (data: any) => Promise<void>;
  onDeleteAgent: (id: string) => Promise<void>;
  loading?: boolean;
}

export function VoiceProviderConfigCard({
  telephonyIntegrations = [],
  agentIntegrations = [],
  onAddTelephony,
  onDeleteTelephony,
  onAddAgent,
  onDeleteAgent,
  loading = false,
}: VoiceProviderConfigCardProps) {
  const [activeTab, setActiveTab] = useState<"TELEPHONY" | "AGENT">("TELEPHONY");
  const [selectedTelephonyProvider, setSelectedTelephonyProvider] = useState<VoiceTelephonyType | null>(null);
  const [selectedAgentPlatform, setSelectedAgentPlatform] = useState<VoiceAgentPlatform | null>(null);

  // Telephony Form State
  const [telName, setTelName] = useState("");
  const [telAccountSid, setTelAccountSid] = useState("");
  const [telAuthToken, setTelAuthToken] = useState("");
  const [telApiKey, setTelApiKey] = useState("");
  const [telApiToken, setTelApiToken] = useState("");
  const [telFromNumbers, setTelFromNumbers] = useState("");
  const [telSubdomain, setTelSubdomain] = useState("");

  // Agent Form State
  const [agentName, setAgentName] = useState("");
  const [agentApiKey, setAgentApiKey] = useState("");
  const [agentOrgId, setAgentOrgId] = useState("");
  const [agentServerUrl, setAgentServerUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleOpenTelephonyModal = (prov: VoiceTelephonyType) => {
    setSelectedTelephonyProvider(prov);
    setTelName(`${(VOICE_TELEPHONY_PROVIDERS as any)[prov]?.name || prov} Line`);
    setTelAccountSid("");
    setTelAuthToken("");
    setTelApiKey("");
    setTelApiToken("");
    setTelFromNumbers("");
    setTelSubdomain("");
  };

  const handleOpenAgentModal = (platform: VoiceAgentPlatform) => {
    setSelectedAgentPlatform(platform);
    setAgentName(`${(VOICE_AGENT_PLATFORMS as any)[platform]?.name || platform} Engine`);
    setAgentApiKey("");
    setAgentOrgId("");
    setAgentServerUrl("");
  };

  const handleSaveTelephony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTelephonyProvider || !telName.trim()) return;

    try {
      setSubmitting(true);
      const numbers = telFromNumbers
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);

      await onAddTelephony({
        provider: selectedTelephonyProvider,
        name: telName.trim(),
        accountSid: telAccountSid || undefined,
        authToken: telAuthToken || undefined,
        apiKey: telApiKey || undefined,
        apiToken: telApiToken || undefined,
        subdomain: telSubdomain || undefined,
        fromNumbers: numbers,
        isDefault: telephonyIntegrations.length === 0,
      });

      setSelectedTelephonyProvider(null);
    } catch (err: any) {
      alert(err?.message || "Failed to verify and connect telephony carrier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentPlatform || !agentName.trim() || !agentApiKey.trim()) return;

    try {
      setSubmitting(true);
      await onAddAgent({
        platform: selectedAgentPlatform,
        name: agentName.trim(),
        apiKey: agentApiKey.trim(),
        orgId: agentOrgId || undefined,
        serverUrl: agentServerUrl || undefined,
        isDefault: agentIntegrations.length === 0,
      });

      setSelectedAgentPlatform(null);
    } catch (err: any) {
      alert(err?.message || "Failed to verify and authenticate AI voice platform");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-enter">
      {/* Category Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("TELEPHONY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === "TELEPHONY"
                ? "bg-white text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <Phone className="w-4 h-4 text-indigo-600" />
            <span>Telephony Gateways ({telephonyIntegrations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("AGENT")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === "AGENT"
                ? "bg-white text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <Radio className="w-4 h-4 text-indigo-600" />
            <span>AI Voice Platforms ({agentIntegrations.length})</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: TELEPHONY CARRIERS ── */}
      {activeTab === "TELEPHONY" && (
        <div className="space-y-8">
          {/* Active Connected Telephony Gateways */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Connected Telephony Carrier Trunks</h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">
                Your connected carrier trunks (Twilio, Vobiz AI, Exotel, Telnyx) for outbound PSTN dialing and Caller IDs.
              </p>
            </div>

            {telephonyIntegrations.length === 0 ? (
              <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
                <Phone className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[var(--text-primary)]">No telephony carriers connected yet</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Connect your Twilio, Vobiz AI, Exotel, or Telnyx accounts below to enable live phone dialing.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {telephonyIntegrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{item.name}</h4>
                            <Badge variant="default" className="text-[10px]">
                              {item.provider}
                            </Badge>
                            {item.isDefault && (
                              <Badge variant="success" className="text-[9px]">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1 font-mono">
                            Caller IDs: <span className="text-[var(--text-primary)] font-bold">{item.fromNumbers?.length ? item.fromNumbers.join(", ") : "None configured"}</span>
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTelephony(item.id)}
                          className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-[11px]">
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for dialing
                      </span>
                      <span className="text-[var(--text-muted)]">
                        Connected {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Telephony Adapters Directory */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Available Telephony Carrier Adapters</h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">
                Connect programmable carrier trunks to route broadcasts through your private billing accounts and DID lines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(["TWILIO", "VOBIZ", "EXOTEL", "TELNYX"] as const).map((prov) => {
                const config = (VOICE_TELEPHONY_PROVIDERS as any)[prov] || {
                  name: prov,
                  badge: "PSTN Carrier",
                  description: "High concurrency voice carrier trunk",
                  docsUrl: "https://docs.brokeros.com",
                };

                return (
                  <div
                    key={prov}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-xs">
                          <Phone className="w-4 h-4" />
                        </div>
                        <Badge variant="default" className="text-[10px]">
                          {config.badge}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{config.name}</h4>
                      <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-1 line-clamp-2">
                        {config.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={config.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-[var(--brand-600)] hover:underline inline-flex items-center gap-1"
                      >
                        <span>API Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenTelephonyModal(prov)}
                        className="h-7 px-2.5 text-[11px] font-bold gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Connect</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: AI VOICE PLATFORMS ── */}
      {activeTab === "AGENT" && (
        <div className="space-y-8">
          {/* Active Connected AI Voice Platforms */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Connected AI Voice Platforms</h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">
                Configured conversational engines (Vapi, Retell, ElevenLabs, Sarvam, Bolna, OpenAI, LiveKit, Pipecat).
              </p>
            </div>

            {agentIntegrations.length === 0 ? (
              <div className="p-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
                <Radio className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[var(--text-primary)]">No custom AI voice platforms connected yet</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Connect your Vapi, Retell, ElevenLabs, Sarvam, or Bolna accounts below.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentIntegrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{item.name}</h4>
                            <Badge variant="default" className="text-[10px]">
                              {item.platform}
                            </Badge>
                            {item.isDefault && (
                              <Badge variant="success" className="text-[9px]">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
                            Engine: <span className="text-[var(--text-primary)] font-bold">{item.platform} AI Voice</span>
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteAgent(item.id)}
                          className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-[11px]">
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Turn-Taking Active
                      </span>
                      <span className="text-[var(--text-muted)]">
                        Connected {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available AI Voice Platform Adapters Directory */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Available AI Voice Platform Adapters</h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">
                Connect autonomous speech-to-speech engines and synthetic voice catalogs for natural sales conversations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(["VAPI", "RETELL", "ELEVENLABS", "SARVAM", "BOLNA", "OPENAI_REALTIME", "LIVEKIT", "PIPECAT"] as const).map((platform) => {
                const config = (VOICE_AGENT_PLATFORMS as any)[platform] || {
                  name: platform,
                  badge: "AI Voice Engine",
                  description: "Conversational voice agent engine",
                  docsUrl: "https://docs.brokeros.com",
                };

                return (
                  <div
                    key={platform}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-xs">
                          <Radio className="w-4 h-4" />
                        </div>
                        <Badge variant="default" className="text-[10px]">
                          {config.badge}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{config.name}</h4>
                      <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-1 line-clamp-2">
                        {config.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={config.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-[var(--brand-600)] hover:underline inline-flex items-center gap-1"
                      >
                        <span>API Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAgentModal(platform)}
                        className="h-7 px-2.5 text-[11px] font-bold gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Connect</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. CONNECT TELEPHONY MODAL DIALOG ── */}
      {selectedTelephonyProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Connect {selectedTelephonyProvider} Carrier
                </h3>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Configure verified carrier credentials and outbound Caller ID numbers.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTelephonyProvider(null)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveTelephony} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Connection Nickname
                </label>
                <input
                  type="text"
                  required
                  value={telName}
                  onChange={(e) => setTelName(e.target.value)}
                  placeholder={`e.g. Production ${selectedTelephonyProvider} Line`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {selectedTelephonyProvider === "TWILIO" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Twilio Account SID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={telAccountSid}
                      onChange={(e) => setTelAccountSid(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Twilio Auth Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••••••••••••••••••"
                      value={telAuthToken}
                      onChange={(e) => setTelAuthToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === "VOBIZ" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Vobiz Auth ID (X-Auth-ID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Vobiz Auth Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiToken}
                      onChange={(e) => setTelApiToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === "EXOTEL" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel Account SID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telAccountSid}
                      onChange={(e) => setTelAccountSid(e.target.value)}
                      placeholder="e.g. shiftconsultant1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel Subdomain / Cluster URL
                    </label>
                    <input
                      type="text"
                      value={telSubdomain}
                      onChange={(e) => setTelSubdomain(e.target.value)}
                      placeholder="api.exotel.com (Singapore) or api.in.exotel.com (India)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Defaults to api.exotel.com (Singapore) or api.in.exotel.com (India cluster).
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel API Key <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Exotel API Token <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiToken}
                      onChange={(e) => setTelApiToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </>
              )}

              {selectedTelephonyProvider === "TELNYX" && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Telnyx API Key (v2) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={telApiKey}
                      onChange={(e) => setTelApiKey(e.target.value)}
                      placeholder="KEYxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                      Call Control App ID / Connection ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={telSubdomain}
                      onChange={(e) => setTelSubdomain(e.target.value)}
                      placeholder="Auto-detected or enter specific Call Control App ID"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Leave blank to auto-detect your active Call Control Application from Telnyx.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Outbound Caller IDs (comma-separated)
                </label>
                <input
                  type="text"
                  value={telFromNumbers}
                  onChange={(e) => setTelFromNumbers(e.target.value)}
                  placeholder="+919876543210, +14155550199"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTelephonyProvider(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  <span>Save & Verify Gateway</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 4. CONNECT AGENT PLATFORM MODAL DIALOG ── */}
      {selectedAgentPlatform && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 max-w-md w-full p-6 shadow-xl space-y-4 animate-enter max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Connect {selectedAgentPlatform} AI Voice Engine
                </h3>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  Configure API key for live speech synthesis and model turn-taking.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAgentPlatform(null)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Engine Nickname
                </label>
                <input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder={`e.g. Production ${selectedAgentPlatform}`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                  Platform API Key / Secret Token <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={agentApiKey}
                  onChange={(e) => setAgentApiKey(e.target.value)}
                  placeholder="API Key / Secret Token"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {selectedAgentPlatform === "VAPI" && (
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Organization ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={agentOrgId}
                    onChange={(e) => setAgentOrgId(e.target.value)}
                    placeholder="org_xxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              )}

              {(selectedAgentPlatform === "PIPECAT" || selectedAgentPlatform === "LIVEKIT") && (
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                    Server Endpoint / Runner URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={agentServerUrl}
                    onChange={(e) => setAgentServerUrl(e.target.value)}
                    placeholder="https://livekit.yourcloud.com or http://localhost:8765"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAgentPlatform(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  <span>Save & Authenticate Platform</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
