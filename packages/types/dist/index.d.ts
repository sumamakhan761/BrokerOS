/**
 * @brokeros/types
 *
 * Shared TypeScript interfaces and enums for BrokerOS.
 * Import in api, web, and mobile like:
 *   import type { Lead, UserRole } from '@brokeros/types'
 *
 * Rules:
 * - No runtime code here — types only (interfaces, enums, type aliases)
 * - No imports from @nestjs, next, expo, or any framework
 * - Keep it dependency-free so all three apps can use it
 */
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PRE_SALES_MANAGER' | 'PRE_SALES' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'CLOSING_MANAGER' | 'SOURCING_MANAGER' | 'CP_MANAGER' | 'CP_EXECUTIVE' | 'POST_SALES_MANAGER' | 'POST_SALES';
export type LeadTemperature = 'HOT' | 'WARM' | 'COLD';
export type LeadStatus = 'NEW' | 'FOLLOW_UP' | 'SITE_VISIT_SCHEDULED' | 'SITE_VISIT_DONE' | 'NEGOTIATION' | 'BOOKING_DONE' | 'LOST' | 'NOT_INTERESTED';
export interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    status: LeadStatus;
    temperature: LeadTemperature;
    score: number;
    isCpProject: boolean;
    brokerId?: string | null;
    assignedUserId?: string | null;
    projectId?: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}
export interface Booking {
    id: string;
    leadId: string;
    unitId: string;
    customerId: string;
    brokerId?: string | null;
    totalAmount: number;
    discountAmount: number;
    createdAt: string;
    updatedAt: string;
}
export type UnitStatus = 'AVAILABLE' | 'BLOCKED' | 'SOLD' | 'CANCELLED';
export interface Unit {
    id: string;
    projectId: string;
    unitNumber: string;
    floor: number;
    type: string;
    area: number;
    basePrice: number;
    status: UnitStatus;
}
export interface Broker {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    agencyName?: string | null;
    reraId?: string | null;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map