import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Upload, Download } from 'lucide-react-native';

interface HandoverFormProps {
  booking: any;
  saving: boolean;
  saveModelData: (endpoint: string, data: any) => void;
  uploadFile: (type: 'loan' | 'agreement' | 'handover', fieldName: string) => void;
}

export function HandoverForm({ booking, saving, saveModelData, uploadFile }: HandoverFormProps) {
  const [handoverData, setHandoverData] = useState(booking?.possession || {});

  useEffect(() => {
    if (booking?.possession) {
      setHandoverData(booking.possession);
    }
  }, [booking?.possession]);

  return (
    <View className="space-y-3">
      <View className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden mb-1">
        <Picker
          selectedValue={handoverData.status || 'NOT_READY'}
          onValueChange={(itemValue) => setHandoverData({...handoverData, status: itemValue})}
          style={{ height: 50, width: '100%', color: 'black' }}
          dropdownIconColor="black"
        >
          <Picker.Item label="Not Ready" value="NOT_READY" color="black" />
          <Picker.Item label="Ready" value="READY" color="black" />
          <Picker.Item label="Scheduled" value="SCHEDULED" color="black" />
          <Picker.Item label="Handed Over" value="HANDED_OVER" color="black" />
        </Picker>
      </View>
      
      <TextInput 
        placeholder="Scheduled Date (YYYY-MM-DD)"
        placeholderTextColor="#9ca3af"
        value={handoverData.scheduledDate ? new Date(handoverData.scheduledDate).toISOString().split('T')[0] : ''} 
        onChangeText={text => setHandoverData({...handoverData, scheduledDate: text ? new Date(text).toISOString() : null})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      
      <TextInput 
        placeholder="Parking Slot No."
        placeholderTextColor="#9ca3af"
        value={handoverData.parkingSlotNumber || ''} 
        onChangeText={text => setHandoverData({...handoverData, parkingSlotNumber: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      
      <TextInput 
        placeholder="Electricity Meter No."
        placeholderTextColor="#9ca3af"
        value={handoverData.electricityMeterNumber || ''} 
        onChangeText={text => setHandoverData({...handoverData, electricityMeterNumber: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      
      <TextInput 
        placeholder="Water Meter No."
        placeholderTextColor="#9ca3af"
        value={handoverData.waterMeterNumber || ''} 
        onChangeText={text => setHandoverData({...handoverData, waterMeterNumber: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      
      <TextInput 
        placeholder="Customer Feedback"
        placeholderTextColor="#9ca3af"
        value={handoverData.customerFeedback || ''} 
        onChangeText={text => setHandoverData({...handoverData, customerFeedback: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />

      <View className="flex-row items-center justify-between px-2 py-1 mt-1">
        <Text className="text-gray-700 text-sm font-medium">Snags Resolved</Text>
        <TouchableOpacity onPress={() => setHandoverData({...handoverData, snagResolved: !handoverData.snagResolved})}>
          <View className={`w-6 h-6 rounded-md border ${handoverData.snagResolved ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'} items-center justify-center`}>
            {handoverData.snagResolved && <Text className="text-white text-xs font-bold">✓</Text>}
          </View>
        </TouchableOpacity>
      </View>
      
      <View className="flex-row items-center justify-between px-2 py-1">
        <Text className="text-gray-700 text-sm font-medium">Keys Handed Over</Text>
        <TouchableOpacity onPress={() => setHandoverData({...handoverData, keysHandedOver: !handoverData.keysHandedOver})}>
          <View className={`w-6 h-6 rounded-md border ${handoverData.keysHandedOver ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'} items-center justify-center`}>
            {handoverData.keysHandedOver && <Text className="text-white text-xs font-bold">✓</Text>}
          </View>
        </TouchableOpacity>
      </View>

      <TextInput 
        placeholder="Handover Notes"
        placeholderTextColor="#9ca3af"
        value={handoverData.handoverNotes || ''} 
        onChangeText={text => setHandoverData({...handoverData, handoverNotes: text})} 
        multiline
        numberOfLines={3}
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50 mt-2 min-h-[80px]" 
        textAlignVertical="top"
      />
      
      <TouchableOpacity onPress={() => saveModelData('handover', handoverData)} disabled={saving} className="bg-indigo-600 px-4 py-3 rounded-xl items-center mt-2 shadow-sm">
        <Text className="text-white font-semibold text-sm">Save Details</Text>
      </TouchableOpacity>

      <View className="mt-4 border-t border-gray-100 pt-4 space-y-3">
        {(['occupancyCertUrl', 'completionCertUrl', 'handoverDocUrl'] as const).map(field => (
          <View key={field} className="flex-row items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
            <Text className="text-sm font-semibold text-gray-900">{field.replace('Url', '')}</Text>
            {booking?.possession?.[field] ? (
              <TouchableOpacity onPress={() => Linking.openURL(booking.possession[field])} className="flex-row items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                <Download size={14} color="#2563eb" />
                <Text className="text-blue-600 font-bold text-xs">View</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => uploadFile('handover', field)} disabled={saving} className="flex-row items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Upload size={14} color="#4b5563" />
                <Text className="text-gray-600 font-bold text-xs">Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
