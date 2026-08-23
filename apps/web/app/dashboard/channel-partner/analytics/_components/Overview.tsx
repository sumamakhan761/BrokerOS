import React from "react";
import { DollarSign, CheckCircle2, Key, Building2, Clock, Briefcase, Users, Target, Home } from "lucide-react";
import { Widget, SectionHeader, fmt } from "./shared";

export function Overview({ topWidgets }: { topWidgets: any }) {
  return (
    <section>
      <SectionHeader title="Overview" subtitle="Key performance indicators across all CP projects." />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Widget dark icon={<DollarSign size={20} />} label="Total Revenue" value={fmt(topWidgets.totalRevenue || 0)} accent="indigo" />
        <Widget icon={<CheckCircle2 size={20} />} label="Total Bookings" value={topWidgets.totalBookings || 0} accent="indigo" />
        <Widget icon={<Key size={20} />} label="Units Sold" value={topWidgets.totalUnitsSold || 0} accent="emerald" sub="Handover completed" />
        <Widget icon={<Building2 size={20} />} label="Units Reserved" value={topWidgets.totalUnitsReserved || 0} accent="sky" />
        <Widget icon={<Clock size={20} />} label="Handover Pending" value={topWidgets.totalHandoverPending || 0} accent="amber" />
        <Widget icon={<DollarSign size={20} />} label="Booking Revenue" value={fmt(topWidgets.totalBookingRevenue || 0)} accent="teal" sub="Token amounts" />
        <Widget icon={<Briefcase size={20} />} label="Commission" value={fmt(topWidgets.totalCommission || 0)} accent="violet" />
        <Widget icon={<Users size={20} />} label="Active Brokers" value={topWidgets.totalBrokers || 0} accent="orange" />
        <Widget icon={<Target size={20} />} label="Total Leads" value={topWidgets.totalLeads || 0} accent="purple" />
        <Widget icon={<Home size={20} />} label="Site Visits Done" value={topWidgets.totalSiteVisits || 0} accent="rose" sub="Status: Completed" />
      </div>
    </section>
  );
}
