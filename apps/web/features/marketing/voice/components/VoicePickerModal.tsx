"use client";

import React, { useState } from "react";
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
}

export function VoicePickerModal({
  isOpen,
  onClose,
  selectedVoiceId,
  voices,
  onSelectVoice,
  onPlayPreview,
}: VoicePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const playVoiceSample = (voice: any) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (playingVoiceId === voice.id && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const sampleText = voice.previewText || `Hello! This is ${voice.name}. How may I help you with your property search today?`;
    const utterance = new SpeechSynthesisUtterance(sampleText);

    const voices = window.speechSynthesis.getVoices();
    const isFemale = voice.gender?.toLowerCase() === "female";
    const isHindi = /hindi|sarvam|indic/i.test(voice.provider) || /hindi/i.test(voice.accent);

    if (voices.length > 0) {
      let matchingVoice = voices.find((v) => {
        if (isHindi && (v.lang.startsWith("hi") || v.lang.includes("IN"))) return true;
        if (isFemale && /female|jenny|sonia|zira|samantha|karen|victoria/i.test(v.name)) return true;
        if (!isFemale && /male|guy|david|ryan|george|alex/i.test(v.name)) return true;
        return false;
      });

      if (!matchingVoice) matchingVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
      if (matchingVoice) utterance.voice = matchingVoice;
    }

    utterance.pitch = isFemale ? 1.1 : 0.95;
    utterance.rate = 1.0;

    utterance.onstart = () => setPlayingVoiceId(voice.id);
    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  const catalog = (voices && voices.length > 0) ? voices : VOICE_TTS_CATALOG;

  const filteredVoices = catalog.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.tags && v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesGender = selectedGender === "ALL" || v.gender.toLowerCase() === selectedGender.toLowerCase();

    return matchesSearch && matchesGender;
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

          <div className="flex flex-wrap items-center gap-2">
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
                  {g === "ALL" ? "All Voices" : g}
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
