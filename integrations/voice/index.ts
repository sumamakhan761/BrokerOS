// ============================================================================
// BrokerOS — Voice Integrations Registry & Factory
// ============================================================================

// Telephony Carriers
export { TwilioTelephonyClient } from '@brokeros/int-telephony-twilio';
export { VobizTelephonyClient } from '@brokeros/int-telephony-vobiz';
export { ExotelTelephonyClient } from '@brokeros/int-telephony-exotel';
export { TelnyxTelephonyClient } from '@brokeros/int-telephony-telnyx';

// AI Voice Agent Engines
export { VapiAgentClient } from '@brokeros/int-agent-vapi';
export { RetellAgentClient } from '@brokeros/int-agent-retell';
export { ElevenLabsAgentClient } from '@brokeros/int-agent-elevenlabs';
export { SarvamAgentClient } from '@brokeros/int-agent-sarvam';
export { BolnaAgentClient } from '@brokeros/int-agent-bolna';
export { PipecatAgentClient } from '@brokeros/int-agent-pipecat';
export { LiveKitAgentClient } from '@brokeros/int-agent-livekit';
export { OpenAIRealtimeAgentClient } from '@brokeros/int-agent-openai-realtime';

import type {
  IVoiceTelephonyProvider,
  IVoiceAgentProvider,
  VoiceTelephonyType,
  VoiceAgentPlatform,
  VoiceTelephonyCredentials,
  VoiceAgentCredentials,
} from '@brokeros/types';

import { TwilioTelephonyClient } from '@brokeros/int-telephony-twilio';
import { VobizTelephonyClient } from '@brokeros/int-telephony-vobiz';
import { ExotelTelephonyClient } from '@brokeros/int-telephony-exotel';
import { TelnyxTelephonyClient } from '@brokeros/int-telephony-telnyx';

import { VapiAgentClient } from '@brokeros/int-agent-vapi';
import { RetellAgentClient } from '@brokeros/int-agent-retell';
import { ElevenLabsAgentClient } from '@brokeros/int-agent-elevenlabs';
import { SarvamAgentClient } from '@brokeros/int-agent-sarvam';
import { BolnaAgentClient } from '@brokeros/int-agent-bolna';
import { PipecatAgentClient } from '@brokeros/int-agent-pipecat';
import { LiveKitAgentClient } from '@brokeros/int-agent-livekit';
import { OpenAIRealtimeAgentClient } from '@brokeros/int-agent-openai-realtime';

export function getVoiceTelephonyProvider(
  type: VoiceTelephonyType,
  credentials?: VoiceTelephonyCredentials,
): IVoiceTelephonyProvider {
  switch (type) {
    case 'TWILIO':
      return new TwilioTelephonyClient(credentials);
    case 'VOBIZ':
      return new VobizTelephonyClient(credentials);
    case 'EXOTEL':
      return new ExotelTelephonyClient(credentials);
    case 'TELNYX':
      return new TelnyxTelephonyClient(credentials);
    default:
      return new TwilioTelephonyClient(credentials);
  }
}

export function getVoiceAgentProvider(
  platform: VoiceAgentPlatform,
  credentials?: VoiceAgentCredentials,
): IVoiceAgentProvider {
  switch (platform) {
    case 'VAPI':
      return new VapiAgentClient(credentials);
    case 'RETELL':
      return new RetellAgentClient(credentials);
    case 'ELEVENLABS':
      return new ElevenLabsAgentClient(credentials);
    case 'SARVAM':
      return new SarvamAgentClient(credentials);
    case 'BOLNA':
      return new BolnaAgentClient(credentials);
    case 'PIPECAT':
      return new PipecatAgentClient(credentials);
    case 'LIVEKIT':
      return new LiveKitAgentClient(credentials);
    case 'OPENAI_REALTIME':
      return new OpenAIRealtimeAgentClient(credentials);
    default:
      return new VapiAgentClient(credentials);
  }
}
