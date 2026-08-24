"use client";

import React from "react";
import { StatCard } from "@/components/analytics/StatCard";
import { IndianRupee, Wallet, TrendingUp } from "lucide-react";

export function FinancialOverview({ financialData }: { financialData: any }) {
  if (!financialData) return null;

  const formatINR = (val: number) => {
    return `₹${Number(val || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
      <StatCard
        title="Total Revenue (Sold)"
        value={formatINR(financialData.totalRevenue)}
        subtitle="Locked-in Gross Booking Value"
        icon={IndianRupee}
        delay={0.05}
      />
      <StatCard
        title="Realized Commission"
        value={formatINR(financialData.realizedCommission)}
        subtitle="Earned from Confirmed Bookings"
        icon={Wallet}
        delay={0.1}
      />
      <StatCard
        title="Projected Commission"
        value={formatINR(financialData.projectedCommission)}
        subtitle="Pipeline from Active Negotiations"
        icon={TrendingUp}
        delay={0.15}
      />
    </div>
  );
}
