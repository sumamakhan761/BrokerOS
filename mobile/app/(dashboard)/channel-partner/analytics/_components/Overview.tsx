import React from "react";
import { ScrollView } from "react-native";
import { DollarSign, CheckCircle2, Key, Building2 } from "lucide-react-native";
import { Widget, SectionHeader, fmt } from "./shared";

export function Overview({ topWidgets }: { topWidgets: any }) {
  return (
    <>
      <SectionHeader title="Overview" subtitle="Key performance indicators." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        <Widget dark icon={<DollarSign size={20} color="#818cf8" />} label="Total Revenue" value={fmt(topWidgets.totalRevenue || 0)} accent="indigo" />
        <Widget icon={<CheckCircle2 size={20} color="#4f46e5" />} label="Total Bookings" value={topWidgets.totalBookings || 0} accent="indigo" />
        <Widget icon={<Key size={20} color="#059669" />} label="Units Sold" value={topWidgets.totalUnitsSold || 0} accent="emerald" sub="Handover completed" />
        <Widget icon={<Building2 size={20} color="#0284c7" />} label="Units Reserved" value={topWidgets.totalUnitsReserved || 0} accent="sky" />
        <Widget icon={<DollarSign size={20} color="#0d9488" />} label="Booking Revenue" value={fmt(topWidgets.totalBookingRevenue || 0)} accent="teal" />
      </ScrollView>
    </>
  );
}
