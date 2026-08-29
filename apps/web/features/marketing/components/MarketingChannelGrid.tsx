"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Radio,
  Globe,
  ArrowRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { CampaignItem, SmsCampaignItem } from "../types";

export interface MarketingChannelGridProps {
  emailCampaigns: CampaignItem[];
  smsCampaigns: SmsCampaignItem[];
}

export function MarketingChannelGrid({
  emailCampaigns,
  smsCampaigns,
}: MarketingChannelGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
            Marketing Channels
          </h2>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Manage your outreach strategies and configure connected provider engines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Email Marketing Channel Card */}
        <Link
          href="/dashboard/marketing/email"
          className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Mail className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="success" className="text-[10px] font-bold">
                  Active Engine
                </Badge>
                <span className="text-[11px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {emailCampaigns.length} Active
                </span>
              </div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-purple-600 transition-colors">
              Email Marketing
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Broadcast project launches, price drops, and commission alerts with AWS SES, SendGrid, Brevo & Mailchimp.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Open Email Engine</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* SMS Channel Card */}
        <Link
          href="/dashboard/marketing/sms"
          className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <MessageSquare className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="success" className="text-[10px] font-bold">
                  Active Gateway
                </Badge>
                <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {smsCampaigns.length} Active
                </span>
              </div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-amber-600 transition-colors">
              SMS Broadcasts
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Fast promotional & transactional SMS routing via Twilio, AWS SNS, Sinch & Gupshup with DLT headers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>Open SMS Engine</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* WhatsApp Channel Card */}
        <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs opacity-90 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Radio className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <Badge variant="default" className="text-[10px] font-bold">
                Configured
              </Badge>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              WhatsApp Broadcasts
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Meta Cloud API & Interakt templates for instant site visit invites and brochure PDFs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Meta Business Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Portals & Ads Channel Card */}
        <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs opacity-90 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Globe className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <Badge variant="default" className="text-[10px] font-bold">
                Connected
              </Badge>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Portals & Meta Ads
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
              Automatic lead ingestion from 99acres, MagicBricks, and Facebook Lead Ads.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Real-time Ingestion</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
