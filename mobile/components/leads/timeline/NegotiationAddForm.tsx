import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

interface NegotiationAddFormProps {
  form: any;
  setForm: (val: any) => void;
  saving: boolean;
  handleAddRound: () => void;
  onCancel: () => void;
}

export default function NegotiationAddForm({
  form,
  setForm,
  saving,
  handleAddRound,
  onCancel
}: NegotiationAddFormProps) {
  return (
    <View className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-4">
      <View className="mb-4">
        <Text className="text-lg font-bold text-gray-900">Add Negotiation Round</Text>
        <Text className="text-xs text-gray-500">Record the latest discussion with the customer</Text>
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Title</Text>
        <TextInput
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={form.title}
          onChangeText={t => setForm({ ...form, title: t })}
          placeholder="e.g. Round 1"
        />
      </View>

      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-xs font-semibold text-gray-600 mb-1">Our Asking Price (₹)</Text>
          <TextInput
            keyboardType="numeric"
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
            value={form.askingPrice}
            onChangeText={t => setForm({ ...form, askingPrice: t })}
            placeholder="e.g. 5000000"
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold text-gray-600 mb-1">Customer Offer (₹)</Text>
          <TextInput
            keyboardType="numeric"
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
            value={form.offeredPrice}
            onChangeText={t => setForm({ ...form, offeredPrice: t })}
            placeholder="e.g. 4800000"
          />
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Customer Objections</Text>
        <TextInput
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={form.objections}
          onChangeText={t => setForm({ ...form, objections: t })}
          placeholder="What is holding them back?"
        />
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Our Strategy</Text>
        <TextInput
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={form.strategy}
          onChangeText={t => setForm({ ...form, strategy: t })}
          placeholder="How we plan to close this..."
        />
      </View>

      <View className="mb-4">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Next Step</Text>
        <TextInput
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={form.nextStep}
          onChangeText={t => setForm({ ...form, nextStep: t })}
          placeholder="e.g. Call back tomorrow with final offer"
        />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 border border-gray-200 rounded-xl py-3 items-center justify-center bg-gray-50"
        >
          <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAddRound}
          disabled={saving || !form.askingPrice || !form.offeredPrice}
          className={`flex-1 rounded-xl py-3 items-center justify-center ${(!form.askingPrice || !form.offeredPrice) ? 'bg-indigo-300' : 'bg-indigo-600'}`}
        >
          {saving ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold text-sm">Save Round</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
