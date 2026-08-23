import { View, Text, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { authClient } from '../../../lib/auth-client';
import { SharedWidgetsGrid } from '../../../components/shared/SharedWidgetsGrid';
import { CPActionTasks } from '../../../components/dashboards/channel-partner/CPActionTasks';
import { SharedLeaderboard } from '../../../components/shared/SharedLeaderboard';
import { BookOpen, Hash, DollarSign, TrendingUp, Activity, Users, Clock, MapPin, Building2, UserCheck, UserPlus, Briefcase } from 'lucide-react-native';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function ChannelPartnerScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await authClient.$fetch('/api/dashboard/channel-partner', { baseURL });
        setData(res?.data || res);
      } catch (err: any) {
        setError(err?.response?.status === 403 ? "Access Denied (403)" : "Connection Error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <ScrollView className="flex-1 bg-[#f8fafc]">
      <View className="p-6">
        <View className="items-center mb-8 mt-2">
          <View className="w-16 h-16 rounded-2xl bg-lime-100 items-center justify-center mb-4">
            <Feather name="link" size={32} color="#65a30d" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">Channel Partner CRM</Text>
          <Text className="text-gray-500 text-center mt-2">Partner network and leads.</Text>
        </View>

        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#65a30d" />
          </View>
        ) : error ? (
          <View className="bg-red-50 p-6 rounded-2xl border border-red-200 items-center">
            <Feather name="alert-circle" size={32} color="#dc2626" />
            <Text className="text-red-600 font-bold text-lg mt-2">Unauthorized</Text>
            <Text className="text-red-500 text-center mt-1">{error}</Text>
          </View>
        ) : data ? (
          <>
            <SharedWidgetsGrid title="Performance Overview" widgets={[
              { label: 'Total Bookings', value: data.kpis.totalBookings, icon: BookOpen, accent: 'blue' },
              { label: 'Units Sold', value: data.kpis.totalUnitsSold, icon: Hash, accent: 'indigo' },
              { label: 'Booking Revenue', value: formatCurrency(data.kpis.totalBookingRevenue), icon: DollarSign, accent: 'emerald' },
              { label: 'Total Revenue', value: formatCurrency(data.kpis.totalRevenueGenerated), icon: TrendingUp, accent: 'teal' },
              { label: 'Broker Commission', value: formatCurrency(data.kpis.totalBrokerCommission), icon: Activity, accent: 'purple' },
              { label: 'Total Brokers', value: data.kpis.totalBrokers, icon: Users, accent: 'orange' },
              { label: 'Follow-ups', value: data.kpis.totalFollowsPending, icon: Clock, accent: 'rose' },
              { label: 'Total Leads', value: data.kpis.totalLeads, icon: MapPin, accent: 'slate' },
            ]} />
            <CPActionTasks tasks={data.actionTasks} />
            <SharedLeaderboard
              title="Top Projects"
              icon={<Building2 size={20} className="text-amber-500" />}
              data={data.leaderboards?.topProjects || []}
              columns={[
                { key: 'bookings', label: 'Bookings', width: 'w-16', align: 'right', isPrimary: true },
              ]}
            />
            <SharedLeaderboard
              title="Top Brokers"
              icon={<Users size={20} className="text-amber-500" />}
              data={data.leaderboards?.topBrokers || []}
              columns={[
                { key: 'bookings', label: 'Deals', width: 'w-16', align: 'right', isPrimary: true },
              ]}
            />
            <SharedLeaderboard
              title="Top Sourcing Managers"
              icon={<UserPlus size={20} className="text-amber-500" />}
              data={data.leaderboards?.topSourcingManagers || []}
              columns={[
                { key: 'bookings', label: 'Broker Deals', width: 'w-24', align: 'right', isPrimary: true },
              ]}
            />
            <SharedLeaderboard
              title="Top Closing Managers"
              icon={<UserCheck size={20} className="text-amber-500" />}
              data={data.leaderboards?.topClosingManagers || []}
              columns={[
                { key: 'bookings', label: 'Units Sold', width: 'w-20', align: 'right', isPrimary: true },
              ]}
            />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}