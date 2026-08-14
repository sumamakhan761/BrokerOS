import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { DollarSign, CheckCircle, Clock } from 'lucide-react-native';

export function FinancialOverview({ financialData }: { financialData: any }) {
  if (!financialData) return null;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const cards = [
    {
      title: 'Total Revenue',
      amount: financialData.totalRevenue,
      subtitle: 'Locked-in Revenue',
      icon: <DollarSign size={20} color="#059669" />,
      color: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
    },
    {
      title: 'Realized Commission',
      amount: financialData.realizedCommission,
      subtitle: 'Earned from Sold Deals',
      icon: <CheckCircle size={20} color="#4f46e5" />,
      color: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      iconBg: 'bg-indigo-100',
    },
    {
      title: 'Projected Commission',
      amount: financialData.projectedCommission,
      subtitle: 'Pending from Reservations',
      icon: <Clock size={20} color="#d97706" />,
      color: 'bg-amber-50',
      textColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
    },
  ];

  return (
    <View className="mb-8">
      <Text className="text-lg font-bold text-slate-800 mb-4 px-6">Financial Overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
        {cards.map((card, idx) => (
          <View key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 w-72">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</Text>
              <View className={`w-8 h-8 rounded-full items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </View>
            </View>
            <Text className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              {formatter.format(card.amount || 0)}
            </Text>
            <View className={`self-start px-2 py-1 rounded ${card.color}`}>
              <Text className={`text-[10px] font-bold ${card.textColor}`}>{card.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
