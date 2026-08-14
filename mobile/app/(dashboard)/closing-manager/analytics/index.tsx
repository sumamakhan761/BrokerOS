import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { authClient } from '../../../../lib/auth-client';

export default function ClosingAnalyticsScreen() {
  const [timeRange, setTimeRange] = useState("all-time");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAnalytics = useCallback(async () => {
      setStatus("loading");
      try {
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await authClient.$fetch(`/api/dashboard/closing-manager/analytics?range=${timeRange}`, { baseURL });
        if (res.error) throw new Error(res.error.message || "Failed to load analytics");
        setData(res.data);
        setStatus("success");
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Connection Error");
        setStatus("error");
      }
    }, [timeRange]);

  useEffect(() => {
    // Debounce to prevent concurrent SecureStore access on rapid taps (avoids navigation context errors)
    const timer = setTimeout(() => { fetchAnalytics(); }, 300);
    return () => clearTimeout(timer);
  }, [fetchAnalytics]);

  const ranges = ['weekly', 'monthly', 'yearly', 'all-time'];
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const renderHorizontalBarList = (items: any[], valueKey: string, nameKey: string, valueFormatter?: (v: any) => string) => {
    if (!items || items.length === 0) {
      return <Text className="text-sm text-slate-400 text-center py-8">No data available</Text>;
    }
    const maxVal = Math.max(...items.map(i => i[valueKey] || 0), 1);
    
    return (
      <View className="flex-col gap-3 mt-4">
        {items.map((item, idx) => {
          const widthPct = Math.max((item[valueKey] / maxVal) * 100, 2);
          const color = colors[idx % colors.length];
          const displayVal = valueFormatter ? valueFormatter(item[valueKey]) : item[valueKey];
          return (
            <View key={idx} className="flex-row items-center justify-between">
              <Text className="w-24 text-xs font-semibold text-slate-700" numberOfLines={1}>{item[nameKey]}</Text>
              <View className="flex-1 flex-row items-center ml-2 mr-2">
                <View className="h-2 rounded-full" style={{ width: `${widthPct}%`, backgroundColor: color }} />
              </View>
              <Text className="text-xs font-bold text-slate-900 min-w-[50px] text-right">{displayVal}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#f8fafc]" contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Header and Toggle */}
      <View className="mb-6">
        <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Closing Analytics</Text>
        <Text className="text-slate-500 text-sm font-medium mt-1">Monitor your closing pipeline & handovers.</Text>
      </View>

      {/* Time Range Segmented Control */}
      <View className="flex-row bg-slate-200 border-0 p-1.5 rounded-full self-start mb-6">
        {ranges.map(range => (
          <TouchableOpacity
            key={range}
            onPress={() => setTimeRange(range)}
          >
            <View 
              key={timeRange === range ? 'active' : 'inactive'}
              className={`px-4 py-1.5 rounded-full ${timeRange === range ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-sm font-bold ${timeRange === range ? 'text-slate-900' : 'text-slate-500'}`}>
                {range.charAt(0).toUpperCase() + range.slice(1).replace('-', ' ')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {status === "loading" && (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}

      {status === "error" && (
        <View className="bg-red-50 p-6 rounded-2xl border border-red-200 items-center my-10">
          <Feather name="alert-circle" size={32} color="#dc2626" />
          <Text className="text-red-600 font-bold text-lg mt-2">Failed to load Analytics</Text>
          <Text className="text-red-500 text-center mt-1 text-sm">{errorMsg}</Text>
        </View>
      )}

      {status === "success" && data && (
        <View className="space-y-6 flex-col gap-6">
          
          {/* Revenue Highlight Row */}
          <View className="bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
             <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/20 rounded-full" />
             <View className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
               <FontAwesome5 name="rupee-sign" size={16} color="#34d399" />
             </View>
             <Text className="text-xs text-slate-400 font-medium">Total Revenue Generated</Text>
             <Text className="text-3xl font-black text-white mt-1">₹{(data.topWidgets.totalRevenue || 0).toLocaleString('en-IN')}</Text>
          </View>

          {/* Top Row Widgets */}
          <View className="flex-row flex-wrap justify-between gap-y-4">
            <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="p-1.5 bg-blue-100 rounded-lg"><Feather name="check-circle" size={16} color="#3b82f6" /></View>
                <Text className="text-xs font-bold text-slate-500">Bookings</Text>
              </View>
              <Text className="text-2xl font-black text-slate-900">{data.topWidgets.totalBookings}</Text>
            </View>
            
            <View className="w-[48%] bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="p-1.5 bg-emerald-200 rounded-lg"><Feather name="home" size={16} color="#059669" /></View>
                <Text className="text-xs font-bold text-emerald-800/70">Units Sold</Text>
              </View>
              <Text className="text-2xl font-black text-emerald-900">{data.topWidgets.totalUnitsSold}</Text>
            </View>

            <View className="w-[48%] bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-sm">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="p-1.5 bg-amber-200 rounded-lg"><Feather name="key" size={16} color="#d97706" /></View>
                <Text className="text-xs font-bold text-amber-800/70">Handover Pending</Text>
              </View>
              <Text className="text-2xl font-black text-amber-900">{data.topWidgets.totalHandoverPending}</Text>
            </View>

            <View className="w-[48%] bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="p-1.5 bg-indigo-100 rounded-lg"><Feather name="users" size={16} color="#4f46e5" /></View>
                <Text className="text-xs font-bold text-slate-500">Brokers</Text>
              </View>
              <Text className="text-2xl font-black text-slate-900">{data.topWidgets.totalBrokers}</Text>
            </View>
          </View>

          {/* Chart Replacements */}
          <View className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <Text className="font-bold text-slate-900 mb-1">Project-wise Revenue</Text>
            {renderHorizontalBarList(data.charts?.projectWiseRevenue, 'revenue', 'name', (v) => `₹${Number(v).toLocaleString('en-IN')}`)}
          </View>

          <View className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <Text className="font-bold text-slate-900 mb-1">Broker-wise Revenue</Text>
            {renderHorizontalBarList(data.charts?.brokerWiseRevenue, 'revenue', 'name', (v) => `₹${Number(v).toLocaleString('en-IN')}`)}
          </View>

          <View className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <Text className="font-bold text-slate-900 mb-1">Project-wise Bookings</Text>
            {renderHorizontalBarList(data.charts?.projectWiseBookings, 'units', 'name', (v) => `${v} units`)}
          </View>

          {/* Cumulative Pipeline Funnel */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mt-2">
            <Text className="font-bold text-slate-900 mb-1">Pipeline (Cumulative)</Text>
            <Text className="text-xs text-slate-500 mb-4">Each stage includes units that have progressed to it or beyond.</Text>
            <View className="flex-col gap-2">
              <View className="flex-row items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Text className="font-semibold text-slate-700 text-sm">Confirmed Bookings</Text>
                <Text className="text-lg font-black text-slate-900">{data.funnel?.confirmed || 0}</Text>
              </View>
              <View className="items-center -my-2 z-10"><Feather name="arrow-down" size={16} color="#cbd5e1" /></View>
              <View className="flex-row items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Text className="font-semibold text-blue-700 text-sm">Documentation & Beyond</Text>
                <Text className="text-lg font-black text-blue-900">{data.funnel?.documentation || 0}</Text>
              </View>
              <View className="items-center -my-2 z-10"><Feather name="arrow-down" size={16} color="#93c5fd" /></View>
              <View className="flex-row items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <Text className="font-semibold text-indigo-700 text-sm">Loan/Agreement & Beyond</Text>
                <Text className="text-lg font-black text-indigo-900">{data.funnel?.loanAgreement || 0}</Text>
              </View>
              <View className="items-center -my-2 z-10"><Feather name="arrow-down" size={16} color="#a5b4fc" /></View>
              <View className="flex-row items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                <Text className="font-semibold text-amber-700 text-sm">Possession Pending & Beyond</Text>
                <Text className="text-lg font-black text-amber-900">{data.funnel?.possession || 0}</Text>
              </View>
              <View className="items-center -my-2 z-10"><Feather name="arrow-down" size={16} color="#fcd34d" /></View>
              <View className="flex-row items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <Text className="font-semibold text-emerald-700 text-sm">Handover Completed</Text>
                <Text className="text-lg font-black text-emerald-900">{data.funnel?.handover || 0}</Text>
              </View>
            </View>
          </View>

          {/* Highlights */}
          <View className="bg-orange-50 border border-amber-200 rounded-3xl p-5 shadow-sm mt-2">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="p-1.5 bg-amber-100 rounded-lg"><Feather name="star" size={16} color="#d97706" /></View>
              <Text className="font-bold text-amber-900">Most Selling Project</Text>
            </View>
            {data.mostSellingProject ? (
              <View>
                <Text className="text-xl font-black text-amber-950">{data.mostSellingProject.name}</Text>
                <Text className="text-xs font-semibold text-amber-800/70">{data.mostSellingProject.unitsSold} units sold</Text>
                <Text className="text-lg font-bold text-amber-900 mt-2">₹{data.mostSellingProject.revenue.toLocaleString('en-IN')}</Text>
              </View>
            ) : <Text className="text-sm text-amber-800">No project data</Text>}
          </View>

          {/* Top 5 Brokers Leaderboard */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mt-2">
            <View className="flex-row items-center gap-2 mb-4">
              <Feather name="award" size={18} color="#eab308" />
              <Text className="font-bold text-slate-900">Top 5 Brokers</Text>
            </View>
            <View className="flex-col gap-3">
              {data.top5Brokers?.map((broker: any) => (
                <View key={broker.rank} className="flex-row items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <View className="flex-row items-center gap-3">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                      broker.rank === 1 ? 'bg-yellow-100' :
                      broker.rank === 2 ? 'bg-slate-200' :
                      broker.rank === 3 ? 'bg-orange-100' : 'bg-slate-100'
                    }`}>
                      <Text className={`font-bold text-xs ${
                        broker.rank === 1 ? 'text-yellow-700' :
                        broker.rank === 2 ? 'text-slate-700' :
                        broker.rank === 3 ? 'text-orange-700' : 'text-slate-500'
                      }`}>#{broker.rank}</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-slate-900 text-sm">{broker.name}</Text>
                      <Text className="text-xs text-slate-500">{broker.unitsSold} units</Text>
                    </View>
                  </View>
                </View>
              ))}
              {(!data.top5Brokers || data.top5Brokers.length === 0) && (
                <Text className="text-sm text-slate-400 text-center py-4">No active brokers</Text>
              )}
            </View>
          </View>

        </View>
      )}
    </ScrollView>
  );
}

