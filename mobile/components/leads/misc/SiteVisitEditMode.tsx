import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface SiteVisitEditModeProps {
  svId: string;
  editForm: any;
  setEditForm: (form: any) => void;
  saving: boolean;
  saveEdit: (svId: string) => void;
  onCancel: () => void;
}

export default function SiteVisitEditMode({ svId, editForm, setEditForm, saving, saveEdit, onCancel }: SiteVisitEditModeProps) {
  return (
    <View className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-3">
      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Interest Level</Text>
        <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          <Picker
            selectedValue={editForm.interestLevel}
            onValueChange={(itemValue) => setEditForm({ ...editForm, interestLevel: itemValue })}
            style={{ height: 50 }}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="High" value="HIGH" />
            <Picker.Item label="Medium" value="MEDIUM" />
            <Picker.Item label="Low" value="LOW" />
            <Picker.Item label="Not Interested" value="NOT_INTERESTED" />
          </Picker>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Budget Confirmed (₹)</Text>
        <TextInput
          keyboardType="numeric"
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={editForm.budgetConfirmed}
          onChangeText={text => setEditForm({ ...editForm, budgetConfirmed: text })}
          placeholder="e.g. 5000000"
        />
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Config They Liked</Text>
        <TextInput
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={editForm.configInterest}
          onChangeText={text => setEditForm({ ...editForm, configInterest: text })}
          placeholder="e.g. 2BHK, Corner Unit"
        />
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Customer Reaction</Text>
        <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          <Picker
            selectedValue={editForm.customerReaction}
            onValueChange={(itemValue) => setEditForm({ ...editForm, customerReaction: itemValue })}
            style={{ height: 50 }}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Very Positive" value="VERY_POSITIVE" />
            <Picker.Item label="Positive" value="POSITIVE" />
            <Picker.Item label="Neutral" value="NEUTRAL" />
            <Picker.Item label="Negative" value="NEGATIVE" />
          </Picker>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Closing Probability</Text>
        <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          <Picker
            selectedValue={editForm.closingProbability}
            onValueChange={(itemValue) => setEditForm({ ...editForm, closingProbability: itemValue })}
            style={{ height: 50 }}
          >
            <Picker.Item label="Select..." value="" />
            <Picker.Item label="Very High" value="VERY_HIGH" />
            <Picker.Item label="High" value="HIGH" />
            <Picker.Item label="Medium" value="MEDIUM" />
            <Picker.Item label="Low" value="LOW" />
          </Picker>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Next Action</Text>
        <TextInput
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={editForm.nextAction}
          onChangeText={text => setEditForm({ ...editForm, nextAction: text })}
          placeholder="e.g. Send brochure"
        />
      </View>

      <View className="mb-3">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Objections Raised</Text>
        <TextInput
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={editForm.customerObjections}
          onChangeText={text => setEditForm({ ...editForm, customerObjections: text })}
          placeholder="Any objections raised by customer..."
        />
      </View>

      <View className="mb-4">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Meeting Notes</Text>
        <TextInput
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900"
          value={editForm.meetingNotes}
          onChangeText={text => setEditForm({ ...editForm, meetingNotes: text })}
          placeholder="General meeting notes..."
        />
      </View>

      <View className="flex-row gap-3 pt-2">
        <TouchableOpacity
          onPress={() => saveEdit(svId)}
          disabled={saving}
          className="flex-1 bg-emerald-600 rounded-xl py-3 items-center justify-center shadow-sm"
        >
          {saving ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-white font-bold text-sm">Save Changes</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          className="px-5 border border-gray-200 rounded-xl py-3 items-center justify-center bg-white"
        >
          <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
