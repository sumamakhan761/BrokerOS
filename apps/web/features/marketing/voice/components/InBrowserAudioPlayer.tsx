"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Square, Volume2, VolumeX, Loader2, Sparkles, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface InBrowserAudioPlayerProps {
  text: string;
  voiceId: string;
  voiceName?: string;
  voiceProvider?: string;
  agentPlatformId?: string;
  apiBaseUrl?: string;
  className?: string;
}

export function InBrowserAudioPlayer({
  text,
  voiceId,
  voiceName = "Selected Voice",
  voiceProvider = "sarvam",
  agentPlatformId,
  apiBaseUrl = "",
  className = "",
}: InBrowserAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handlePlayPause = async () => {
    if (typeof window === "undefined") return;

    if (isPlaying) {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
      return;
    }

    const sampleText = (text || "Hello! I am calling regarding your real estate inquiry.").trim();
    if (!sampleText) return;

    try {
      setIsLoading(true);

      // Stop any existing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(sampleText);
      synthRef.current = utterance;

      // Select matching voice
      const voices = window.speechSynthesis.getVoices();
      const isFemale =
        /bella|rachel|domi|priya|sarah|emma|ananya|pooja/i.test(voiceName) ||
        /bella|rachel|domi|priya/i.test(voiceId);
      const isHindi = /hindi|sarvam|indic|priya|arjun/i.test(voiceProvider) || /hindi/i.test(voiceName);

      if (voices.length > 0) {
        let matchingVoice = voices.find((v) => {
          if (isHindi && (v.lang.startsWith("hi") || v.lang.includes("IN"))) return true;
          if (isFemale && /female|jenny|sonia|zira|samantha|karen|victoria/i.test(v.name)) return true;
          if (!isFemale && /male|guy|david|ryan|george|alex/i.test(v.name)) return true;
          return false;
        });

        if (!matchingVoice) {
          matchingVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
        }

        if (matchingVoice) utterance.voice = matchingVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = isFemale ? 1.1 : 0.95;
      utterance.volume = isMuted ? 0 : 1;

      // Calculate approximate duration
      const wordCount = sampleText.split(/\s+/).length;
      const estimatedSecs = Math.max(2, Math.round((wordCount / 140) * 60));
      setDuration(estimatedSecs);
      setCurrentTime(0);

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);

        let elapsed = 0;
        timerRef.current = setInterval(() => {
          elapsed += 0.2;
          setCurrentTime(Math.min(estimatedSecs, Math.round(elapsed)));
        }, 200);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Audio preview synthesis error:", err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (synthRef.current) {
      synthRef.current.volume = nextMuted ? 0 : 1;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 border border-indigo-500/20 shadow-lg ${className}`}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Voice Info & Animation */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
            {isPlaying ? (
              <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white">{voiceName}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                {voiceProvider}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {isPlaying ? "Streaming AI Voice Preview..." : "In-Browser Audio Preview (Play/Stop)"}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Animated Audio Waveform */}
          <div className="flex items-center gap-0.5 h-6 px-2">
            {[40, 70, 30, 90, 50, 80, 45, 65, 30, 85].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-400/60 rounded-full transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(4, (h * Math.sin(currentTime * 5 + i)) % 22)}px` : "4px",
                  opacity: isPlaying ? 0.9 : 0.3,
                }}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono text-slate-400 min-w-[36px]">
            {formatTime(currentTime)}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={isLoading || !text.trim()}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title={isPlaying ? "Pause Preview" : "Play Preview"}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleStop}
              disabled={!isPlaying && currentTime === 0}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all disabled:opacity-40"
              title="Stop"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
