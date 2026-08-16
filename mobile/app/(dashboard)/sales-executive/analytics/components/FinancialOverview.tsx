import React from 'react';
import { View, Text } from 'react-native';
import { StatCard } from '../../../../components/analytics/StatCard';

export function FinancialOverview({ financialData }: { financialData: any }) {
  if (!financialData) return null;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <View className="mb-8 px-6">
      <Text className="text-lg font-bold text-slate-800 mb-4">Financial Overview</Text>
      <View className="flex-row flex-wrap justify-between">
        <StatCard
          title="Total Revenue (Sold)"
          value={formatter.format(financialData.totalRevenue || 0)}
          subtitle="Locked-in Revenue"
          icon="dollar-sign"
          delay={0.1}
        />
        <StatCard
          title="Realized Commission"
          value={formatter.format(financialData.realizedCommission || 0)}
          subtitle="Earned from Sold Deals"
          icon="check-circle"
          delay={0.2}
        />
        <StatCard
          title="Projected Commission"
          value={formatter.format(financialData.projectedCommission || 0)}
          subtitle="Pending from Reservations"
          icon="clock"
          delay={0.3}
        />
      </View>
    </View>
  );
}
