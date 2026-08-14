import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { CreditCard, Hash, Percent } from 'lucide-react-native';

interface MobilePaymentScheduleFormProps {
  bookingId: string;
  netAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MobilePaymentScheduleForm({
  bookingId,
  netAmount,
  onSuccess,
  onCancel,
}: MobilePaymentScheduleFormProps) {
  const [mode, setMode] = useState<'months' | 'percentage'>('months');
  const [installments, setInstallments] = useState('12');
  const [percentagePerMonth, setPercentagePerMonth] = useState('5');
  const [startDate, setStartDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const calcPreview = () => {
    const pct = parseFloat(percentagePerMonth);
    if (!pct || pct <= 0 || netAmount <= 0) return null;
    const monthly = (pct / 100) * netAmount;
    const fullMonths = Math.floor(netAmount / monthly);
    const remainder = parseFloat((netAmount - fullMonths * monthly).toFixed(2));
    return {
      monthly: monthly.toFixed(2),
      total: remainder > 0 ? fullMonths + 1 : fullMonths,
      last: remainder > 0 ? remainder.toFixed(2) : monthly.toFixed(2),
      hasRemainder: remainder > 0,
    };
  };

  const preview = mode === 'percentage' ? calcPreview() : null;

  const handleCreate = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL as string;

      const body: any = {
        netAmount,
        startDate: startDate || new Date().toISOString(),
      };

      if (mode === 'months') {
        const count = parseInt(installments, 10);
        if (!count || count < 1) {
          setCreateError('Please enter a valid number of months.');
          setCreating(false);
          return;
        }
        body.installmentsCount = count;
        body.frequency = 'MONTHLY';
      } else {
        const pct = parseFloat(percentagePerMonth);
        if (!pct || pct <= 0) {
          setCreateError('Please enter a valid percentage.');
          setCreating(false);
          return;
        }
        body.percentagePerMonth = pct;
      }

      const res = await fetch(`${apiUrl}/api/payments/schedule/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        Alert.alert('Success', 'Payment schedule created successfully!');
        onSuccess();
      } else {
        const err = await res.json().catch(() => ({}));
        setCreateError(err.message || 'Failed to create schedule.');
      }
    } catch (err) {
      console.error(err);
      setCreateError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View className="p-4 space-y-4">
      {/* Net Amount Banner */}
      <View className="bg-blue-50 rounded-xl p-3 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-blue-500 font-semibold uppercase">Amount to Schedule</Text>
          <Text className="text-xl font-bold text-blue-700">₹{netAmount.toLocaleString('en-IN')}</Text>
        </View>
        <CreditCard size={28} color="#93C5FD" />
      </View>

      {/* Mode Toggle */}
      <View>
        <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Schedule Mode</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setMode('months')}
            className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-2 ${
              mode === 'months' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <Hash size={14} color={mode === 'months' ? '#2563EB' : '#6B7280'} />
            <Text className={`text-sm font-semibold ${mode === 'months' ? 'text-blue-700' : 'text-gray-600'}`}>
              Fixed Months
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('percentage')}
            className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-2 ${
              mode === 'percentage' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <Percent size={14} color={mode === 'percentage' ? '#2563EB' : '#6B7280'} />
            <Text className={`text-sm font-semibold ${mode === 'percentage' ? 'text-blue-700' : 'text-gray-600'}`}>
              % Per Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode 1 – Fixed Months */}
      {mode === 'months' && (
        <View>
          <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Number of Months</Text>
          <TextInput
            value={installments}
            onChangeText={setInstallments}
            keyboardType="number-pad"
            placeholder="e.g. 24"
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white text-sm"
          />
          {installments && netAmount > 0 && (
            <Text className="text-xs text-gray-400 mt-1 ml-1">
              ≈ ₹{(netAmount / parseInt(installments || '1', 10)).toLocaleString('en-IN', { maximumFractionDigits: 2 })} / month
            </Text>
          )}
        </View>
      )}

      {/* Mode 2 – Percentage Per Month */}
      {mode === 'percentage' && (
        <View>
          <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">% of Total Per Month</Text>
          <TextInput
            value={percentagePerMonth}
            onChangeText={setPercentagePerMonth}
            keyboardType="decimal-pad"
            placeholder="e.g. 5"
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white text-sm"
          />
          {preview && (
            <View className="mt-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <Text className="text-xs font-semibold text-amber-700 mb-1">Preview</Text>
              <Text className="text-xs text-amber-600">
                Monthly: ₹{parseFloat(preview.monthly).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Text>
              <Text className="text-xs text-amber-600">
                Total months: {preview.total}
                {preview.hasRemainder && ` (last: ₹${parseFloat(preview.last).toLocaleString('en-IN', { maximumFractionDigits: 2 })})`}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Start Date */}
      <View>
        <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">First Payment Date</Text>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white text-sm"
        />
        <Text className="text-xs text-gray-400 mt-1 ml-1">Leave empty to use today's date</Text>
      </View>

      {createError ? (
        <Text className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{createError}</Text>
      ) : null}

      <View className="flex-row gap-3 pt-2">
        <TouchableOpacity
          onPress={handleCreate}
          disabled={creating}
          className={`flex-1 py-3 rounded-xl items-center ${creating ? 'bg-blue-300' : 'bg-blue-600'}`}
        >
          {creating ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold">Generate Plan</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          className="px-5 py-3 rounded-xl border border-gray-200 items-center"
        >
          <Text className="text-gray-700 font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
