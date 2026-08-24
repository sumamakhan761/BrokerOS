"use client";

import React from "react";
import {
  Users,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Key,
  Home,
  Briefcase,
  Building2,
} from "lucide-react";
import { Widget, SectionHeader, fmt } from "./shared";

export function Overview({ topWidgets }: { topWidgets: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Closing Overview & Financial Performance"
        subtitle="Key performance metrics, deals concluded, and aggregate revenue."
      />

      {/* Top Row KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Widget
          dark
          icon={<DollarSign size={18} />}
          label="Total Revenue Generated"
          value={fmt(topWidgets.totalRevenue || 0)}
          accent="slate"
        />
        <Widget
          icon={<CheckCircle2 size={18} />}
          label="Confirmed Bookings"
          value={topWidgets.totalBookings || 0}
          accent="blue"
          sub={`₹${(topWidgets.totalBookingAmount || 0).toLocaleString("en-IN")} token collected`}
        />
        <Widget
          icon={<Users size={18} />}
          label="Brokers Active"
          value={topWidgets.totalBrokers || 0}
          accent="indigo"
        />
        <Widget
          icon={<CalendarDays size={18} />}
          label="Follow-ups Logged"
          value={topWidgets.totalFollowUps || 0}
          accent="orange"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Widget
          icon={<Home size={18} />}
          label="Units Sold"
          value={topWidgets.totalUnitsSold || 0}
          accent="emerald"
        />
        <Widget
          icon={<Key size={18} />}
          label="Handover Pending"
          value={topWidgets.totalHandoverPending || 0}
          accent="amber"
        />
        <Widget
          icon={<Building2 size={18} />}
          label="Units Reserved"
          value={topWidgets.totalUnitsReserved || 0}
          accent="slate"
        />
        <Widget
          icon={<Briefcase size={18} />}
          label="Broker Commission"
          value={fmt(topWidgets.totalCommission || 0)}
          accent="purple"
        />
      </div>
    </section>
  );
}
