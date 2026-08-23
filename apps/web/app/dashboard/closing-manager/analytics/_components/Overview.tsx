import React from "react";
import { Users, CalendarDays, CheckCircle2, DollarSign, Key, Home, Briefcase, Building2 } from "lucide-react";
import { Widget, SectionHeader, fmt } from "./shared";

export function Overview({ topWidgets }: { topWidgets: any }) {
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="Overview" subtitle="Key performance indicators and overall revenue." />
      
      {/* Top Row KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Widget 
          dark 
          icon={<DollarSign size={20} />} 
          label="Total Revenue" 
          value={fmt(topWidgets.totalRevenue || 0)} 
          accent="slate" 
        />
        <Widget 
          icon={<CheckCircle2 size={20} />} 
          label="Total Bookings" 
          value={topWidgets.totalBookings || 0} 
          accent="blue" 
          sub={`₹${(topWidgets.totalBookingAmount || 0).toLocaleString('en-IN')} amount`}
        />
        <Widget icon={<Users size={20} />} label="Brokers" value={topWidgets.totalBrokers || 0} accent="indigo" />
        <Widget icon={<CalendarDays size={20} />} label="Follow-ups" value={topWidgets.totalFollowUps || 0} accent="orange" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Widget icon={<Home size={20} />} label="Units Sold" value={topWidgets.totalUnitsSold || 0} accent="emerald" />
        <Widget icon={<Key size={20} />} label="Handover Pending" value={topWidgets.totalHandoverPending || 0} accent="amber" />
        <Widget icon={<Building2 size={20} />} label="Units Reserved" value={topWidgets.totalUnitsReserved || 0} accent="slate" />
        <Widget icon={<Briefcase size={20} />} label="Total Commission" value={fmt(topWidgets.totalCommission || 0)} accent="purple" />
      </div>
    </section>
  );
}
