import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { authClient } from '../../../lib/auth-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SharedWidgetsGrid } from '../../../components/shared/SharedWidgetsGrid';
import { CheckCircle, Home, Users, Briefcase, TrendingUp, DollarSign } from 'lucide-react-native';

export default function ClosingManagerScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"DOCUMENTS" | "LOANS" | "AGREEMENTS" | "HANDOVERS" | "FOLLOW_UPS">("DOCUMENTS");

  useEffect(() => {
    async function fetchData() {
      try {
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await authClient.$fetch('/api/dashboard/closing-manager', { baseURL });
        setData(res?.data);
      } catch (err: any) {
        setError(err?.response?.status === 403 ? "Access Denied (403)" : "Connection Error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 bg-[#f8fafc] p-6 items-center justify-center">
        <View className="bg-red-50 p-6 rounded-2xl border border-red-200 items-center w-full">
          <Feather name="alert-circle" size={32} color="#dc2626" />
          <Text className="text-red-600 font-bold text-lg mt-2">Dashboard Error</Text>
          <Text className="text-red-500 text-center mt-1">{error || "Failed to load"}</Text>
        </View>
      </View>
    );
  }

  const { widgets, lists } = data;
  const documents = lists?.documentPending || [];
  const loans = lists?.loanPending || [];
  const agreements = lists?.agreementPending || [];
  const handovers = lists?.handoverPending || [];
  const followUps = lists?.todayFollowups || [];

  const renderActiveList = () => {
    let items: any[] = [];
    let iconName: any = "file-text";
    let iconColor = "#6366f1"; // indigo
    let iconBg = "bg-indigo-100";
    let emptyMsg = "";

    if (activeTab === "DOCUMENTS") {
      items = documents;
      emptyMsg = "No documents pending.";
      iconName = "file-text";
    } else if (activeTab === "LOANS") {
      items = loans;
      emptyMsg = "No loans pending.";
      iconName = "dollar-sign";
      iconColor = "#3b82f6"; // blue
      iconBg = "bg-blue-100";
    } else if (activeTab === "AGREEMENTS") {
      items = agreements;
      emptyMsg = "No agreements pending.";
      iconName = "edit-3";
      iconColor = "#a855f7"; // purple
      iconBg = "bg-purple-100";
    } else if (activeTab === "HANDOVERS") {
      items = handovers;
      emptyMsg = "No handovers pending.";
      iconName = "key";
      iconColor = "#d97706"; // amber
      iconBg = "bg-amber-100";
    } else if (activeTab === "FOLLOW_UPS") {
      items = followUps;
      emptyMsg = "No follow-ups today.";
      iconName = "phone-call";
      iconColor = "#10b981"; // emerald
      iconBg = "bg-emerald-100";
    }

    if (items.length === 0) {
      return (
        <View className="bg-white rounded-2xl p-6 border border-slate-200 items-center justify-center mt-4">
          <Feather name="check-circle" size={32} color="#cbd5e1" />
          <Text className="text-slate-500 font-medium mt-3">{emptyMsg}</Text>
        </View>
      );
    }

    return (
      <View className="space-y-4 mt-4">
        {items.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => {
              if (item.customer?.leadId) {
                router.push(`/(dashboard)/closing-manager/lead-management/${item.customer.leadId}`);
              }
            }}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex-row items-center mb-3"
          >
            <View className={`w-10 h-10 ${iconBg} rounded-xl items-center justify-center mr-4`}>
              <Feather name={iconName} size={20} color={iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold">
                {item.customer?.firstName} {item.customer?.lastName}
              </Text>
              {activeTab === "FOLLOW_UPS" ? (
                <Text className="text-slate-500 text-xs mt-0.5">
                  Scheduled: {new Date(item.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              ) : (
                <Text className="text-slate-500 text-xs mt-0.5">
                  <Text className="font-bold text-slate-700">{item.status.replace(/_/g, ' ')}</Text> • Unit: {item.unit?.unitNumber || "N/A"}
                </Text>
              )}
            </View>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top']}>
      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Closing Overview</Text>
          <Text className="text-slate-500 font-medium mt-1">Track bookings, revenue, and brokers.</Text>
        </View>

        {/* Stats Grid */}
        <SharedWidgetsGrid widgets={[
          { label: 'Total Bookings', value: widgets?.totalBookings || 0, icon: CheckCircle, accent: 'emerald' },
          { label: 'Units Sold', value: widgets?.totalUnitsSold || 0, icon: Home, accent: 'blue' },
          { label: 'Brokers', value: widgets?.totalBrokers || 0, icon: Users, accent: 'purple' },
          { label: 'Booking Revenue', value: '₹' + (widgets?.totalBookingRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: Briefcase, accent: 'emerald' },
          { label: 'Total Revenue', value: '₹' + (widgets?.totalRevenueGenerated || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: TrendingUp, accent: 'blue' },
          { label: 'Broker Commission', value: '₹' + (widgets?.totalBrokerCommission || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: DollarSign, accent: 'slate' },
        ]} />
        {/* Pending Tasks Section */}
        <View className="mb-12">
          <Text className="text-lg font-bold text-slate-900 mb-4 px-1">Pending Tasks & Follow-ups</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-3 px-1">
              <Text
                onPress={() => setActiveTab("DOCUMENTS")}
                className={`px-4 py-2 rounded-full font-bold text-sm overflow-hidden ${activeTab === "DOCUMENTS" ? "bg-indigo-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
              >
                Docs ({documents.length})
              </Text>
              <Text
                onPress={() => setActiveTab("LOANS")}
                className={`px-4 py-2 rounded-full font-bold text-sm overflow-hidden ${activeTab === "LOANS" ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
              >
                Loans ({loans.length})
              </Text>
              <Text
                onPress={() => setActiveTab("AGREEMENTS")}
                className={`px-4 py-2 rounded-full font-bold text-sm overflow-hidden ${activeTab === "AGREEMENTS" ? "bg-purple-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
              >
                Agreements ({agreements.length})
              </Text>
              <Text
                onPress={() => setActiveTab("HANDOVERS")}
                className={`px-4 py-2 rounded-full font-bold text-sm overflow-hidden ${activeTab === "HANDOVERS" ? "bg-amber-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
              >
                Handovers ({handovers.length})
              </Text>
              <Text
                onPress={() => setActiveTab("FOLLOW_UPS")}
                className={`px-4 py-2 rounded-full font-bold text-sm overflow-hidden ${activeTab === "FOLLOW_UPS" ? "bg-emerald-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
              >
                Follow-ups ({followUps.length})
              </Text>
            </View>
          </ScrollView>

          {renderActiveList()}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}