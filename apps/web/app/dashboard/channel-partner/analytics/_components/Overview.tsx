"use client";

import React from "react";
import {
  DollarSign,
  CheckCircle2,
  Key,
  Building2,
  Clock,
  Briefcase,
  Users,
  Target,
  Home,
} from "lucide-react";
import { Widget, SectionHeader, fmt } from "./shared";

export function Overview({ topWidgets }: { topWidgets: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Channel Partner Network Overview"
        subtitle="Key performance indicators across all managed CP developments."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Widget
          dark
          icon={<DollarSign size={18} />}
          label="Total Revenue"
          value={fmt(topWidgets.totalRevenue || 0)}
          accent="indigo"
        />
        <Widget
          icon={<CheckCircle2 size={18} />}
          label="Total Bookings"
          value={topWidgets.totalBookings || 0}
          accent="indigo"
        />
        <Widget
          icon={<Key size={18} />}
          label="Units Sold"
          value={topWidgets.totalUnitsSold || 0}
          accent="emerald"
          sub="Handover completed"
        />
        <Widget
          icon={<Building2 size={18} />}
          label="Units Reserved"
          value={topWidgets.totalUnitsReserved || 0}
          accent="sky"
        />
        <Widget
          icon={<Clock size={18} />}
          label="Handover Pending"
          value={topWidgets.totalHandoverPending || 0}
          accent="amber"
        />
        <Widget
          icon={<DollarSign size={18} />}
          label="Booking Revenue"
          value={fmt(topWidgets.totalBookingRevenue || 0)}
          accent="teal"
          sub="Token amounts"
        />
        <Widget
          icon={<Briefcase size={18} />}
          label="Broker Commission"
          value={fmt(topWidgets.totalCommission || 0)}
          accent="violet"
        />
        <Widget
          icon={<Users size={18} />}
          label="Active Brokers"
          value={topWidgets.totalBrokers || 0}
          accent="orange"
        />
        <Widget
          icon={<Target size={18} />}
          label="Total Leads"
          value={topWidgets.totalLeads || 0}
          accent="purple"
        />
        <Widget
          icon={<Home size={18} />}
          label="Site Visits Done"
          value={topWidgets.totalSiteVisits || 0}
          accent="rose"
          sub="Status: Completed"
        />
      </div>
    </section>
  );
}
