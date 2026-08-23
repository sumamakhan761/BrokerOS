/**
 * @brokeros/validators
 *
 * Shared Zod schemas for BrokerOS.
 * Import in api, web, and mobile like:
 *   import { createLeadSchema } from '@brokeros/validators'
 *
 * Rules:
 * - Zod only — no NestJS decorators, no Next.js, no Expo imports
 * - Each schema should match the corresponding type in @brokeros/types
 * - Keep schemas generic enough for all three apps to share
 */
import { z } from 'zod';
// ─── Lead Schemas ─────────────────────────────────────────────────────────────
export const createLeadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    projectId: z.string().uuid().optional(),
    temperature: z.enum(['HOT', 'WARM', 'COLD']).default('COLD'),
});
export const updateLeadSchema = createLeadSchema.partial();
// ─── Add more schemas here as features are built ──────────────────────────────
