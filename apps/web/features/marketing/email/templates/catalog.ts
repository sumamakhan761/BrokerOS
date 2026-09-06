// ============================================================================
// BrokerOS — Marketing Email Templates Catalog & Metadata Registry
// ============================================================================

import React from "react";
import { Building, Flame, Car, Users } from "lucide-react";
import { PROJECT_LAUNCH_HTML } from "./project-launch.html";
import { PRICE_DROP_HTML } from "./price-drop.html";
import { SITE_VISIT_HTML } from "./site-visit.html";
import { CP_SCHEME_HTML } from "./cp-scheme.html";

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
    htmlContent: PROJECT_LAUNCH_HTML,
  },
  {
    id: "price-drop",
    name: "Limited-Time Price & Inventory Alert",
    category: "OFFERS",
    subject: "🚨 Price Advantage Alert: Limited Units at {{project.name}}",
    preview: "Spot discount + zero stamp duty on select 2 & 3 BHK residences this week.",
    icon: Flame,
    badge: "High Urgency",
    htmlContent: PRICE_DROP_HTML,
  },
  {
    id: "site-visit",
    name: "Concierge VIP Site Visit Invitation",
    category: "SITE_VISIT",
    subject: "🚗 Private Invitation: Experience {{project.name}} in Person",
    preview: "Complimentary chauffeured pickup & guided sample flat tour for your family.",
    icon: Car,
    badge: "High Intent",
    htmlContent: SITE_VISIT_HTML,
  },
  {
    id: "cp-scheme",
    name: "Channel Partner Commission Booster",
    category: "CHANNEL_PARTNER",
    subject: "🤝 Spot Payout Scheme: 3.5% Commission on {{project.name}}",
    preview: "3.5% spot payouts + ₹50,000 milestone bonus for closed registrations this month.",
    icon: Users,
    badge: "Broker Network",
    htmlContent: CP_SCHEME_HTML,
  },
];
