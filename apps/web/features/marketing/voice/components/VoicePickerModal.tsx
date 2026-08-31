"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  Check,
  X,
  Volume2,
  Radio,
} from "lucide-react";
import { VOICE_TTS_CATALOG } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface VoicePersonaOption {
  id: string;
  name: string;
  provider: string;
  accent: string;
  gender: string;
  tags?: readonly string[] | string[];
  previewUrl?: string;
  previewText?: string;
}

export interface VoicePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoiceId: string;
  voices?: VoicePersonaOption[];
  onSelectVoice: (voice: {
    id: string;
    name: string;
    provider: string;
    accent: string;
    gender: string;
    previewText?: string;
  }) => void;
  onPlayPreview?: (voiceId: string, provider: string, previewText: string) => void;
  apiBaseUrl?: string;
  agentPlatformId?: string;
}

export function VoicePickerModal({
  isOpen,
  onClose,
  selectedVoiceId,
  voices,
  onSelectVoice,
  onPlayPreview,
  apiBaseUrl = "",
  agentPlatformId,
}: VoicePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [selectedProvider, setSelectedProvider] = useState<string>("ALL");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  // Clean up audio on unmount or modal close
  React.useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      setPlayingVoiceId(null);
    }
  }, [isOpen]);

  const playVoiceSample = async (voice: any) => {
    if (typeof window === "undefined") return;

    // If already playing this voice, stop it
    if (playingVoiceId === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setPlayingVoiceId(null);
      return;
    }

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const sampleText = voice.previewText || `Hello! This is ${voice.name}. How may I help you with your property search today?`;

    // 1. Direct verified preview URL
    if (voice.previewUrl) {
      try {
        const audio = new Audio(voice.previewUrl);
        audioRef.current = audio;
        setPlayingVoiceId(voice.id);

        audio.onended = () => {
          setPlayingVoiceId(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setPlayingVoiceId(null);
          audioRef.current = null;
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn("Direct audio playback failed, trying backend synthesis", err);
      }
    }

    const resolvedBase = (apiBaseUrl && apiBaseUrl.trim().length > 0)
      ? apiBaseUrl
      : (typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "/api/proxy") : "/api/proxy");
    const previewEndpoint = `${resolvedBase.replace(/\/$/, '')}/api/marketing/voice/audio/preview`;

    // 2. Try Backend Neural TTS API (Sarvam Bulbul v3, ElevenLabs, OpenAI, Deepgram, Cartesia)
    try {
      setIsLoadingAudio(true);
      const res = await fetch(previewEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sampleText,
          voiceId: voice.id,
          voiceProvider: voice.provider,
          agentPlatformId,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 500) {
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
          }
          const url = URL.createObjectURL(blob);
          urlRef.current = url;

          const audio = new Audio(url);
          audioRef.current = audio;
          setPlayingVoiceId(voice.id);
          setIsLoadingAudio(false);

          audio.onended = () => {
            setPlayingVoiceId(null);
            audioRef.current = null;
          };
          audio.onerror = () => {
            setPlayingVoiceId(null);
            audioRef.current = null;
          };

          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Backend TTS preview fallback to distinctive persona synthesis", err);
    } finally {
      setIsLoadingAudio(false);
    }

    // 3. Fallback: Distinct Persona Speech Synthesis
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(sampleText);
      const voicesList = window.speechSynthesis.getVoices();
      const isFemale = voice.gender?.toLowerCase() === "female" || /female|savannah|emma|clara|layla|naina|sarah|rachel|bella|domi|asteria|luna|stella|nova|shimmer|jenny|priya|ritu|pooja|kavitha|simran|shreya|rupali/i.test(voice.name || voice.id);
      const isHindi = /hindi|sarvam|indic/i.test(voice.provider) || /hindi|indian/i.test(voice.accent || "") || /rohan|sagar|neil|naina|priya|rahul|shubh|ritu|pooja|kabir|aditya/i.test(voice.name || voice.id);
      const isBritish = /british/i.test(voice.accent || "") || /michael|helios|brian|fable/i.test(voice.name || voice.id);

      if (voicesList.length > 0) {
        let matchingVoice = voicesList.find((v) => {
          const vName = v.name.toLowerCase();
          const isVFemale = /female|zira|heera|kalpana|samantha|karen|victoria|hazel|jenny|veena/i.test(vName);
          const isVMale = /male|david|ravi|mark|george|alex|ryan/i.test(vName);

          if (isFemale && isVMale) return false;
          if (!isFemale && isVFemale) return false;

          if (isHindi && (v.lang.startsWith("hi") || v.lang.includes("IN"))) {
            if (isFemale && isVFemale) return true;
            if (!isFemale && isVMale) return true;
            return true;
          }

          if (isFemale && isVFemale) return true;
          if (!isFemale && isVMale) return true;
          return false;
        });

        if (!matchingVoice) {
          matchingVoice = isFemale
            ? voicesList.find((v) => /female|zira|heera|kalpana|samantha|karen|victoria|hazel|jenny/i.test(v.name))
            : voicesList.find((v) => /male|david|ravi|mark|alex|ryan/i.test(v.name));
        }

        if (!matchingVoice) matchingVoice = voicesList.find((v) => v.lang.startsWith("en")) || voicesList[0];
        if (matchingVoice) utterance.voice = matchingVoice;
      }

      // Persona-specific pitch & speed tuning so each character sounds distinct
      if (/sid|onyx|adam|zeus|orion/i.test(voice.name || voice.id)) {
        utterance.pitch = 0.78; // Deep-toned
        utterance.rate = 0.95;
      } else if (/elliot|antoni|michael/i.test(voice.name || voice.id)) {
        utterance.pitch = 0.92; // Soothing executive
        utterance.rate = 1.0;
      } else if (/godfrey|kai|josh/i.test(voice.name || voice.id)) {
        utterance.pitch = 1.05; // Young energetic
        utterance.rate = 1.08;
      } else if (/sagar|neil|rohan/i.test(voice.name || voice.id)) {
        utterance.pitch = 0.88; // Indian professional
        utterance.rate = 1.02;
      } else if (/layla|bella|nova/i.test(voice.name || voice.id)) {
        utterance.pitch = 1.25; // Bright cheerful
        utterance.rate = 1.05;
      } else if (/savannah|clara|sarah/i.test(voice.name || voice.id)) {
        utterance.pitch = 1.10; // Warm consultative
        utterance.rate = 0.98;
      } else {
        utterance.pitch = isFemale ? 1.15 : 0.88;
        utterance.rate = 1.0;
      }

      utterance.onstart = () => setPlayingVoiceId(voice.id);
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  const catalog = (voices && voices.length > 0) ? voices : VOICE_TTS_CATALOG;

  // Extract distinct providers for tabs
  const availableProviders = ["ALL", ...Array.from(new Set(catalog.map((v) => v.provider.toLowerCase())))];

  const filteredVoices = catalog.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.tags && v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesGender = selectedGender === "ALL" || v.gender.toLowerCase() === selectedGender.toLowerCase();
    const matchesProvider = selectedProvider === "ALL" || v.provider.toLowerCase() === selectedProvider.toLowerCase();

    return matchesSearch && matchesGender && matchesProvider;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                Voice Catalog & Dialect Selector
              </h2>
              <p className="text-xs text-[var(--text-tertiary)] font-medium">
                Choose human-like synthetic or regional Indic accents for your AI callers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-5 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by voice name, language (Hindi, English), or tag (e.g. Luxury, Warm)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            {/* Gender Filters */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <span className="text-[11px] font-extrabold text-slate-400 mr-1 uppercase">Gender:</span>
              {["ALL", "Female", "Male"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${selectedGender === g
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                >
                  {g === "ALL" ? "All" : g}
                </button>
              ))}
            </div>

            {/* Provider Filters */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
              <span className="text-[11px] font-extrabold text-slate-400 mr-1 uppercase">Provider:</span>
              {availableProviders.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedProvider(p)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${selectedProvider === p
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                >
                  {p === "ALL" ? "All" : p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voice Grid */}
        <div className="p-5 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                onClick={() => {
                  onSelectVoice(voice);
                  onClose();
                }}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected
                  ? "border-indigo-500 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-xs"
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${voice.gender === "Female"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-blue-50 text-blue-600"
                          }`}
                      >
                        {voice.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                          {voice.name}
                        </h4>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-semibold">
                          {voice.accent} · {voice.gender}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="default"
                        className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600"
                      >
                        {voice.provider}
                      </Badge>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 italic mb-3">
                    &quot;{voice.previewText}&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {voice.tags?.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlayPreview) {
                        onPlayPreview(voice.id, voice.provider, voice.previewText || "");
                      }
                      playVoiceSample(voice);
                    }}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${playingVoiceId === voice.id
                      ? "bg-emerald-600 text-white shadow-2xs animate-pulse"
                      : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{playingVoiceId === voice.id ? "Speaking..." : "Preview"}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredVoices.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-400">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold">No voices match your search criteria</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{filteredVoices.length} voices available in catalog</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
