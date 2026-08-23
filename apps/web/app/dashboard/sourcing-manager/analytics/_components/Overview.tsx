import React from "react";
import { Users, CalendarCheck, CalendarDays, CheckCircle2, DollarSign, Building2, TrendingUp } from "lucide-react";
import { Widget, SectionHeader, fmt } from "./shared";

export function Overview({ topWidgets }: { topWidgets: any }) {
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="Overview" subtitle="Key performance indicators and overall revenue." />
      
      {/* Top Row KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Widget icon={<Users size={20} />} label="Brokers" value={topWidgets.totalBrokers || 0} accent="indigo" />
        <Widget icon={<CalendarCheck size={20} />} label="Meetings" value={topWidgets.totalMeetings || 0} accent="purple" />
        <Widget icon={<CalendarDays size={20} />} label="Follow-ups" value={topWidgets.totalFollowUps || 0} accent="orange" />
        <Widget icon={<CheckCircle2 size={20} />} label="Bookings" value={topWidgets.totalBookingsGenerated || 0} accent="emerald" />
      </div>

      {/* Revenue Highlight Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Widget 
          dark 
          icon={<DollarSign size={20} />} 
          label="Total Booking Revenue (Tokens)" 
          value={fmt(topWidgets.totalBookingRevenue || 0)} 
          accent="slate" 
        />
        
        <Widget 
          icon={<Building2 size={20} />} 
          label="Commission Paid" 
          value={fmt(topWidgets.totalBrokerCommissionPaid || 0)} 
          accent="blue" 
        />
        
        <Widget 
          icon={<TrendingUp size={20} />} 
          label="Revenue (Handover Done)" 
          value={fmt(topWidgets.totalRevenueHandoverDone || 0)} 
          accent="indigo" 
        />
      </div>
    </section>
  );
}
