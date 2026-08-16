import React from 'react';
import { StatCard } from '@/components/analytics/StatCard';
import { DollarSign, Wallet, TrendingUp } from 'lucide-react';

export function FinancialOverview({ financialData }: { financialData: any }) {
  if (!financialData) return null;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Revenue (Sold)"
        value={formatter.format(financialData.totalRevenue)}
        subtitle="Locked-in Revenue"
        icon={DollarSign}
        delay={0.1}
      />
      <StatCard
        title="Realized Commission"
        value={formatter.format(financialData.realizedCommission)}
        subtitle="Earned from Sold Deals"
        icon={Wallet}
        delay={0.2}
      />
      <StatCard
        title="Projected Commission"
        value={formatter.format(financialData.projectedCommission)}
        subtitle="Pending from Reservations"
        icon={TrendingUp}
        delay={0.3}
      />
    </div>
  );
}

