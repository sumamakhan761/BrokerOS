"use client";

import React, { useState, useRef, useEffect } from "react";
import { Brain, Check, Search, ChevronDown, Cpu, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface VoiceModelOption {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  description?: string;
}

export interface VoiceModelSelectorProps {
  models?: VoiceModelOption[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  loading?: boolean;
}

export function VoiceModelSelector({
  models = [],
  selectedModel,
  onSelectModel,
  loading = false,
}: VoiceModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = models.find((m) => m.id === selectedModel) || {
    id: selectedModel || "default",
    name: selectedModel || "Select Reasoning Model",
    provider: "AI Engine",
    description: "Conversational turn-taking and reasoning model",
  };

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Combobox Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`w-full px-4 py-3 bg-white border rounded-2xl text-left flex items-center justify-between transition-all shadow-xs group ${
          isOpen
            ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20"
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            {loading ? (
              <Cpu className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4.5 h-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-[var(--text-primary)] truncate">
                {selectedOption.name}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-700 uppercase tracking-wider">
                {selectedOption.provider}
              </span>
              {selectedOption.badge && (
                <Badge variant="default" className="text-[9px] py-0">
                  {selectedOption.badge}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] font-mono truncate mt-0.5">
              ID: {selectedOption.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-indigo-600" : "group-hover:text-slate-600"
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Box Header */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search model name, provider, or tags..."
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />
            </div>
          </div>

          {/* Model Options List */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-100/60">
            {loading ? (
              <div className="p-6 text-center text-slate-500">
                <Cpu className="w-5 h-5 animate-pulse mx-auto text-indigo-600 mb-1" />
                <span className="text-xs font-bold">Loading available models...</span>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p className="text-xs font-bold">No models match &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(model.id);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full p-3 rounded-xl text-left flex items-start justify-between transition-colors ${
                      isSelected
                        ? "bg-indigo-50/80 border border-indigo-200 shadow-2xs"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-[var(--text-primary)]">
                          {model.name}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {model.provider}
                        </span>
                        {model.badge && (
                          <Badge variant="default" className="text-[9px] py-0">
                            {model.badge}
                          </Badge>
                        )}
                      </div>

                      {model.description && (
                        <p className="text-[11px] text-[var(--text-tertiary)] font-medium mt-1 line-clamp-2">
                          {model.description}
                        </p>
                      )}

                      <span className="text-[10px] font-mono text-slate-400 block mt-1">
                        ID: {model.id}
                      </span>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-200" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
