# Testing Patterns (BrokerOS)

## Core Guidelines
1. **Mandatory Mocking Block**: Every single `.spec.ts` file MUST include our standard `jest.mock()` block at the very top of the file before any other imports. This ensures Prisma and Expo dependencies do not break the test environment.
2. **Minimal Service Instantiation**: Unit tests for services should focus on successfully instantiating the service with mocked dependencies.
3. **No Database Hits**: Tests must never attempt to hit a real database.

## Required Setup for Every Spec File
Copy this exact pattern when creating a new `.spec.ts` file:

```typescript
import { Test, TestingModule } from '@nestjs/testing';

// --- MANDATORY MOCK BLOCK ---
jest.mock('../../lib/database/prisma-client.js', () => ({
  prismaClient: {}
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: class {}
}));
jest.mock('../../generated/prisma/client.js', () => ({
  NotificationType: {},
  PrismaClient: class {}
}));
// Expo mock if NotificationsService is injected
jest.mock('expo-server-sdk', () => ({
  Expo: class {}
}));
// ----------------------------

import { PrismaService } from '../../lib/database/prisma.service.js';
import { FeaturesService } from './features.service.js';
// Import other required services...

describe('FeaturesService', () => {
  let service: FeaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturesService,
        { provide: PrismaService, useValue: {} },
        // provide other mocked services here with useValue: {}
      ],
    }).compile();

    service = module.get<FeaturesService>(FeaturesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```
