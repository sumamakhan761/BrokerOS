import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LeadProfileData } from '../misc/lead-profile-types';

interface LeadDetailsProps {
  lead: LeadProfileData;
  isEditingLeadInfo?: boolean;
  setIsEditingLeadInfo?: (val: boolean) => void;
  leadInfoData?: any;
  setLeadInfoData?: (data: any) => void;
  handleLeadInfoSave?: () => void;
  availableSources?: { id: string; name: string }[];
  availableProjects?: { id: string; name: string }[];
}

export default function LeadDetails({
  lead,
  isEditingLeadInfo = false,
  setIsEditingLeadInfo = () => {},
  leadInfoData = {},
  setLeadInfoData = () => {},
  handleLeadInfoSave = () => {},
  availableSources = [],
  availableProjects = [],
}: LeadDetailsProps) {
  const [showLastContactPicker, setShowLastContactPicker] = useState(false);
  const [showNextFollowUpPicker, setShowNextFollowUpPicker] = useState(false);

  const handleEditOpen = () => {
    setIsEditingLeadInfo(true);
    setLeadInfoData({
      budget: lead.budget != null ? String(lead.budget) : '',
      lastContactDate: lead.lastContactDate ? new Date(lead.lastContactDate).toISOString().split('T')[0] : '',
      nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : '',
      sourceId: lead.source?.id || lead.sourceId || '',
      interestedProjectId: lead.interestedProject?.id || lead.interestedProjectId || '',
      preferredLocation: lead.preferredLocation || '',
      requirements: lead.requirements || '',
    });
  };

  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <View className="flex-row items-center gap-2">
          <Feather name="briefcase" size={18} color="#2563eb" />
          <Text className="text-lg font-bold text-gray-900">Lead Information</Text>
        </View>
        {!isEditingLeadInfo ? (
          <TouchableOpacity onPress={handleEditOpen} className="p-1.5 rounded-full bg-blue-50">
            <Feather name="edit-2" size={14} color="#2563eb" />
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => setIsEditingLeadInfo(false)} className="p-1.5 rounded-full bg-red-50">
              <Feather name="x" size={16} color="#dc2626" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLeadInfoSave} className="p-1.5 rounded-full bg-green-50">
              <Feather name="check" size={16} color="#16a34a" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!isEditingLeadInfo ? (
        // Display Mode
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="globe" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Source</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{lead.source?.name || 'Unknown'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="user" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Agent Name</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{lead.assignedUser ? (lead.assignedUser.name || lead.assignedUser.username) : 'Unassigned'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="user-check" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">SE</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{lead.salesExecutive ? (lead.salesExecutive.name || lead.salesExecutive.username) : 'Unassigned'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="dollar-sign" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Budget</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : 'Not specified'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="home" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Project</Text></View>
            <Text className="text-gray-900 text-sm font-medium max-w-[150px]" numberOfLines={1}>{lead.interestedProject?.name || 'Any'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="map-pin" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Pref. Location</Text></View>
            <Text className="text-gray-900 text-sm font-medium max-w-[150px]" numberOfLines={1}>{lead.preferredLocation || 'Not specified'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="briefcase" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Requirements</Text></View>
            <Text className="text-gray-900 text-sm font-medium max-w-[150px]" numberOfLines={1}>{lead.requirements || 'Not specified'}</Text>
          </View>
          {lead.broker && (
            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-slate-100">
              <View className="flex-row items-center gap-2"><Feather name="users" size={14} color="#4f46e5" /><Text className="text-indigo-600 font-medium text-sm">Broker</Text></View>
              <Text className="text-indigo-900 text-sm font-bold">{lead.broker.companyName || lead.broker.name}</Text>
            </View>
          )}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="calendar" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Last Contacted</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString('en-GB') : 'Never'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="calendar" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Next Follow-up</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString('en-GB') : 'Not scheduled'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="map-pin" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Site Visit</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{lead.siteVisits?.[0]?.scheduledDate ? new Date(lead.siteVisits[0].scheduledDate).toLocaleDateString('en-GB') : 'No visits'}</Text>
          </View>
        </View>
      ) : (
        // Edit Mode
        <View className="gap-4">
          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="globe" size={12} /> Source</Text>
            <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
              <Picker
                selectedValue={leadInfoData.sourceId}
                onValueChange={(val) => setLeadInfoData({ ...leadInfoData, sourceId: val })}
                style={{ height: 50, width: '100%' }}
              >
                <Picker.Item label="Select a source..." value="" color="#9ca3af" />
                {availableSources.map((s) => (
                  <Picker.Item key={s.id} label={s.name} value={s.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="dollar-sign" size={12} /> Budget</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              keyboardType="numeric"
              value={leadInfoData.budget}
              onChangeText={(text) => setLeadInfoData({ ...leadInfoData, budget: text })}
              placeholder="e.g. 5000000"
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="home" size={12} /> Project</Text>
            <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
              <Picker
                selectedValue={leadInfoData.interestedProjectId}
                onValueChange={(val) => setLeadInfoData({ ...leadInfoData, interestedProjectId: val })}
                style={{ height: 50, width: '100%' }}
              >
                <Picker.Item label="Select a project..." value="" color="#9ca3af" />
                {availableProjects.map((p) => (
                  <Picker.Item key={p.id} label={p.name} value={p.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="map-pin" size={12} /> Pref. Location</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              value={leadInfoData.preferredLocation}
              onChangeText={(text) => setLeadInfoData({ ...leadInfoData, preferredLocation: text })}
              placeholder="e.g. Bandra, Andheri"
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="briefcase" size={12} /> Requirements</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              value={leadInfoData.requirements}
              onChangeText={(text) => setLeadInfoData({ ...leadInfoData, requirements: text })}
              placeholder="e.g. 1 BHK, Sea facing"
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="calendar" size={12} /> Last Contacted</Text>
            <TouchableOpacity 
              className="border border-gray-300 rounded-lg p-3 bg-white"
              onPress={() => setShowLastContactPicker(true)}
            >
              <Text className={leadInfoData.lastContactDate ? 'text-gray-900' : 'text-gray-400'}>
                {leadInfoData.lastContactDate ? leadInfoData.lastContactDate : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showLastContactPicker && (
              <DateTimePicker
                value={leadInfoData.lastContactDate ? new Date(leadInfoData.lastContactDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowLastContactPicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setLeadInfoData({ ...leadInfoData, lastContactDate: selectedDate.toISOString().split('T')[0] });
                  }
                }}
              />
            )}
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="calendar" size={12} /> Next Follow-up</Text>
            <TouchableOpacity 
              className="border border-gray-300 rounded-lg p-3 bg-white"
              onPress={() => setShowNextFollowUpPicker(true)}
            >
              <Text className={leadInfoData.nextFollowUpDate ? 'text-gray-900' : 'text-gray-400'}>
                {leadInfoData.nextFollowUpDate ? leadInfoData.nextFollowUpDate : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showNextFollowUpPicker && (
              <DateTimePicker
                value={leadInfoData.nextFollowUpDate ? new Date(leadInfoData.nextFollowUpDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowNextFollowUpPicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setLeadInfoData({ ...leadInfoData, nextFollowUpDate: selectedDate.toISOString().split('T')[0] });
                  }
                }}
              />
            )}
          </View>

          <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-100">
            <View className="flex-row items-center gap-2">
              <Feather name="map-pin" size={14} color="#9ca3af" />
              <Text className="text-gray-400 font-medium text-sm">Site Visit</Text>
            </View>
            <Text className="text-gray-400 text-xs italic">Read only</Text>
          </View>
        </View>
      )}
    </View>
  );
}
