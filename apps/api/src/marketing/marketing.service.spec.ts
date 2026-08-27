jest.mock('../lib/database/prisma.service.js', () => {
  return {
    PrismaService: class MockPrismaService {},
  };
});

import { MarketingService } from './marketing.service.js';

describe('MarketingService Unit Tests', () => {
  let service: MarketingService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      marketingUnsubscribe: {
        findMany: jest.fn().mockResolvedValue([{ email: 'unsub@example.com' }]),
        upsert: jest.fn().mockResolvedValue({}),
      },
      lead: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'lead-1', email: 'rahul@example.com', firstName: 'Rahul', lastName: 'Sharma' },
          { id: 'lead-2', email: 'rahul@example.com', firstName: 'Rahul', lastName: 'Duplicate' },
          { id: 'lead-3', email: 'unsub@example.com', firstName: 'Unsub', lastName: 'User' },
          { id: 'lead-4', email: 'priya@example.com', firstName: 'Priya', lastName: 'Patel' },
        ]),
        create: jest.fn().mockResolvedValue({ id: 'new-lead-1' }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      marketingCampaign: {
        create: jest.fn().mockResolvedValue({ id: 'camp-123', title: 'Diwali Launch' }),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockResolvedValue({}),
      },
      campaignRecipient: {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      marketingIntegration: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'int-1' }),
        delete: jest.fn().mockResolvedValue({ id: 'int-1' }),
      },
      emailTrackingEvent: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'ev-1' }),
      },
      $transaction: jest.fn().mockImplementation((promises: any) => Promise.all(promises)),
    };

    service = new MarketingService(mockPrisma);
  });

  describe('Audience Estimation', () => {
    it('should correctly deduplicate emails and filter unsubscribed leads from DB', async () => {
      const result = await service.previewAudience({
        audienceSource: 'CRM_DATABASE',
        audienceFilters: { temperatures: ['HOT'] },
      });

      // 4 leads in mock: 1 duplicate (rahul), 1 unsubscribed (unsub) -> 2 valid (rahul, priya)
      expect(result.totalCount).toBe(4);
      expect(result.duplicateCount).toBe(1);
      expect(result.unsubscribedCount).toBe(1);
      expect(result.finalAudienceCount).toBe(2);
    });

    it('should correctly parse and sanitize CSV recipients', async () => {
      const result = await service.previewAudience({
        audienceSource: 'CSV_UPLOAD',
        csvRecipients: [
          { email: 'user1@test.com', name: 'User 1' },
          { email: 'user1@test.com', name: 'User 1 Duplicate' },
          { email: 'invalid-email', name: 'Bad Email' },
          { email: 'unsub@example.com', name: 'Unsub Person' },
          { email: 'user2@test.com', name: 'User 2' },
        ],
      });

      expect(result.totalCount).toBe(5);
      expect(result.duplicateCount).toBe(1);
      expect(result.unsubscribedCount).toBe(1);
      expect(result.validEmailCount).toBe(2); // user1 & user2
      expect(result.finalAudienceCount).toBe(2);
    });
  });

  describe('Test Email Dispatch', () => {
    it('should dispatch test email using System Default adapter', async () => {
      const result = await service.sendTestEmail({
        recipientEmail: 'test@example.com',
        subject: 'Project Launch',
        htmlContent: '<p>Hello World</p>',
        fromName: 'Skyline Team',
        fromEmail: 'sales@skyline.com',
        providerType: 'SYSTEM_DEFAULT',
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('AWS_SES');
      expect(result.sentCount).toBe(1);
    });
  });
});
