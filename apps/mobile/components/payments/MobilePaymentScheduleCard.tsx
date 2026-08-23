import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CreditCard, Plus } from 'lucide-react-native';
import { MobilePaymentScheduleForm } from './MobilePaymentScheduleForm';
import { MobilePaymentScheduleList } from './MobilePaymentScheduleList';

interface MobilePaymentScheduleCardProps {
  bookingId: string;
  agreedPrice: number;    // Full agreed price
  bookingAmount: number;  // Upfront booking/token amount already paid
}

export function MobilePaymentScheduleCard({
  bookingId,
  agreedPrice,
  bookingAmount,
}: MobilePaymentScheduleCardProps) {
  const netAmount = agreedPrice - bookingAmount; // Amount to schedule

  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchSchedules = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const response = await fetch(`${apiUrl}/api/payments/booking/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [bookingId]);

  if (loading) {
    return (
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 items-center justify-center h-32 mb-4">
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }

  // ─── Empty State: No schedule yet ─────────────────────────────────────────
  if (schedules.length === 0) {
    return (
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        {/* Card Header */}
        <View className="px-4 py-4 border-b border-gray-100 flex-row items-center gap-3">
          <View className="w-9 h-9 bg-blue-50 rounded-xl items-center justify-center">
            <CreditCard size={18} color="#2563EB" />
          </View>
          <View>
            <Text className="text-gray-900 font-semibold">Payment Tracking</Text>
            <Text className="text-gray-400 text-xs">No schedule created yet</Text>
          </View>
        </View>

        {/* Amount breakdown */}
        <View className="flex-row border-b border-gray-100">
          <View className="flex-1 p-3 items-center border-r border-gray-100">
            <Text className="text-xs text-gray-400 mb-0.5">Agreed</Text>
            <Text className="text-sm font-bold text-gray-800">₹{agreedPrice.toLocaleString('en-IN')}</Text>
          </View>
          <View className="flex-1 p-3 items-center border-r border-gray-100">
            <Text className="text-xs text-gray-400 mb-0.5">Booking Paid</Text>
            <Text className="text-sm font-bold text-orange-500">−₹{bookingAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View className="flex-1 p-3 items-center bg-blue-50">
            <Text className="text-xs text-blue-500 mb-0.5 font-medium">To Schedule</Text>
            <Text className="text-sm font-bold text-blue-700">₹{netAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {!showForm ? (
          <View className="p-4 items-center">
            <CreditCard size={40} color="#D1D5DB" />
            <Text className="text-gray-600 font-semibold mt-3 mb-1">No Installment Schedule</Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              Create a schedule to track ₹{netAmount.toLocaleString('en-IN')} in installments.
            </Text>
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="flex-row items-center gap-2 bg-blue-600 px-5 py-3 rounded-xl"
            >
              <Plus size={16} color="white" />
              <Text className="text-white font-bold">Generate Schedule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MobilePaymentScheduleForm
            bookingId={bookingId}
            netAmount={netAmount}
            onSuccess={() => {
              setShowForm(false);
              fetchSchedules();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </View>
    );
  }

  // ─── Schedule exists: show installments ───────────────────────────────────
  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <MobilePaymentScheduleList
        schedules={schedules}
        netAmount={netAmount}
        onRefresh={fetchSchedules}
      />
    </View>
  );
}
