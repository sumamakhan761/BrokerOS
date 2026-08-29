"use client";

import React from "react";
import { Sparkles, Building, Flame, Car, Users, Check } from "lucide-react";

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
    name: "Flagship Project / Tower Launch",
    category: "PROJECT_LAUNCH",
    subject: "✨ Exclusive Pre-Launch Access: {{project.name}} is Now Open",
    preview: "First-look floor plans, starting from {{project.startingPrice}} at {{project.location}}.",
    icon: Building,
    badge: "Highest Converting",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exclusive Project Launch</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Hero Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 32px; text-align: center;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; padding: 6px 14px; background-color: rgba(217, 119, 6, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 999px; color: #fbbf24; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px;">
                      ✦ Private Pre-Launch Preview ✦
                    </span>
                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; line-height: 1.25; margin: 0 0 10px 0; letter-spacing: -0.02em;">
                      {{project.name}}
                    </h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">
                      Prime Luxury Residences at <strong style="color: #e2e8f0;">{{project.location}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 24px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                Dear {{lead.firstName}},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569;">
                As a valued prospective homeowner, we are privileged to extend you priority access to the official pre-launch of <strong>{{project.name}}</strong>. Before public opening, you are invited to select premier inventory with panoramic horizon views and exclusive early-allotment pricing.
              </p>

              <!-- Highlight Box / Key Specs Grid -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Starting Price</div>
                          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">{{project.startingPrice}}</div>
                        </td>
                        <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Prime Location</div>
                          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">{{project.location}}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Configurations</div>
                          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">2, 3 & 4 BHK Luxury Suites</div>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Exclusive Club</div>
                          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">30+ World-Class Amenities</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Project Bullet Points -->
              <p style="margin: 0 0 12px 0; font-weight: 700; color: #0f172a;">
                What sets {{project.name}} apart:
              </p>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #475569;">
                    ✓ <strong>Unmatched Connectivity:</strong> Seamless access to key business hubs, airports & top international schools.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #475569;">
                    ✓ <strong>Resort-Style Architecture:</strong> Sky lounge, Olympic-length infinity pool, and 70% open green landscapes.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #475569;">
                    ✓ <strong>Pre-Launch Guarantee:</strong> Zero price escalation and locked spot-booking advantages.
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://yourdomain.com/brochure" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35); letter-spacing: 0.02em;">
                      Download Official Brochure & Price Sheet →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Agent Signature Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      Direct Project Representative:
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
                      <strong style="color: #334155;">{{agent.name}}</strong> | Direct Line: <strong style="color: #7c3aed;">{{agent.phone}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">
                RERA Registered Development. All renderings and specifications are indicative.
              </p>
              <p style="margin: 0;">
                You received this email because you expressed interest in premium properties. 
                <a href="{{unsubscribeUrl}}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> anytime.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "price-drop",
    name: "Limited-Time Price & Inventory Alert",
    category: "OFFERS",
    subject: "🚨 Price Advantage Alert: Limited Units at {{project.name}}",
    preview: "Spot discount + zero stamp duty on select 2 & 3 BHK residences this week.",
    icon: Flame,
    badge: "High Urgency",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Limited Time Price Alert</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #fee2e2; box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.08);">
          
          <!-- Urgent Alert Header -->
          <tr>
            <td style="background-color: #881337; padding: 36px 32px; text-align: center;">
              <span style="display: inline-block; padding: 5px 12px; background-color: #be123c; border-radius: 999px; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                ⚡ 48-Hour Spot Booking Window
              </span>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 6px 0;">
                Exclusive Price Advantage: {{project.name}}
              </h1>
              <p style="color: #fecdd3; font-size: 14px; margin: 0;">
                Save up to ₹5.0 Lakhs on select premium inventory
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                Hello {{lead.firstName}},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569;">
                For the next 48 hours, our developer partners have released a private allocation of high-floor residences at <strong>{{project.name}}</strong> with a guaranteed spot discount and flexible payment timeline.
              </p>

              <!-- Benefits Card -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9f1239;">Special Festive Price</div>
                          <div style="font-size: 20px; font-weight: 800; color: #881337; margin-top: 2px;">Starting from {{project.startingPrice}}*</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #4c0519; line-height: 1.5;">
                          🎁 <strong>Zero Stamp Duty</strong> for the first 10 confirmed spot bookings.<br>
                          🎁 <strong>Complimentary Modular Kitchen</strong> and Italian marble upgrades.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://yourdomain.com/discounts" target="_blank" style="display: inline-block; background-color: #e11d48; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
                      Lock Your Festive Discount & Inventory Sheet →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      Connect directly with our closing desk:
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
                      {{agent.name}} • <strong style="color: #e11d48;">{{agent.phone}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6;">
              <p style="margin: 0;">
                *Prices subject to unit availability. Terms & conditions apply. 
                <a href="{{unsubscribeUrl}}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "site-visit",
    name: "Concierge VIP Site Visit Invitation",
    category: "SITE_VISIT",
    subject: "🚗 Private Invitation: Experience {{project.name}} in Person",
    preview: "Complimentary chauffeured pickup & guided sample flat tour for your family.",
    icon: Car,
    badge: "High Intent",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIP Site Visit Invitation</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #064e3b; padding: 36px 32px; text-align: center;">
              <span style="display: inline-block; padding: 5px 12px; background-color: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 999px; color: #6ee7b7; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                ✦ Concierge Experience ✦
              </span>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 6px 0;">
                You Are Invited to {{project.name}}
              </h1>
              <p style="color: #a7f3d0; font-size: 14px; margin: 0;">
                Private walkthrough of our designer show residence at {{project.location}}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                Dear {{lead.firstName}},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569;">
                Pictures only reveal part of the story. We would love to host you and your family for a private, guided walkthrough of <strong>{{project.name}}</strong> to experience the panoramic natural light, expansive layouts, and completed club amenities firsthand.
              </p>

              <!-- 3-Step Experience -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                      Your VIP Tour Includes:
                    </div>
                    <div style="font-size: 13px; color: #14532d; line-height: 1.6;">
                      1. <strong>Chauffeur Pick-Up & Drop:</strong> Complimentary private car service from your residence.<br>
                      2. <strong>Designer Sample Flat:</strong> Walkthrough of furnished 2, 3 & 4 BHK layouts.<br>
                      3. <strong>Bespoke Pricing Consultation:</strong> 1-on-1 discussion on payment plans and custom unit alterations.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://yourdomain.com/schedule-visit" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);">
                      Schedule Your Private VIP Site Tour →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      Your Dedicated Concierge Manager:
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
                      {{agent.name}} • Direct Hotline: <strong style="color: #059669;">{{agent.phone}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0;">
                All site visits adhere to safety and security standards. 
                <a href="{{unsubscribeUrl}}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "cp-scheme",
    name: "Channel Partner Commission Booster",
    category: "CHANNEL_PARTNER",
    subject: "🤝 Spot Payout Scheme: 3.5% Commission on {{project.name}}",
    preview: "3.5% spot payouts + ₹50,000 milestone bonus for closed registrations this month.",
    icon: Users,
    badge: "Broker Network",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Channel Partner Commission Scheme</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e0e7ff; box-shadow: 0 10px 25px -5px rgba(67, 56, 202, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1e1b4b; padding: 36px 32px; text-align: center;">
              <span style="display: inline-block; padding: 5px 12px; background-color: rgba(99, 102, 241, 0.25); border: 1px solid rgba(99, 102, 241, 0.5); border-radius: 999px; color: #c7d2fe; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                ✦ Channel Partner Network ✦
              </span>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.25; margin: 0 0 6px 0;">
                3.5% Spot Brokerage on {{project.name}}
              </h1>
              <p style="color: #c7d2fe; font-size: 14px; margin: 0;">
                Exclusive Partner Incentive Structure • Valid for Active Registrations
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                Dear Partner Broker,
              </p>
              <p style="margin: 0 0 20px 0; color: #475569;">
                We are thrilled to roll out our enhanced Channel Partner Commission Matrix for <strong>{{project.name}}</strong>. Help your high-net-worth buyers secure prime inventory while you earn guaranteed spot payouts within 7 working days.
              </p>

              <!-- Commission Structure Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; font-weight: 800; color: #3730a3; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                      Commission Highlights & Fast Payouts:
                    </div>
                    <div style="font-size: 13px; color: #312e81; line-height: 1.6;">
                      ✦ <strong>3.5% Spot Payout:</strong> Released upon 10% payment milestone & Agreement.<br>
                      ✦ <strong>₹50,000 Milestone Bonus:</strong> On closing 3 or more bookings this month.<br>
                      ✦ <strong>90-Day Lead Protection:</strong> Register your client on the portal with full tag protection.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://yourdomain.com/partner-portal" target="_blank" style="display: inline-block; background-color: #4338ca; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(67, 56, 202, 0.35);">
                      Register Your Client on Partner Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Sourcing Manager Signature -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                      Dedicated Sourcing Manager:
                    </p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
                      {{agent.name}} • Direct Hotline: <strong style="color: #4338ca;">{{agent.phone}}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0;">
                Confidential to registered Channel Partners. 
                <a href="{{unsubscribeUrl}}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];

interface EmailTemplatePickerProps {
  selectedTemplateId: string;
  onSelectTemplate: (tmpl: TemplateOption) => void;
}

export function EmailTemplatePicker({
  selectedTemplateId,
  onSelectTemplate,
}: EmailTemplatePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {REAL_ESTATE_TEMPLATES.map((tmpl) => {
        const isSelected = selectedTemplateId === tmpl.id;
        const Icon = tmpl.icon;

        return (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl)}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.99] flex flex-col justify-between ${
              isSelected
                ? "bg-purple-50/60 border-[var(--brand-500)] shadow-xs ring-2 ring-purple-500/15"
                : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-[var(--brand-600)] text-white shadow-xs"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-[var(--text-primary)]">
                    {tmpl.name}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-[var(--brand-600)] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tmpl.badge}
                </span>
              </div>

              <p className="text-[11px] font-medium text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
                {tmpl.preview}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-muted)] truncate max-w-[200px]">
                {tmpl.subject}
              </span>
              {isSelected ? (
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-[var(--brand-600)]">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Selected</span>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  Select &rarr;
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
