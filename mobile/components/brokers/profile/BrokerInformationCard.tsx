import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface BrokerInformationCardProps {
  broker: any;
  isEditingBrokerInfo?: boolean;
  setIsEditingBrokerInfo?: (val: boolean) => void;
  brokerInfoData?: any;
  setBrokerInfoData?: (data: any) => void;
  handleBrokerInfoSave?: () => void;
  canEdit?: boolean;
}

export function BrokerInformationCard({ 
  broker,
  isEditingBrokerInfo = false,
  setIsEditingBrokerInfo = () => {},
  brokerInfoData = {},
  setBrokerInfoData = () => {},
  handleBrokerInfoSave = () => {},
  canEdit = false
}: BrokerInformationCardProps) {
  if (!broker) return null;

  const handleEditOpen = () => {
    setIsEditingBrokerInfo(true);
    setBrokerInfoData({
      reraNumber: broker.reraNumber || '',
      gstNumber: broker.gstNumber || '',
      serviceAreas: broker.serviceAreas || '',
      companyName: broker.companyName || '',
    });
  };

  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm mt-4">
      <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <View className="flex-row items-center gap-2">
          <Feather name="briefcase" size={18} color="#4f46e5" />
          <Text className="text-lg font-bold text-gray-900">Broker Information</Text>
        </View>
        {canEdit && (
          !isEditingBrokerInfo ? (
            <TouchableOpacity onPress={handleEditOpen} className="p-1.5 rounded-full bg-indigo-50">
              <Feather name="edit-2" size={14} color="#4f46e5" />
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => setIsEditingBrokerInfo(false)} className="p-1.5 rounded-full bg-red-50">
                <Feather name="x" size={16} color="#dc2626" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBrokerInfoSave} className="p-1.5 rounded-full bg-green-50">
                <Feather name="check" size={16} color="#16a34a" />
              </TouchableOpacity>
            </View>
          )
        )}
      </View>

      {!isEditingBrokerInfo ? (
        // Display Mode
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="briefcase" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Company Name</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{broker.companyName || 'N/A'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="file-text" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">RERA</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{broker.reraNumber || 'N/A'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="file-text" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">GST</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{broker.gstNumber || 'N/A'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="map" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Service Areas</Text></View>
            <Text className="text-gray-900 text-sm font-medium max-w-[150px]" numberOfLines={1}>{broker.serviceAreas || 'N/A'}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2"><Feather name="globe" size={14} color="#6b7280" /><Text className="text-gray-500 font-medium text-sm">Source</Text></View>
            <Text className="text-gray-900 text-sm font-medium">{broker.source?.name || 'Manual'}</Text>
          </View>
        </View>
      ) : (
        // Edit Mode
        <View className="gap-4">
          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="briefcase" size={12} /> Company Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              value={brokerInfoData.companyName}
              onChangeText={(text) => setBrokerInfoData({ ...brokerInfoData, companyName: text })}
              placeholder="Company Name"
            />
          </View>
          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="file-text" size={12} /> RERA</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              value={brokerInfoData.reraNumber}
              onChangeText={(text) => setBrokerInfoData({ ...brokerInfoData, reraNumber: text })}
              placeholder="RERA Number"
            />
          </View>
          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="file-text" size={12} /> GST</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              value={brokerInfoData.gstNumber}
              onChangeText={(text) => setBrokerInfoData({ ...brokerInfoData, gstNumber: text })}
              placeholder="GST Number"
            />
          </View>
          <View>
            <Text className="text-xs font-semibold text-gray-500 mb-1 flex-row items-center"><Feather name="map" size={12} /> Service Areas</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white text-gray-900"
              value={brokerInfoData.serviceAreas}
              onChangeText={(text) => setBrokerInfoData({ ...brokerInfoData, serviceAreas: text })}
              placeholder="Service Areas"
            />
          </View>
        </View>
      )}
    </View>
  );
}
