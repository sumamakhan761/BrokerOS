import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { useBookingForm } from '../hooks/useBookingForm';
import BookingDocumentList from './BookingDocumentList';

interface BookingDocument {
  type: string;
  fileUrl: string;
  title: string;
}

interface BookingData {
  id: string;
  unitDescription?: string;
  agreedPrice?: number;
  bookingAmount?: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  paymentMode?: string;
  transactionRef?: string;
  loanRequired?: boolean;
  remarks?: string;
  documents: BookingDocument[];
  status: string;
  createdAt: string;
}

interface BookingCardProps {
  booking: BookingData | null;
  leadId: string;
  onRefresh: () => void;
  lead?: any;
}

const PAYMENT_MODES = ['Cash', 'Cheque', 'NEFT', 'UPI', 'RTGS', 'Demand Draft'];

export default function BookingCard({ booking, leadId, onRefresh, lead }: BookingCardProps) {
  const {
    showForm,
    setShowForm,
    saving,
    form,
    setForm,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    towers,
    selectedTowerId,
    setSelectedTowerId,
    floors,
    selectedFloorId,
    setSelectedFloorId,
    units,
    selectedUnitId,
    setSelectedUnitId,
    handleCreateBooking,
  } = useBookingForm(leadId, onRefresh, lead);

  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [docSaving, setDocSaving] = useState(false);
  const [requestingApproval, setRequestingApproval] = useState(false);
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
  const { authClient } = require('../../../lib/auth-client'); // or import at top
  const Toast = require('react-native-toast-message').default;

  const handleRequestApproval = async () => {
    if (!booking) return;
    try {
      setRequestingApproval(true);
      const { error } = await authClient.$fetch('/api/approvals', {
        baseURL,
        method: 'POST',
        body: {
          title: `Booking Approval: ${lead?.firstName || 'Lead'}`,
          description: `Please approve the booking for ${lead?.firstName || 'Customer'}. Agreed Price: ₹${booking.agreedPrice}, Booking Amount: ₹${booking.bookingAmount}`,
          type: 'BOOKING',
          bookingId: booking.id,
        },
      });

      if (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to send approval request' });
      } else {
        Toast.show({ type: 'success', text1: 'Sent', text2: 'Booking approval request sent to manager.' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred' });
    } finally {
      setRequestingApproval(false);
    }
  };

  if (!booking) {
    return (
      <View className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4">
        <View className="p-4 border-b border-gray-100 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center">
            <Feather name="file-text" size={20} color="#d97706" />
          </View>
          <View>
            <Text className="font-semibold text-gray-900 text-lg">Booking Details</Text>
            <Text className="text-xs text-gray-500">No booking yet</Text>
          </View>
        </View>

        <View className="p-5">
          {!showForm ? (
            <View className="items-center py-6">
              <Feather name="file-text" size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
              <Text className="text-gray-500 font-bold mb-1 text-center">No booking created</Text>
              <Text className="text-gray-400 text-sm mb-5 text-center">When this lead reaches booking stage, create a booking record here.</Text>
              <TouchableOpacity
                onPress={() => setShowForm(true)}
                className="flex-row items-center bg-amber-500 px-5 py-3 rounded-xl shadow-sm"
              >
                <Feather name="plus" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Create Booking</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-4">
              <Text className="font-bold text-gray-900 mb-2">New Booking Details</Text>

              <View className="flex-row gap-2">
                <View className="flex-1 border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker selectedValue={selectedProjectId} onValueChange={setSelectedProjectId} style={{ height: 50 }}>
                    <Picker.Item label="Select Project..." value="" color="#000" />
                    {projects.map(p => <Picker.Item key={p.id} label={p.name} value={p.id} color="#000" />)}
                  </Picker>
                </View>
                <View className="flex-1 border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker selectedValue={selectedTowerId} onValueChange={setSelectedTowerId} enabled={!!selectedProjectId} style={{ height: 50 }}>
                    <Picker.Item label="Select Tower..." value="" color="#000" />
                    {towers.map(t => <Picker.Item key={t.id} label={t.name} value={t.id} color="#000" />)}
                  </Picker>
                </View>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1 border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker selectedValue={selectedFloorId} onValueChange={setSelectedFloorId} enabled={!!selectedTowerId} style={{ height: 50 }}>
                    <Picker.Item label="Select Floor..." value="" color="#000" />
                    {floors.map(f => <Picker.Item key={f.id} label={f.name} value={f.id} color="#000" />)}
                  </Picker>
                </View>
                <View className="flex-1 border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <Picker selectedValue={selectedUnitId} onValueChange={setSelectedUnitId} enabled={!!selectedFloorId} style={{ height: 50 }}>
                    <Picker.Item label="Select Unit..." value="" color="#000" />
                    {units.map(u => <Picker.Item key={u.id} label={`Unit ${u.unitNumber} (${u.type.replace('_', ' ')})`} value={u.id} color="#000" />)}
                  </Picker>
                </View>
              </View>

              {selectedUnitId ? (
                <>
                  <Text className="text-sm font-medium text-gray-700 mt-2 mb-1">Unit Description</Text>
                  <TextInput
                    value={form.unitDescription}
                    onChangeText={(val) => setForm({ ...form, unitDescription: val })}
                    className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-800"
                    placeholder="e.g. Tower A, Floor 5, Unit 504"
                  />
                </>
              ) : null}

              <View className="flex-row gap-4 mt-2">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Agreed Price (₹)</Text>
                  <TextInput
                    value={form.agreedPrice}
                    onChangeText={(val) => setForm({ ...form, agreedPrice: val })}
                    keyboardType="numeric"
                    className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800"
                    placeholder="e.g. 5000000"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Booking Amt (₹)</Text>
                  <TextInput
                    value={form.bookingAmount}
                    onChangeText={(val) => setForm({ ...form, bookingAmount: val })}
                    keyboardType="numeric"
                    className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800"
                    placeholder="e.g. 100000"
                  />
                </View>
              </View>

              <Text className="text-sm font-medium text-gray-700 mt-2 mb-1">Payment Mode</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                {PAYMENT_MODES.map(mode => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setForm({ ...form, paymentMode: mode })}
                    className={`px-4 py-2 rounded-full mr-2 border ${form.paymentMode === mode ? 'bg-amber-100 border-amber-300' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Text className={form.paymentMode === mode ? 'text-amber-800 font-bold' : 'text-gray-600'}>{mode}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text className="text-sm font-medium text-gray-700 mt-2 mb-1">Transaction Reference</Text>
              <TextInput
                value={form.transactionRef}
                onChangeText={(val) => setForm({ ...form, transactionRef: val })}
                className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 mb-2"
                placeholder="Cheque No. / UTR / Txn ID"
              />

              <TouchableOpacity
                onPress={() => setForm({ ...form, loanRequired: !form.loanRequired })}
                className="flex-row items-center mt-2 mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100"
              >
                <View className={`w-6 h-6 rounded-md border items-center justify-center mr-3 ${form.loanRequired ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-white'}`}>
                  {form.loanRequired && <Feather name="check" size={14} color="white" />}
                </View>
                <Text className="text-gray-800 font-medium">Customer requires a home loan</Text>
              </TouchableOpacity>

              <View className="flex-row gap-3 pt-4 border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 items-center justify-center bg-gray-50"
                  disabled={saving}
                >
                  <Text className="text-gray-600 font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateBooking}
                  disabled={saving || !selectedUnitId || !form.agreedPrice || !form.paymentMode}
                  className={`flex-1 py-3 rounded-xl items-center justify-center flex-row ${saving || !selectedUnitId || !form.agreedPrice || !form.paymentMode ? 'bg-amber-300' : 'bg-amber-500'}`}
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Feather name="check" size={18} color="white" />
                      <Text className="text-white font-bold ml-2">Save Booking</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  // If Booking Exists
  return (
    <View className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4">
      <View className="p-5 border-b border-gray-100 flex-row items-center gap-4">
        <View className={`w-12 h-12 rounded-xl items-center justify-center border ${booking.status === 'CONFIRMED' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <Feather name={booking.status === 'CONFIRMED' ? 'check-circle' : 'file-text'} size={24} color={booking.status === 'CONFIRMED' ? '#059669' : '#d97706'} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-lg" numberOfLines={1}>Booking Details</Text>
          <View className="flex-row items-center mt-1">
            <View className={`px-2 py-0.5 rounded-full flex-row items-center ${booking.status === 'CONFIRMED' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              <Feather name={booking.status === 'CONFIRMED' ? 'check-circle' : 'file-text'} size={10} color={booking.status === 'CONFIRMED' ? '#047857' : '#b45309'} />
              <Text className={`text-[10px] font-bold uppercase tracking-wider ml-1 flex-shrink-1 ${booking.status === 'CONFIRMED' ? 'text-emerald-700' : 'text-amber-700'}`} numberOfLines={1}>
                {booking.status === 'CONFIRMED' ? 'Booking Confirmed' : 'Documentation Pending'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="p-5">
        <View className="flex-row flex-wrap mb-2 justify-between">
          {booking.unitDescription && (
            <View className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3">
              <Text className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Unit</Text>
              <Text className="text-sm font-semibold text-gray-900">{booking.unitDescription}</Text>
            </View>
          )}

          <View className="w-[48%] bg-emerald-50 rounded-xl p-4 border border-emerald-100 mb-3">
            <Text className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-1">Agreed Price</Text>
            <Text className="text-base font-bold text-emerald-900" numberOfLines={1} adjustsFontSizeToFit>₹{booking.agreedPrice?.toLocaleString()}</Text>
          </View>

          <View className="w-[48%] bg-blue-50 rounded-xl p-4 border border-blue-100 mb-3">
            <Text className="text-[10px] uppercase tracking-wider text-blue-700 font-bold mb-1">Booking Amt</Text>
            <Text className="text-base font-bold text-blue-900" numberOfLines={1} adjustsFontSizeToFit>₹{booking.bookingAmount?.toLocaleString()}</Text>
          </View>

          {booking.commissionPercentage && (
            <View className="w-[48%] bg-purple-50 rounded-xl p-4 border border-purple-100 mb-3">
              <Text className="text-[10px] uppercase tracking-wider text-purple-700 font-bold mb-1">Commission</Text>
              <Text className="text-base font-bold text-purple-900">{booking.commissionPercentage}% <Text className="text-xs font-medium text-purple-600">(₹{booking.commissionAmount?.toLocaleString()})</Text></Text>
            </View>
          )}

          <View className={`${booking.commissionPercentage ? 'w-[48%]' : 'w-full'} bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3`}>
            <Text className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Payment Mode</Text>
            <Text className="text-sm font-semibold text-gray-900">{booking.paymentMode}</Text>
          </View>

          {booking.transactionRef && (
            <View className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3">
              <Text className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Reference</Text>
              <Text className="text-sm font-semibold text-gray-900">{booking.transactionRef}</Text>
            </View>
          )}

          {booking.remarks && (
            <View className="w-full bg-amber-50 rounded-xl p-4 border border-amber-100 mb-3">
              <Text className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">Remarks</Text>
              <Text className="text-sm text-amber-900 leading-tight">{booking.remarks}</Text>
            </View>
          )}
        </View>

        {booking.loanRequired && (
          <View className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex-row items-center mb-2">
            <Feather name="home" size={16} color="#2563eb" className="mr-2" />
            <Text className="text-blue-800 font-medium ml-2">Home Loan Required</Text>
          </View>
        )}

        <BookingDocumentList
          booking={booking}
          leadId={leadId}
          onRefresh={onRefresh}
          saving={docSaving}
          setSaving={setDocSaving}
          uploadingType={uploadingType}
          setUploadingType={setUploadingType}
        />

        {booking.status !== 'CONFIRMED' && (
          <TouchableOpacity
            className="mt-4 bg-[#2563eb] p-3 rounded-xl flex-row justify-center items-center shadow-sm"
            onPress={handleRequestApproval}
            disabled={requestingApproval}
          >
            {requestingApproval ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="send" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Send for Approval</Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}
