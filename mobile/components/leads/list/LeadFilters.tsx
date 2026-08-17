import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePathname } from 'expo-router';
import { getAvailableStatusesForRole, STATUS_LABELS } from '../../../lib/status-utils';

interface LeadFiltersProps {
  status: string;
  setStatus: (val: string) => void;
  scoreRange: string;
  setScoreRange: (val: string) => void;
  followUpDate: string;
  setFollowUpDate: (val: string) => void;
  siteVisitDate: string;
  setSiteVisitDate: (val: string) => void;
}

export default function LeadFilters({
  status,
  setStatus,
  scoreRange,
  setScoreRange,
  followUpDate,
  setFollowUpDate,
  siteVisitDate,
  setSiteVisitDate,
}: LeadFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
  const [showSiteVisitPicker, setShowSiteVisitPicker] = useState(false);

  const pathname = usePathname() || '';
  const availableStatusStrings = getAvailableStatusesForRole(pathname);

  let availableStatuses = availableStatusStrings.map(s => ({
    label: STATUS_LABELS[s] || s,
    value: s
  }));

  // Ensure current status is included if it's somehow selected
  if (status && !availableStatuses.some((s: { value: string }) => s.value === status)) {
    availableStatuses = [{ label: STATUS_LABELS[status] || status, value: status }, ...availableStatuses];
  }

  return (
    <View className="px-4 pb-2 z-10">
      <TouchableOpacity
        className="flex-row items-center gap-2 mb-2 p-2"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Feather name="filter" size={18} color="#475569" />
        <Text className="text-slate-700 font-medium text-base">Filters {isExpanded ? '▲' : '▼'}</Text>
        {(status || scoreRange || followUpDate || siteVisitDate) ? (
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
                {availableStatuses.map(s => (
                  <Picker.Item key={s.value} label={s.label} value={s.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-600 uppercase mb-2">Score Range</Text>
            <View className="border border-gray-200 rounded-xl overflow-hidden h-14 justify-center bg-gray-50">
              <Picker
                selectedValue={scoreRange}
                onValueChange={(val) => setScoreRange(val)}
                style={{ height: 56 }}
                itemStyle={{ fontSize: 16 }}
              >
                <Picker.Item label="All Scores" value="" color="#64748b" />
                <Picker.Item label="Low (0-60)" value="0-60" />
                <Picker.Item label="Medium (60-80)" value="60-80" />
                <Picker.Item label="High (80-100)" value="80-100" />
              </Picker>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
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

            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-600 uppercase mb-2">Site Visit Date</Text>
              <TouchableOpacity onPress={() => setShowSiteVisitPicker(true)} activeOpacity={0.7}>
                <TextInput
                  value={siteVisitDate}
                  editable={false}
                  pointerEvents="none"
                  placeholder="Select Date"
                  className="border border-gray-200 rounded-xl h-14 px-4 bg-gray-50 text-gray-800 text-base"
                />
              </TouchableOpacity>
              {showSiteVisitPicker && (
                <DateTimePicker
                  value={siteVisitDate ? new Date(siteVisitDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowSiteVisitPicker(Platform.OS === 'ios');
                    if (event.type === 'set' && selectedDate) {
                      setSiteVisitDate(selectedDate.toISOString().split('T')[0]);
                    } else if (event.type === 'dismissed') {
                      setShowSiteVisitPicker(false);
                    }
                  }}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            className="bg-gray-100 py-3.5 rounded-xl items-center mt-4 border border-gray-200"
            onPress={() => {
              setStatus('');
              setScoreRange('');
              setFollowUpDate('');
              setSiteVisitDate('');
            }}
          >
            <Text className="text-gray-700 font-semibold text-base">Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
