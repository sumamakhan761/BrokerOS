import React from 'react';
import { View } from 'react-native';
import { StatCard } from './StatCard';

export interface PostSalesAnalyticsWidgetsData {
  totalBooked: number;
  totalHandoverCompleted: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRate: string;
}

export function PostSalesAnalyticsWidgets({ widgets }: { widgets: PostSalesAnalyticsWidgetsData }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  return (
    <View className="flex-row flex-wrap justify-between">
      <StatCard
        title="Total Booked"
        value={widgets.totalBooked}
        icon="users"
        delay={0.1}
      />
      <StatCard
        title="Handover Completed"
        value={widgets.totalHandoverCompleted}
        icon="key"
        delay={0.2}
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(widgets.totalRevenue)}
        icon="dollar-sign"
        delay={0.3}
      />
      <StatCard
        title="Total Commission"
        value={formatCurrency(widgets.totalCommission)}
        icon="gift"
        delay={0.4}
      />
      <StatCard
        title="Conversion Rate"
        value={`${widgets.conversionRate}%`}
        icon="trending-up"
        delay={0.5}
      />
    </View>
  );
}
