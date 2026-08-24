import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface UnitDetailsFormProps {
  formData: {
    status: string;
    basePrice: string;
    carpetArea: string;
    type: string;
    facing: string;
    commissionPercentage: string;
    commissionAmount: string;
  };
  setFormData: (data: any) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function UnitDetailsForm({
  formData,
  setFormData,
  onCancel,
  onSave,
  isSaving
}: UnitDetailsFormProps) {
  return (
    <View>
      <View className="mb-4">
        <Text className="text-sm font-bold text-slate-700 mb-2">Status</Text>
        <View className="bg-white border border-slate-300 rounded-xl overflow-hidden">
          <Picker
            selectedValue={formData.status}
            onValueChange={(itemValue) => setFormData({ ...formData, status: itemValue })}
            style={{ color: '#0f172a' }}
            dropdownIconColor="#0f172a"
          >
            <Picker.Item label="AVAILABLE" value="AVAILABLE" color="#0f172a" />
            <Picker.Item label="RESERVED" value="RESERVED" color="#0f172a" />
            <Picker.Item label="SOLD" value="SOLD" color="#0f172a" />
            <Picker.Item label="BLOCKED" value="BLOCKED" color="#0f172a" />
          </Picker>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-bold text-slate-700 mb-2">Base Price ($)</Text>
        <TextInput
          keyboardType="numeric"
          value={formData.basePrice}
          onChangeText={(val) => {
            const bp = Number(val) || 0;
            const pct = Number(formData.commissionPercentage) || 0;
            setFormData({
              ...formData,
              basePrice: val,
              commissionAmount: ((bp * pct) / 100).toString()
            });
          }}
          className="bg-white border border-slate-300 rounded-xl p-4 text-slate-900 font-medium"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-bold text-slate-700 mb-2">Commission (%)</Text>
        <TextInput
          keyboardType="numeric"
          value={formData.commissionPercentage}
          onChangeText={(val) => {
            const pct = Number(val) || 0;
            const bp = Number(formData.basePrice) || 0;
            setFormData({
              ...formData,
              commissionPercentage: val,
              commissionAmount: ((bp * pct) / 100).toString()
            });
          }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 font-medium"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-bold text-slate-700 mb-2">Commission Amount ($)</Text>
        <TextInput
          keyboardType="numeric"
          value={formData.commissionAmount}
          onChangeText={(val) => {
            const amt = Number(val) || 0;
            const bp = Number(formData.basePrice) || 0;
            const pct = bp > 0 ? (amt / bp) * 100 : 0;
            const roundedPct = Math.round(pct * 100) / 100;
            setFormData({
              ...formData,
              commissionAmount: val,
              commissionPercentage: roundedPct.toString()
            });
          }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 font-medium"
        />
      </View>

      <View className="mb-8">
        <Text className="text-sm font-bold text-slate-700 mb-2">Carpet Area (sq.ft)</Text>
        <TextInput
          keyboardType="numeric"
          value={formData.carpetArea}
          onChangeText={(val) => setFormData({ ...formData, carpetArea: val })}
          className="bg-white border border-slate-300 rounded-xl p-4 text-slate-900 font-medium"
        />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 py-4 bg-slate-200 rounded-xl items-center justify-center"
        >
          <Text className="text-slate-700 font-bold text-base">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving}
          className="flex-[2] py-4 bg-indigo-600 rounded-xl items-center justify-center flex-row gap-2"
        >
          {isSaving ? <ActivityIndicator color="white" /> : <Feather name="save" size={18} color="white" />}
          <Text className="text-white font-bold text-base">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
