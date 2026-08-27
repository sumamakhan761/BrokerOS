"use client";

import React from "react";
import { Sparkles, Building, Tag, Gift, Award, Calendar, FileCode, Check } from "lucide-react";

export interface TemplateOption {
  id: string;
  name: string;
  category: string;
  subject: string;
  preview: string;
  htmlContent: string;
  icon: React.ElementType;
  badge: string;
}

export const REAL_ESTATE_TEMPLATES: TemplateOption[] = [
  {
    id: "project-launch",
    name: "New Tower / Project Launch",
    category: "PROJECT_LAUNCH",
    subject: "✨ Exclusive Pre-Launch Access: {{project.name}} is Now Open!",
    preview: "Experience luxury living starting at {{project.startingPrice}}. Download the floor plans today.",
    icon: Building,
    badge: "High Conversion",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background: #09090b; padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px;">Exclusive Project Launch</h1>
          <p style="font-size: 15px; color: #a1a1aa; margin: 0;">Be the first to explore <strong>{{project.name}}</strong></p>
        </div>
        <div style="padding: 32px 24px; color: #27272a; line-height: 1.6;">
          <p>Dear {{lead.firstName}},</p>
          <p>We are thrilled to unveil our flagship residential project: <strong>{{project.name}}</strong>, situated in the prime area of {{project.location}}.</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #0284c7;">
            <p style="margin: 0 0 8px; font-weight: 600;">Project Highlights:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Starting Price: <strong>{{project.startingPrice}}</strong></li>
              <li>Prime connectivity & world-class club amenities</li>
              <li>Exclusive early-bird pre-launch pricing valid this week</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://brokeros.io/project" style="background: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: 600; border-radius: 8px; display: inline-block;">Download Brochure & Price Sheet</a>
          </div>
          <p style="font-size: 13px; color: #71717a;">Warm regards,<br/><strong>{{agent.name}}</strong><br/>{{agent.phone}}</p>
        </div>
        <div style="background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5;">
          <p style="margin: 0;">If you prefer not to receive these updates, you can <a href="{{unsubscribeUrl}}" style="color: #71717a;">unsubscribe here</a>.</p>
        </div>
      </div>
    `,
  },
  {
    id: "price-drop",
    name: "Limited-Period Price Drop Alert",
    category: "PRICE_DROP",
    subject: "🚨 Price Drop Alert on {{project.name}} for Selected Units!",
    preview: "Save up to ₹5 Lakhs on upcoming inventory. Special discount available for 48 hours only.",
    icon: Tag,
    badge: "Urgent",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background: #b91c1c; padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 22px; font-weight: 700; margin: 0;">Special Inventory Price Reduction</h1>
        </div>
        <div style="padding: 32px 24px; color: #27272a; line-height: 1.6;">
          <p>Hello {{lead.firstName}},</p>
          <p>Great news! A limited selection of luxury units at <strong>{{project.name}}</strong> have just received an exclusive festive price reduction.</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-weight: 600;">⚡ Flash Offer: Prices starting from {{project.startingPrice}} for the next 48 hours only.</p>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://brokeros.io/units" style="background: #b91c1c; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: 600; border-radius: 8px; display: inline-block;">Lock Your Unit Now</a>
          </div>
          <p style="font-size: 13px; color: #71717a;">Best regards,<br/><strong>{{agent.name}}</strong></p>
        </div>
        <div style="background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5;">
          <a href="{{unsubscribeUrl}}" style="color: #71717a;">Unsubscribe</a>
        </div>
      </div>
    `,
  },
  {
    id: "site-visit",
    name: "VIP Site Visit Invitation",
    category: "SITE_VISIT",
    subject: "🚗 You're Invited: Experience {{project.name}} in Person",
    preview: "Complimentary private site tour with chauffeur pick-up available.",
    icon: Calendar,
    badge: "High Intent",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background: #047857; padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 22px; font-weight: 700; margin: 0;">Experience {{project.name}} First-Hand</h1>
        </div>
        <div style="padding: 32px 24px; color: #27272a; line-height: 1.6;">
          <p>Dear {{lead.firstName}},</p>
          <p>We would love to host you and your family for a private guided walk-through of the sample flat and show-residences at <strong>{{project.name}}</strong>.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://brokeros.io/schedule" style="background: #047857; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: 600; border-radius: 8px; display: inline-block;">Book Your VIP Site Visit</a>
          </div>
          <p style="font-size: 13px; color: #71717a;">Looking forward to meeting you,<br/><strong>{{agent.name}}</strong></p>
        </div>
        <div style="background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5;">
          <a href="{{unsubscribeUrl}}" style="color: #71717a;">Unsubscribe</a>
        </div>
      </div>
    `,
  },
  {
    id: "cp-scheme",
    name: "Channel Partner Commission Scheme",
    category: "CP_COMMISSION",
    subject: "🤝 Special Broker Commission Scheme for {{project.name}}",
    preview: "Earn up to 3.5% spot commission on all bookings closed this month.",
    icon: Award,
    badge: "CP Network",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background: #4338ca; padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 22px; font-weight: 700; margin: 0;">Channel Partner Commission Booster</h1>
        </div>
        <div style="padding: 32px 24px; color: #27272a; line-height: 1.6;">
          <p>Dear Partner,</p>
          <p>We are delighted to announce our highest-ever payout scheme on <strong>{{project.name}}</strong> for all bookings registered this month.</p>
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #3730a3; font-weight: 600;">💎 Spot Commission: 3.5% + ₹50,000 Milestone Bonus per 3 bookings.</p>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://brokeros.io/cp-portal" style="background: #4338ca; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: 600; border-radius: 8px; display: inline-block;">Register Your Clients</a>
          </div>
          <p style="font-size: 13px; color: #71717a;">Sourcing Team,<br/>BrokerOS Realty</p>
        </div>
        <div style="background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5;">
          <a href="{{unsubscribeUrl}}" style="color: #71717a;">Unsubscribe</a>
        </div>
      </div>
    `,
  },
];

interface EmailTemplatePickerProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (template: TemplateOption) => void;
}

export function EmailTemplatePicker({ selectedTemplateId, onSelectTemplate }: EmailTemplatePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {REAL_ESTATE_TEMPLATES.map((tmpl) => {
        const Icon = tmpl.icon;
        const isSelected = selectedTemplateId === tmpl.id;

        return (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              isSelected
                ? "border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 shadow-md ring-2 ring-sky-500/20"
                : "border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{tmpl.name}</h4>
                </div>

                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-full">
                  {tmpl.badge}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mb-3">{tmpl.preview}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                {tmpl.subject}
              </span>

              {isSelected && (
                <div className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Selected</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
