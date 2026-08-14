import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BrokerFiltersProps {
  status: string;
  setStatus: (val: string) => void;
  followUpDate: string;
  setFollowUpDate: (val: string) => void;
}

export default function BrokerFilters({
  status,
  setStatus,
  followUpDate,
  setFollowUpDate,
}: BrokerFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);

  const allStatuses = [
    { label: 'New', value: 'NEW' },
    { label: 'Contacted', value: 'CONTACTED' },
    { label: 'Visit', value: 'VISIT' },
    { label: 'Deal', value: 'DEAL' },
  ];

  return (
    <View className="px-4 pb-2 z-10">
      <TouchableOpacity 
        className="flex-row items-center gap-2 mb-2 p-2"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Feather name="filter" size={18} color="#475569" />
        <Text className="text-slate-700 font-medium text-base">Filters {isExpanded ? '▲' : '▼'}</Text>
        {(status || followUpDate) ? (
          <View className="w-2.5 h-2.5 rounded-full bg-blue-600 ml-1" />
        ) : null}
      </TouchableOpacity>

      {isExpanded && (
        <View className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-4">
          <View>
            <Text className="text-sm font-semibold text-gray-600 uppercase mb-2">Status</Text>
            <View className="border border-gray-200 rounded-xl overflow-hidden h-14 justify-center bg-gray-50">
              <Picker
                selectedValue={status}
                onValueChange={(val) => setStatus(val)}
                style={{ height: 56 }}
                itemStyle={{ fontSize: 16 }}
              >
                <Picker.Item label="All Statuses" value="" color="#64748b" />
                {allStatuses.map(s => (
                  <Picker.Item key={s.value} label={s.label} value={s.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-600 uppercase mb-2">Follow-Up Date</Text>
            <TouchableOpacity onPress={() => setShowFollowUpPicker(true)} activeOpacity={0.7}>
              <TextInput 
                value={followUpDate}
                editable={false}
                pointerEvents="none"
                placeholder="Select Date"
                className="border border-gray-200 rounded-xl h-14 px-4 bg-gray-50 text-gray-800 text-base"
              />
            </TouchableOpacity>
            {showFollowUpPicker && (
              <DateTimePicker
                value={followUpDate ? new Date(followUpDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowFollowUpPicker(Platform.OS === 'ios');
                  if (event.type === 'set' && selectedDate) {
                    setFollowUpDate(selectedDate.toISOString().split('T')[0]);
                  } else if (event.type === 'dismissed') {
                    setShowFollowUpPicker(false);
                  }
                }}
              />
            )}
          </View>

          <TouchableOpacity 
            className="bg-gray-100 py-3.5 rounded-xl items-center mt-4 border border-gray-200"
            onPress={() => {
              setStatus('');
              setFollowUpDate('');
            }}
          >
            <Text className="text-gray-700 font-semibold text-base">Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
