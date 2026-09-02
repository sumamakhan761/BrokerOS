// ============================================================================
// BrokerOS — LiveKit Voice Agent LLM Model Catalog
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const LIVEKIT_MODELS: VoiceModelItem[] = [
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B (LiveKit Recommended)', provider: 'LiveKit Inference', badge: 'Default LLM', description: 'Latency-optimized open-weight model served directly on LiveKit infrastructure' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (LiveKit Engine)', provider: 'OpenAI', badge: 'High Speed', description: 'Ultra-low latency conversational orchestrator for high concurrency' },
  { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'Azure / OpenAI', badge: 'Balanced', description: 'High precision dialogue handling with structured tool calling' },
  { id: 'google/gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'Google', badge: 'Low Latency', description: 'Sub-second real-time conversational reasoning' },
  { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'Baseten', badge: 'Speed Leader', description: 'Cost-effective high-intelligence reasoning model' },
  { id: 'openai/realtime', name: 'OpenAI Realtime API (Speech-to-Speech)', provider: 'OpenAI', badge: 'Multimodal', description: 'End-to-end direct speech comprehension without cascade latency' },
  { id: 'gemini/live', name: 'Gemini Live API', provider: 'Google', badge: 'Realtime Audio', description: 'Direct audio-in audio-out conversational framework' },
];
