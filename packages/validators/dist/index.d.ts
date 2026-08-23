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
export declare const createLeadSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    projectId: z.ZodOptional<z.ZodString>;
    temperature: z.ZodDefault<z.ZodEnum<["HOT", "WARM", "COLD"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    temperature: "HOT" | "WARM" | "COLD";
    email?: string | undefined;
    projectId?: string | undefined;
}, {
    name: string;
    phone: string;
    email?: string | undefined;
    projectId?: string | undefined;
    temperature?: "HOT" | "WARM" | "COLD" | undefined;
}>;
export declare const updateLeadSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    projectId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    temperature: z.ZodOptional<z.ZodDefault<z.ZodEnum<["HOT", "WARM", "COLD"]>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    projectId?: string | undefined;
    temperature?: "HOT" | "WARM" | "COLD" | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    projectId?: string | undefined;
    temperature?: "HOT" | "WARM" | "COLD" | undefined;
}>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
//# sourceMappingURL=index.d.ts.map