import { Module } from '@nestjs/common';

@Module({
  imports: [],
  // Add BullMQ processors here as integrations are built:
  // imports: [BullModule.forRoot({ connection: { host: 'localhost', port: 6379 } })]
})
export class WorkersModule {}
