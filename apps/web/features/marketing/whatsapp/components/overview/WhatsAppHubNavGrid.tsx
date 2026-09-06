'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  TrendingUp,
  Send,
  Zap,
  Sparkles,
  Users,
  Settings,
  ArrowRight,
} from 'lucide-react';

export const WhatsAppHubNavGrid: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Feature Hub Grid Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/marketing/whatsapp/inbox"
          className="p-5 bg-bg-surface border border-border-default rounded-2xl hover:border-emerald-500 hover:shadow-xs transition-all group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Unified Live Inbox</h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Real-time two-way WhatsApp chat, quick replies, and AI drafts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <span>Open Inbox</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/marketing/whatsapp/pipelines"
          className="p-5 bg-bg-surface border border-border-default rounded-2xl hover:border-blue-500 hover:shadow-xs transition-all group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Pipelines & Deals</h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Visual Kanban deal stages connected directly to WhatsApp leads
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
            <span>View Pipelines</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/marketing/whatsapp/broadcasts"
          className="p-5 bg-bg-surface border border-border-default rounded-2xl hover:border-brand-500 hover:shadow-xs transition-all group flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Broadcast Campaigns</h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Send official Meta HSM broadcasts to filtered audiences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-brand-600">
            <span>View Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Secondary Hub Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/marketing/whatsapp/automations"
          className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl hover:border-amber-500 hover:bg-bg-subtle transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-xs font-bold text-text-primary block">Automations</span>
              <span className="text-[10px] text-text-muted">Keyword triggers & tree logic</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
        </Link>

        <Link
          href="/dashboard/marketing/whatsapp/flows"
          className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl hover:border-purple-500 hover:bg-bg-subtle transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <div>
              <span className="text-xs font-bold text-text-primary block">Flow Bots</span>
              <span className="text-[10px] text-text-muted">Interactive button & list bots</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
        </Link>

        <Link
          href="/dashboard/marketing/whatsapp/contacts"
          className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl hover:border-brand-500 hover:bg-bg-subtle transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-brand-600" />
            <div>
              <span className="text-xs font-bold text-text-primary block">Contacts & Tags</span>
              <span className="text-[10px] text-text-muted">Lead directory & custom fields</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
        </Link>

        <Link
          href="/dashboard/marketing/whatsapp/settings"
          className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl hover:border-slate-500 hover:bg-bg-subtle transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-slate-500" />
            <div>
              <span className="text-xs font-bold text-text-primary block">Settings & AI</span>
              <span className="text-[10px] text-text-muted">WABA credentials & prompts</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
        </Link>
      </div>
    </div>
  );
};
