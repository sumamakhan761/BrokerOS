import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Clock, Check } from 'lucide-react-native';
import { PaymentCaptureModal } from '@/components/payments/PaymentCaptureModal';

export default function PaymentDetailsScreen() {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<{ id: string, amount: number } | null>(null);

  const fetchSchedules = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/payments/booking/${bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [bookingId]);

  const handleMarkPaid = (id: string, amount: number) => {
    setSelectedSchedule({ id, amount });
    setModalVisible(true);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'PAID') return <CheckCircle2 size={24} color="#10B981" />;
    return <Clock size={24} color="#F59E0B" />;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-gray-900">Payment Schedule</Text>
          <Text className="text-sm text-gray-500">Booking Schedule Timeline</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          {schedules.map((schedule, index) => (
            <View 
              key={schedule.id} 
              className={`p-4 ${index !== schedules.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center flex-1">
                  <View className="mr-3">
                    {getStatusIcon(schedule.status)}
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900 text-lg">{schedule.milestoneName}</Text>
                    <Text className="text-gray-500 text-sm">
                      Due: {new Date(schedule.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-gray-900 text-lg">
                    ₹{schedule.amount.toLocaleString('en-IN')}
                  </Text>
                  {schedule.status === 'PAID' ? (
                    <Text className="text-green-600 font-bold text-xs uppercase mt-1">Paid In Full</Text>
                  ) : (
                    <Text className="text-orange-500 font-bold text-xs uppercase mt-1">
                      Remaining: ₹{schedule.remainingAmount.toLocaleString('en-IN')}
                    </Text>
                  )}
                </View>
              </View>

              {schedule.status !== 'PAID' && (
                <TouchableOpacity
                  onPress={() => handleMarkPaid(schedule.id, schedule.remainingAmount)}
                  className="mt-4 bg-blue-50 border border-blue-200 py-3 rounded-xl flex-row justify-center items-center"
                >
                  <Check size={18} color="#2563EB" className="mr-2" />
                  <Text className="text-blue-700 font-bold">Mark as Paid</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {selectedSchedule && (
        <PaymentCaptureModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          scheduleId={selectedSchedule.id}
          amount={selectedSchedule.amount}
          onSuccess={() => {
            fetchSchedules(); // Refresh the list
          }}
        />
      )}
    </SafeAreaView>
  );
}
