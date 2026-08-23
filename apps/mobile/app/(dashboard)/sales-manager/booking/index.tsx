import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { authClient } from '../../../../lib/auth-client';

export default function BookingScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch('/api/bookings', { baseURL });
      if (res.data) {
        setBookings(res.data as any[]);
      }
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const lowerQ = searchQuery.toLowerCase();
    return bookings.filter(b => {
      const name = `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`.toLowerCase();
      const bookingNo = (b.bookingNumber || '').toLowerCase();
      const unitNo = (b.unit?.unitNumber || '').toLowerCase();
      const handledBy = `${b.salesExec?.firstName || ''} ${b.salesExec?.lastName || ''}`.toLowerCase();
      return name.includes(lowerQ) || bookingNo.includes(lowerQ) || unitNo.includes(lowerQ) || handledBy.includes(lowerQ);
    });
  }, [bookings, searchQuery]);

  const renderBooking = ({ item, index }: { item: any; index: number }) => {
    const phone = item.customer?.lead?.phone || item.customer?.phone || 'N/A';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/sales-manager/lead-management/${item.customer?.lead?.id}` as any)}
        className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex-row items-center"
        style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}
      >
        <View className="mr-3 items-center justify-center">
          <Text className="text-gray-400 font-bold text-xs">#{index + 1}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1.5">
            <View className="flex-1 pr-2">
              <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                {item.customer?.firstName} {item.customer?.lastName}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Feather name="phone" size={12} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-1">{phone}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-emerald-600 font-bold text-base">
                ₹{Number(item.agreedPrice).toLocaleString('en-IN')}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">Agreed Price</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-50">
            <View className="flex-row items-center">
              <View className="bg-indigo-50 px-2 py-1 rounded border border-indigo-100 mr-2">
                <Text className="text-indigo-700 font-bold text-[10px] uppercase">{item.bookingNumber}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Feather name="home" size={12} color="#4b5563" />
              <Text className="text-gray-600 text-xs font-semibold ml-1">
                Unit {item.unit?.unitNumber || 'N/A'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-1.5 pt-1.5 border-t border-gray-50">
            <View className="flex-row items-center">
              <Feather name="user-check" size={12} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">Handled by</Text>
            </View>
            <Text className="text-gray-700 text-xs font-medium">
              {item.salesExec?.firstName || 'Unknown'} {item.salesExec?.lastName || ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="px-5 pt-6 pb-2">
        <View className="flex-row items-center mb-5">
          <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
            <Feather name="calendar" size={20} color="#4f46e5" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">Bookings</Text>
            <Text className="text-gray-500 text-xs">Review team finalized bookings</Text>
          </View>
        </View>

        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2" style={{ elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
          <Feather name="search" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-sm font-medium text-gray-900 h-full p-0"
            placeholder="Search name, booking no, unit, or exec..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : filteredBookings.length === 0 ? (
        <View
          className="bg-white m-5 p-8 rounded-3xl items-center justify-center border border-gray-100"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}
        >
          <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
            <Feather name={searchQuery ? "search" : "calendar"} size={32} color="#cbd5e1" />
          </View>
          <Text className="text-lg font-bold text-gray-900 mb-2">
            {searchQuery ? 'No results found' : 'No Bookings Yet'}
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            {searchQuery ? 'Try adjusting your search terms.' : 'Bookings processed and marked as "Done" by your team will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
