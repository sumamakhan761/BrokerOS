import React from "react";
import { Users, Key, IndianRupee, Wallet, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";

export interface PostSalesAnalyticsWidgetsData {
  totalBooked: number;
  totalHandoverCompleted: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRate: string;
}

export function PostSalesAnalyticsWidgets({ widgets }: { widgets: PostSalesAnalyticsWidgetsData }) {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const widgetData = [
    { label: "Booked Customers", value: widgets.totalBooked, icon: Users },
    { label: "Handover Complete", value: widgets.totalHandoverCompleted, icon: Key },
    { label: "Total Revenue", value: formatCurrency(widgets.totalRevenue), icon: IndianRupee },
    { label: "Total Commission", value: formatCurrency(widgets.totalCommission), icon: Wallet },
    { label: "Conversion Rate", value: `${widgets.conversionRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {widgetData.map((w, i) => (
        <StatCard
          key={w.label}
          title={w.label}
          value={w.value}
          icon={w.icon}
          delay={i * 0.1}
        />
      ))}
    </div>
  );
}
