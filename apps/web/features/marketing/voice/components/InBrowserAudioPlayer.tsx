"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Square, Volume2, VolumeX, Loader2, Sparkles, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface InBrowserAudioPlayerProps {
  text: string;
  voiceId: string;
  voiceName?: string;
  voiceProvider?: string;
  voiceSpeed?: number;
  gender?: string;
  accent?: string;
  previewUrl?: string;
  agentPlatformId?: string;
  apiBaseUrl?: string;
  className?: string;
}

export function InBrowserAudioPlayer({
  text,
  voiceId,
  voiceName = "Selected Voice",
  voiceProvider = "vapi",
  voiceSpeed = 1.0,
  gender,
  accent,
  previewUrl,
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
  const urlRef = useRef<string | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up strictly on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);

  const fallbackSynth = (sampleText: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sampleText);
    synthRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    const isFemale =
      gender?.toLowerCase() === "female" ||
      /female|bella|rachel|domi|priya|sarah|emma|ananya|pooja|cleo|asteria|clara|layla|naina|savannah|ritu|kavitha|simran|shreya|rupali/i.test(voiceName) ||
      /female|bella|rachel|domi|priya|cleo|asteria|clara|layla|naina|ritu|pooja|kavitha|simran|shreya|rupali/i.test(voiceId);
    const isHindi =
      /hindi|sarvam|indic|priya|arjun|rohan|sagar|neil|naina|rahul|shubh|ritu|pooja/i.test(voiceProvider) ||
      /hindi|indian/i.test(voiceName) ||
      /indian/i.test(accent || "") ||
      /priya|rahul|shubh|ritu|pooja|rohan|kabir|aditya|ashutosh|gokul/i.test(voiceId);

    if (voices.length > 0) {
      let matchingVoice = voices.find((v) => {
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
          ? voices.find((v) => /female|zira|heera|kalpana|samantha|karen|victoria|hazel|jenny/i.test(v.name))
          : voices.find((v) => /male|david|ravi|mark|alex|ryan/i.test(v.name));
      }

      if (!matchingVoice) {
        matchingVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
      }

      if (matchingVoice) utterance.voice = matchingVoice;
    }

    utterance.rate = voiceSpeed || 1.0;
    utterance.pitch = isFemale ? 1.15 : 0.88;
    utterance.volume = isMuted ? 0 : 1;

    const wordCount = sampleText.split(/\s+/).length;
    const estimatedSecs = Math.max(2, Math.round((wordCount / (130 * (voiceSpeed || 1.0))) * 60));
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
  };

  const handlePlayPause = async () => {
    if (typeof window === "undefined") return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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

      // Stop any existing playback
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis?.cancel();

      const resolvedBase = (apiBaseUrl && apiBaseUrl.trim().length > 0)
        ? apiBaseUrl
        : (typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "/api/proxy") : "/api/proxy");
      const previewEndpoint = `${resolvedBase.replace(/\/$/, '')}/api/marketing/voice/audio/preview`;

      // 1. Try Live Dynamic Neural TTS via Backend Endpoint (Sarvam Bulbul v3 / ElevenLabs / OpenAI)
      try {
        const res = await fetch(previewEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: sampleText,
            voiceId,
            voiceProvider,
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
            setAudioUrl(url);

            const audio = new Audio(url);
            audioRef.current = audio;
            audio.volume = isMuted ? 0 : 1;
            audio.playbackRate = voiceSpeed || 1.0;

            audio.onloadedmetadata = () => {
              setDuration(Math.round(audio.duration || 4));
            };

            audio.onplay = () => {
              setIsLoading(false);
              setIsPlaying(true);
            };

            audio.ontimeupdate = () => {
              setCurrentTime(Math.round(audio.currentTime));
              if (audio.duration) setDuration(Math.round(audio.duration));
            };

            audio.onended = () => {
              setIsPlaying(false);
              setCurrentTime(0);
            };

            audio.onerror = () => {
              setIsPlaying(false);
              setIsLoading(false);
              fallbackSynth(sampleText);
            };

            await audio.play();
            setIsLoading(false);
            setIsPlaying(true);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend TTS endpoint not reachable, falling back to persona speech engine", err);
      }

      // 2. Fallback to Persona Speech Synthesis
      fallbackSynth(sampleText);
    } catch (err) {
      console.error("Audio preview synthesis error:", err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
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
