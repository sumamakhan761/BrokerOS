import React from 'react';
import { View, Text } from 'react-native';
import { BookOpen, MapPin, DollarSign, Activity, TrendingUp, Users, Clock, Hash } from 'lucide-react-native';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export function CPDashboardWidgets({ kpis }: { kpis: any }) {
  if (!kpis) return null;

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-slate-800 mb-4 px-1">Performance Overview</Text>
      
      {/* 2 columns grid for mobile */}
      <View className="flex-row flex-wrap justify-between">
        
        {/* Total Bookings */}
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-3">
            <BookOpen size={20} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-black text-slate-900">{kpis.totalBookings}</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1">TOTAL BOOKINGS</Text>
        </View>

        {/* Units Sold */}
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mb-3">
            <Hash size={20} color="#6366f1" />
          </View>
          <Text className="text-2xl font-black text-slate-900">{kpis.totalUnitsSold}</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1">UNITS SOLD</Text>
        </View>

        {/* Booking Revenue */}
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-3">
            <DollarSign size={20} color="#10b981" />
          </View>
          <Text className="text-lg font-black text-slate-900">{formatCurrency(kpis.totalBookingRevenue || 0)}</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1">BOOKING REVENUE</Text>
        </View>

        {/* Total Revenue */}
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center mb-3">
            <TrendingUp size={20} color="#14b8a6" />
          </View>
          <Text className="text-lg font-black text-slate-900">{formatCurrency(kpis.totalRevenueGenerated || 0)}</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1">TOTAL REVENUE</Text>
        </View>

        {/* Broker Commission */}
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mb-3">
            <Activity size={20} color="#a855f7" />
          </View>
          <Text className="text-lg font-black text-slate-900">{formatCurrency(kpis.totalBrokerCommission || 0)}</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1">BROKER COMMISSION</Text>
        </View>

        {/* Total Brokers */}
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mb-3">
            <Users size={20} color="#f97316" />
          </View>
          <Text className="text-2xl font-black text-slate-900">{kpis.totalBrokers}</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1">TOTAL BROKERS</Text>
        </View>

        {/* Follow-ups Pending */}
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center mb-3">
            <Clock size={20} color="#f43f5e" />
          </View>
          <Text className="text-2xl font-black text-slate-900">{kpis.totalFollowsPending}</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1">FOLLOW-UPS</Text>
        </View>

        {/* Total Leads */}
        <View className="w-[48%] bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
          <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mb-3">
            <MapPin size={20} color="#64748b" />
          </View>
          <Text className="text-2xl font-black text-slate-900">{kpis.totalLeads}</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1">TOTAL LEADS</Text>
        </View>

      </View>
    </View>
  );
}
