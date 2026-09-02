// ============================================================================
// BrokerOS — Pipecat AI Pipeline LLM Models Catalog
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const PIPECAT_MODELS: VoiceModelItem[] = [
  { id: 'groq/llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Pipecat Ultra Speed)', provider: 'Groq', badge: 'Ultra Low Latency', description: 'Sub-50ms TTFT pipeline for high-cadence conversational flow' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Pipecat Orchestrator)', provider: 'OpenAI', badge: 'Fast & Balanced', description: 'Reliable real-time function calling and structured prompt extraction' },
  { id: 'anthropic/claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'Complex Reasoning', description: 'Deep conversational empathy and consultative sales workflows' },
  { id: 'deepseek/deepseek-v3', name: 'DeepSeek V3 (Pipecat Speed)', provider: 'DeepSeek', badge: 'Cost Efficient', description: 'High-speed conversational inference with minimal cost overhead' },
];
