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

