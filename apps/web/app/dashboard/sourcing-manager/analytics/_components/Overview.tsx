"use client";

import React from "react";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Widget, SectionHeader, fmt } from "./shared";

export function Overview({ topWidgets }: { topWidgets: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Network KPIs & Deal Flow"
        subtitle="Key channel partner indicators and collective booking volume."
      />

      {/* Top Row KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Widget
          icon={<Users size={18} />}
          label="Active Brokers"
          value={topWidgets.totalBrokers || 0}
          accent="indigo"
        />
        <Widget
          icon={<CalendarCheck size={18} />}
          label="Partner Meetings"
          value={topWidgets.totalMeetings || 0}
          accent="purple"
        />
        <Widget
          icon={<CalendarDays size={18} />}
          label="Follow-ups Done"
          value={topWidgets.totalFollowUps || 0}
          accent="orange"
        />
        <Widget
          icon={<CheckCircle2 size={18} />}
          label="Deals Sourced"
          value={topWidgets.totalBookingsGenerated || 0}
          accent="emerald"
        />
      </div>

      {/* Revenue Highlight Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Widget
          dark
          icon={<DollarSign size={18} />}
          label="Total Booking Revenue (Tokens)"
          value={fmt(topWidgets.totalBookingRevenue || 0)}
          accent="slate"
        />

        <Widget
          icon={<Building2 size={18} />}
          label="Disbursed Broker Commission"
          value={fmt(topWidgets.totalBrokerCommissionPaid || 0)}
          accent="blue"
        />

        <Widget
          icon={<TrendingUp size={18} />}
          label="Revenue from Handovers"
          value={fmt(topWidgets.totalRevenueHandoverDone || 0)}
          accent="indigo"
        />
      </div>
    </section>
  );
}
