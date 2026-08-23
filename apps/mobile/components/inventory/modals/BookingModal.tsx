import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface BookingModalProps {
  unit: any;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ unit, visible, onClose, onSuccess }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      const fetchLeads = async () => {
        try {
          const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
          const res = await fetch(`${baseUrl}/api/leads`);
          if (res.ok) {
            const data = await res.json();
            setLeads(data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchLeads();
    }
  }, [visible]);
  const [formData, setFormData] = useState({
    bookingAmount: '',
    paymentMode: 'CARD',
    transactionRef: '',
    agreedPrice: '',
    remarks: ''
  });

  if (!unit) return null;

  const handleSubmit = async () => {
    if (!selectedLeadId) {
      Toast.show({ type: 'info', text1: 'Required', text2: 'Please select a customer for this booking.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
      
      const payload = {
        unitId: unit.id,
        bookingAmount: Number(formData.bookingAmount) || 0,
        paymentMode: formData.paymentMode,
        transactionRef: formData.transactionRef,
        agreedPrice: Number(formData.agreedPrice) || Number(unit.basePrice),
        remarks: formData.remarks
      };

      const res = await fetch(`${baseUrl}/api/leads/${selectedLeadId}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Unit is no longer available. Another executive just booked this unit.");
      }

      Toast.show({ type: 'success', text1: 'Success', text2: 'Unit booked successfully!' });
      onSuccess();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Booking Failed', text2: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-slate-50"
      >
        <View className="flex-row justify-between items-center p-4 border-b border-slate-200 bg-white">
          <View>
            <Text className="text-xl font-bold text-slate-900">Book Unit {unit.unitNumber}</Text>
            <Text className="text-xs text-emerald-600 mt-1 font-bold">AVAILABLE</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
            <Feather name="x" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-5">
          <View className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6 flex-row items-center justify-between">
            <Text className="text-indigo-900 font-bold">Base Price</Text>
            <Text className="text-indigo-900 font-bold text-lg">${Number(unit.basePrice).toLocaleString()}</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2">Customer</Text>
              <View className="bg-white border border-slate-300 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={selectedLeadId}
                  onValueChange={setSelectedLeadId}
                >
                  <Picker.Item label="-- Select Customer --" value="" />
                  {leads.map((lead: any) => (
                    <Picker.Item 
                      key={lead.id} 
                      label={`${lead.firstName} ${lead.lastName} ${lead.phone ? `(${lead.phone})` : ''}`} 
                      value={lead.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2">Agreed Price ($)</Text>
              <TextInput 
                keyboardType="numeric"
                placeholder={unit.basePrice?.toString()}
                value={formData.agreedPrice}
                onChangeText={(val) => setFormData({...formData, agreedPrice: val})}
                className="bg-white border border-slate-300 rounded-xl p-4 text-slate-900"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-700 mb-2">Token Amount ($)</Text>
                <TextInput 
                  keyboardType="numeric"
                  placeholder="5000"
                  value={formData.bookingAmount}
                  onChangeText={(val) => setFormData({...formData, bookingAmount: val})}
                  className="bg-white border border-slate-300 rounded-xl p-4 text-slate-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-700 mb-2">Payment Mode</Text>
                <View className="bg-white border border-slate-300 rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={formData.paymentMode}
                    onValueChange={(val) => setFormData({...formData, paymentMode: val})}
                  >
                    <Picker.Item label="Card" value="CARD" />
                    <Picker.Item label="Bank" value="BANK_TRANSFER" />
                    <Picker.Item label="Cash" value="CASH" />
                  </Picker>
                </View>
              </View>
            </View>

            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2">Transaction Ref (Optional)</Text>
              <TextInput 
                placeholder="TXN-12345"
                value={formData.transactionRef}
                onChangeText={(val) => setFormData({...formData, transactionRef: val})}
                className="bg-white border border-slate-300 rounded-xl p-4 text-slate-900"
              />
            </View>

            <View className="mb-8">
              <Text className="text-sm font-bold text-slate-700 mb-2">Remarks</Text>
              <TextInput 
                placeholder="Any special requests..."
                multiline
                numberOfLines={3}
                value={formData.remarks}
                onChangeText={(val) => setFormData({...formData, remarks: val})}
                className="bg-white border border-slate-300 rounded-xl p-4 text-slate-900 h-24 text-top"
              />
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-600 rounded-xl items-center justify-center flex-row gap-2 shadow-sm mb-10"
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : <Feather name="check-circle" size={20} color="white" />}
              <Text className="text-white font-bold text-lg">Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
