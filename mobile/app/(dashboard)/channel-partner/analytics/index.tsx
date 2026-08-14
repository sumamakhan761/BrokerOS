import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { authClient } from "../../../../lib/auth-client";
import { AlertCircle } from "lucide-react-native";
import { Overview } from "./_components/Overview";
import { BookingFunnel } from "./_components/BookingFunnel";
import { RevenueCharts } from "./_components/RevenueCharts";
import { InventoryAnalytics } from "./_components/InventoryAnalytics";
import { BrokerPerformance } from "./_components/BrokerPerformance";
import { SMLeaderboard } from "./_components/SMLeaderboard";
import { CMLeaderboard } from "./_components/CMLeaderboard";
import { ConversionAnalytics } from "./_components/ConversionAnalytics";
import { BrokerageSettlement } from "./_components/BrokerageSettlement";
import { SiteVisitAnalytics } from "./_components/SiteVisitAnalytics";

export default function CPAnalyticsMobile() {
  const [range, setRange] = useState("all-time");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);

  const ranges = ["weekly", "monthly", "yearly", "all-time"];

  const load = useCallback(async () => {
      setStatus("loading");
      try {
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await authClient.$fetch(`/api/dashboard/channel-partner/analytics?range=${range}`, { baseURL });
        setData((res as any)?.data || res);
        setStatus("success");
      } catch (err: any) {
        console.log("Analytics Error", err);
        setStatus("error");
      }
    }, [range]);

  useEffect(() => {
    // Debounce to prevent concurrent SecureStore access on rapid taps (avoids navigation context errors)
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header & Filter */}
      <View className="mb-6">
        <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">CP Analytics</Text>
        <Text className="text-slate-500 text-sm font-medium mt-1">Deep dive into your channel partner business performance.</Text>

        {/* Time Range Segmented Control */}
        <View className="flex-row bg-slate-200 border-0 p-1.5 rounded-full self-start mt-4">
          {ranges.map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
            >
              <View 
                key={range === r ? 'active' : 'inactive'}
                className={`px-4 py-1.5 rounded-full ${range === r ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`text-sm font-bold ${range === r ? 'text-slate-900' : 'text-slate-500'}`}>
                  {r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ")}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {status === "loading" && (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}

      {status === "error" && (
        <View className="flex-1 items-center justify-center py-20 bg-red-50 rounded-3xl border border-red-100 p-6">
          <AlertCircle size={40} color="#ef4444" className="mb-3" />
          <Text className="text-xl font-bold text-red-600 mb-1">Failed to Load</Text>
          <Text className="text-red-500 text-sm text-center">Check your connection or backend status.</Text>
        </View>
      )}

      {status === "success" && data && (
        <View>
          <Overview topWidgets={data.topWidgets} />
          <BookingFunnel bookingFunnel={data.bookingFunnel} />
          <RevenueCharts revenueCharts={data.revenueCharts} />
          <InventoryAnalytics inventoryAnalytics={data.inventoryAnalytics} />
          <BrokerPerformance brokerPerformance={data.brokerPerformance} />
          <SMLeaderboard smLeaderboard={data.smLeaderboard} />
          <CMLeaderboard cmLeaderboard={data.cmLeaderboard} />
          <ConversionAnalytics conversionRates={data.conversionRates} />
          <BrokerageSettlement brokerageSettlement={data.brokerageSettlement} />
          <SiteVisitAnalytics siteVisitAnalytics={data.siteVisitAnalytics} />
        </View>
      )}
    </ScrollView>
  );
}
