import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';
import { PaymentCaptureModal } from './PaymentCaptureModal';

interface MobilePaymentScheduleListProps {
  schedules: any[];
  netAmount: number;
  onRefresh: () => void;
}

export function MobilePaymentScheduleList({
  schedules,
  netAmount,
  onRefresh,
}: MobilePaymentScheduleListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<{ id: string; amount: number } | null>(null);

  const handleMarkPaid = (id: string, amount: number) => {
    setSelectedSchedule({ id, amount });
    setModalVisible(true);
  };

  const paidCount = schedules.filter(s => s.status === 'PAID').length;
  const totalScheduled = schedules.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const paidAmountSum = schedules.reduce((sum, s) => sum + (parseFloat(s.amount) - parseFloat(s.remainingAmount)), 0);
  const progressPct = totalScheduled > 0 ? Math.round((paidAmountSum / totalScheduled) * 100) : 0;

  return (
    <View>
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 bg-blue-50 rounded-xl items-center justify-center">
            <CreditCard size={18} color="#2563EB" />
          </View>
          <View>
            <Text className="text-gray-900 font-semibold">Payment Schedule</Text>
            <Text className="text-gray-400 text-xs">{paidCount}/{schedules.length} installments paid</Text>
          </View>
        </View>
        <Text className="text-blue-600 font-bold text-sm">{progressPct}%</Text>
      </View>

      {/* Progress Bar */}
      <View className="h-1.5 bg-gray-100">
        <View className="h-full bg-blue-500" style={{ width: `${progressPct}%` }} />
      </View>

      {/* Summary Row */}
      <View className="flex-row border-b border-gray-100">
        <View className="flex-1 p-3 items-center border-r border-gray-100">
          <Text className="text-xs text-gray-400">Scheduled</Text>
          <Text className="text-xs font-bold text-gray-800">₹{totalScheduled.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
        </View>
        <View className="flex-1 p-3 items-center border-r border-gray-100">
          <Text className="text-xs text-gray-400">Paid</Text>
          <Text className="text-xs font-bold text-green-600">₹{paidAmountSum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
        </View>
        <View className="flex-1 p-3 items-center">
          <Text className="text-xs text-gray-400">Remaining</Text>
          <Text className="text-xs font-bold text-orange-500">₹{(totalScheduled - paidAmountSum).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
        </View>
      </View>

      {/* Installments */}
      {schedules.map((schedule, index) => {
        const isOverdue = new Date(schedule.dueDate) < new Date() && schedule.status !== 'PAID';
        return (
          <View
            key={schedule.id}
            className={`p-4 ${index !== schedules.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                  schedule.status === 'PAID' ? 'bg-green-100' :
                  isOverdue ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                  {schedule.status === 'PAID' ? (
                    <CheckCircle2 size={18} color="#10B981" />
                  ) : isOverdue ? (
                    <AlertCircle size={18} color="#EF4444" />
                  ) : (
                    <Clock size={18} color="#F59E0B" />
                  )}
                </View>
                <View>
                  <Text className="text-gray-900 font-semibold text-sm">{schedule.milestoneName}</Text>
                  <Text className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                    Due: {new Date(schedule.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="font-bold text-gray-900 text-sm">
                  ₹{parseFloat(schedule.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Text>
                {schedule.status === 'PAID' ? (
                  <Text className="text-xs text-green-600 font-semibold">Paid ✓</Text>
                ) : (
                  <Text className="text-xs text-orange-500 font-semibold">
                    Rem: ₹{parseFloat(schedule.remainingAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </Text>
                )}
              </View>
            </View>

            {schedule.status !== 'PAID' && (
              <TouchableOpacity
                onPress={() => handleMarkPaid(schedule.id, parseFloat(schedule.remainingAmount))}
                className="mt-3 bg-blue-50 border border-blue-200 py-2.5 rounded-xl flex-row justify-center items-center"
              >
                <CheckCircle2 size={15} color="#2563EB" />
                <Text className="text-blue-700 font-bold ml-2 text-sm">Mark as Paid</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {/* PaymentCaptureModal */}
      {selectedSchedule && (
        <PaymentCaptureModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          scheduleId={selectedSchedule.id}
          amount={selectedSchedule.amount}
          onSuccess={() => onRefresh()}
        />
      )}
    </View>
  );
}
