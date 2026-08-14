import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Upload, Download } from 'lucide-react-native';

interface AgreementFormProps {
  booking: any;
  saving: boolean;
  saveModelData: (endpoint: string, data: any) => void;
  uploadFile: (type: 'loan' | 'agreement' | 'handover', fieldName: string) => void;
}

export function AgreementForm({ booking, saving, saveModelData, uploadFile }: AgreementFormProps) {
  const [agreementData, setAgreementData] = useState(booking?.agreement || {});

  useEffect(() => {
    if (booking?.agreement) {
      setAgreementData(booking.agreement);
    }
  }, [booking?.agreement]);

  return (
    <View className="space-y-3">
      <TextInput
        placeholder="Agreement Number"
        placeholderTextColor="#9ca3af"
        value={agreementData.agreementNumber || ''}
        onChangeText={text => setAgreementData({ ...agreementData, agreementNumber: text })}
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50"
      />
      <View className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
        <Picker
          selectedValue={agreementData.status || 'NOT_STARTED'}
          onValueChange={(itemValue) => setAgreementData({ ...agreementData, status: itemValue })}
          style={{ height: 50, width: '100%', color: 'black' }}
          dropdownIconColor="black"
        >
          <Picker.Item label="Not Started" value="NOT_STARTED" color="black" />
          <Picker.Item label="Draft Prepared" value="DRAFT_PREPARED" color="black" />
          <Picker.Item label="Stamp Duty Paid" value="STAMP_DUTY_PAID" color="black" />
          <Picker.Item label="Registered" value="REGISTERED" color="black" />
          <Picker.Item label="Completed" value="COMPLETED" color="black" />
        </Picker>
      </View>

      <TextInput
        placeholder="Sub-Registrar Office"
        placeholderTextColor="#9ca3af"
        value={agreementData.subRegistrarOffice || ''}
        onChangeText={text => setAgreementData({ ...agreementData, subRegistrarOffice: text })}
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50"
      />

      <TextInput
        placeholder="Appointment Time (YYYY-MM-DD HH:MM)"
        placeholderTextColor="#9ca3af"
        value={agreementData.appointmentTime ? new Date(agreementData.appointmentTime).toISOString().slice(0, 16).replace('T', ' ') : ''}
        onChangeText={text => setAgreementData({ ...agreementData, appointmentTime: new Date(text).toISOString() })}
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50"
      />

      <TextInput
        placeholder="Stamp Duty Amount (₹)"
        placeholderTextColor="#9ca3af"
        value={agreementData.stampDutyAmount ? String(agreementData.stampDutyAmount) : ''}
        onChangeText={text => setAgreementData({ ...agreementData, stampDutyAmount: Number(text) })}
        keyboardType="numeric"
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50"
      />

      <TextInput
        placeholder="Registration Fee (₹)"
        placeholderTextColor="#9ca3af"
        value={agreementData.registrationFee ? String(agreementData.registrationFee) : ''}
        onChangeText={text => setAgreementData({ ...agreementData, registrationFee: Number(text) })}
        keyboardType="numeric"
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50"
      />

      <TextInput
        placeholder="Lawyer Name"
        placeholderTextColor="#9ca3af"
        value={agreementData.lawyerName || ''}
        onChangeText={text => setAgreementData({ ...agreementData, lawyerName: text })}
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50"
      />

      <TextInput
        placeholder="Lawyer Contact"
        placeholderTextColor="#9ca3af"
        value={agreementData.lawyerContact || ''}
        onChangeText={text => setAgreementData({ ...agreementData, lawyerContact: text })}
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50"
      />

      <TextInput
        placeholder="Remarks / Notes"
        placeholderTextColor="#9ca3af"
        value={agreementData.remarks || ''}
        onChangeText={text => setAgreementData({ ...agreementData, remarks: text })}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50 min-h-[60px]"
      />

      <TouchableOpacity onPress={() => saveModelData('agreement', agreementData)} disabled={saving} className="bg-indigo-600 px-4 py-3 rounded-xl items-center mt-2 shadow-sm">
        <Text className="text-white font-semibold text-sm">Save Details</Text>
      </TouchableOpacity>

      <View className="mt-4 border-t border-gray-100 pt-4 space-y-3">
        {(['draftDocumentUrl', 'finalDocumentUrl'] as const).map(field => (
          <View key={field} className="flex-row items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
            <Text className="text-sm font-semibold text-gray-900">{field === 'draftDocumentUrl' ? 'Draft Document' : 'Final Document'}</Text>
            {booking?.agreement?.[field] ? (
              <TouchableOpacity onPress={() => Linking.openURL(booking.agreement[field])} className="flex-row items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                <Download size={14} color="#2563eb" />
                <Text className="text-blue-600 font-bold text-xs">View</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => uploadFile('agreement', field)} disabled={saving} className="flex-row items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
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
