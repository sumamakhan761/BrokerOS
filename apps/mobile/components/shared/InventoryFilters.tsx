import React from 'react';
import { View, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface InventoryFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
}

export default function InventoryFilters({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType
}: InventoryFiltersProps) {
  return (
    <View className="mb-4 space-y-2">
      <TextInput 
        placeholder="Search Unit # (e.g. 101)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="bg-white border border-slate-300 rounded-xl p-3"
      />
      <View className="flex-row gap-2 mt-2">
        <View className="flex-1 bg-white border border-slate-300 rounded-xl overflow-hidden">
          <Picker
            selectedValue={filterStatus}
            onValueChange={setFilterStatus}
            style={{ height: 50, color: '#0f172a' }}
            dropdownIconColor="#0f172a"
          >
            <Picker.Item label="All Status" value="ALL" color="#0f172a" />
            <Picker.Item label="Available" value="AVAILABLE" color="#0f172a" />
            <Picker.Item label="Reserved" value="RESERVED" color="#0f172a" />
            <Picker.Item label="Sold" value="SOLD" color="#0f172a" />
            <Picker.Item label="Blocked" value="BLOCKED" color="#0f172a" />
          </Picker>
        </View>
        <View className="flex-1 bg-white border border-slate-300 rounded-xl overflow-hidden">
          <Picker
            selectedValue={filterType}
            onValueChange={setFilterType}
            style={{ height: 50, color: '#0f172a' }}
            dropdownIconColor="#0f172a"
          >
            <Picker.Item label="All Types" value="ALL" color="#0f172a" />
            <Picker.Item label="Shop" value="SHOP" color="#0f172a" />
            <Picker.Item label="Office" value="OFFICE" color="#0f172a" />
            <Picker.Item label="Studio" value="STUDIO" color="#0f172a" />
            <Picker.Item label="1 BHK" value="ONE_BHK" color="#0f172a" />
            <Picker.Item label="2 BHK" value="TWO_BHK" color="#0f172a" />
            <Picker.Item label="3 BHK" value="THREE_BHK" color="#0f172a" />
          </Picker>
        </View>
      </View>
    </View>
  );
}
