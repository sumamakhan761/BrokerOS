import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { VoiceService } from '../voice.service.js';
import {
  TestTelephonyCarrierDto,
  TestVoiceAiCallDto,
} from '../dto/voice.dto.js';

@Public()
@Controller('api/marketing/voice/test')
export class VoiceTestController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('carrier')
  testCarrier(@Body() dto: TestTelephonyCarrierDto) {
    return this.voiceService.testCarrierLine(dto);
  }

  @Post('ai-call')
  testVoiceAiCall(@Body() dto: TestVoiceAiCallDto) {
    return this.voiceService.testVoiceAiCall(dto);
  }
}
