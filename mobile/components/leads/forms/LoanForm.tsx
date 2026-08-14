import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Upload, Download } from 'lucide-react-native';

interface LoanFormProps {
  booking: any;
  saving: boolean;
  saveModelData: (endpoint: string, data: any) => void;
  uploadFile: (type: 'loan' | 'agreement' | 'handover', fieldName: string) => void;
}

export function LoanForm({ booking, saving, saveModelData, uploadFile }: LoanFormProps) {
  const [loanData, setLoanData] = useState(booking?.loanCase || {});

  useEffect(() => {
    if (booking?.loanCase) {
      setLoanData(booking.loanCase);
    }
  }, [booking?.loanCase]);

  return (
    <View className="space-y-3">
      <TextInput 
        placeholder="Loan Application No."
        placeholderTextColor="#9ca3af"
        value={loanData.loanApplicationNumber || ''} 
        onChangeText={text => setLoanData({...loanData, loanApplicationNumber: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <View className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
        <Picker
          selectedValue={loanData.status || 'NOT_APPLIED'}
          onValueChange={(itemValue) => setLoanData({...loanData, status: itemValue})}
          style={{ height: 50, width: '100%', color: 'black' }}
          dropdownIconColor="black"
        >
          <Picker.Item label="Not Applied" value="NOT_APPLIED" color="black" />
          <Picker.Item label="Applied" value="APPLIED" color="black" />
          <Picker.Item label="Documents Submitted" value="DOCUMENTS_SUBMITTED" color="black" />
          <Picker.Item label="Under Review" value="UNDER_REVIEW" color="black" />
          <Picker.Item label="Approved" value="APPROVED" color="black" />
          <Picker.Item label="Disbursed" value="DISBURSED" color="black" />
          <Picker.Item label="Rejected" value="REJECTED" color="black" />
        </Picker>
      </View>
      <TextInput 
        placeholder="Bank Name"
        placeholderTextColor="#9ca3af"
        value={loanData.bankName || ''} 
        onChangeText={text => setLoanData({...loanData, bankName: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <TextInput 
        placeholder="Branch"
        placeholderTextColor="#9ca3af"
        value={loanData.bankBranch || ''} 
        onChangeText={text => setLoanData({...loanData, bankBranch: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <TextInput 
        placeholder="DSA / Agent Name"
        placeholderTextColor="#9ca3af"
        value={loanData.dsaName || ''} 
        onChangeText={text => setLoanData({...loanData, dsaName: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <TextInput 
        placeholder="DSA Contact"
        placeholderTextColor="#9ca3af"
        value={loanData.dsaContact || ''} 
        onChangeText={text => setLoanData({...loanData, dsaContact: text})} 
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <TextInput 
        placeholder="Applied Amount (₹)"
        placeholderTextColor="#9ca3af"
        value={loanData.loanAmount ? String(loanData.loanAmount) : ''} 
        onChangeText={text => setLoanData({...loanData, loanAmount: Number(text)})} 
        keyboardType="numeric"
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <TextInput 
        placeholder="Approved Amount (₹)"
        placeholderTextColor="#9ca3af"
        value={loanData.approvedAmount ? String(loanData.approvedAmount) : ''} 
        onChangeText={text => setLoanData({...loanData, approvedAmount: Number(text)})} 
        keyboardType="numeric"
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <TextInput 
        placeholder="Interest Rate (%)"
        placeholderTextColor="#9ca3af"
        value={loanData.interestRate ? String(loanData.interestRate) : ''} 
        onChangeText={text => setLoanData({...loanData, interestRate: Number(text)})} 
        keyboardType="numeric"
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <TextInput 
        placeholder="Tenure (Months)"
        placeholderTextColor="#9ca3af"
        value={loanData.tenure ? String(loanData.tenure) : ''} 
        onChangeText={text => setLoanData({...loanData, tenure: Number(text)})} 
        keyboardType="numeric"
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50" 
      />
      <TextInput 
        placeholder="Internal Notes / Remarks"
        placeholderTextColor="#9ca3af"
        value={loanData.internalNotes || ''} 
        onChangeText={text => setLoanData({...loanData, internalNotes: text})} 
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        className="w-full text-sm text-black border border-gray-200 rounded-lg px-3 py-3 bg-gray-50 min-h-[60px]" 
      />

      <TouchableOpacity onPress={() => saveModelData('loan-case', loanData)} disabled={saving} className="bg-indigo-600 px-4 py-3 rounded-xl items-center mt-2 shadow-sm">
        <Text className="text-white font-semibold text-sm">Save Details</Text>
      </TouchableOpacity>

      <View className="mt-4 border-t border-gray-100 pt-4">
        <View className="flex-row items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
          <Text className="text-sm font-semibold text-gray-900">Sanction Letter</Text>
          {booking?.loanCase?.sanctionLetterUrl ? (
            <TouchableOpacity onPress={() => Linking.openURL(booking.loanCase.sanctionLetterUrl)} className="flex-row items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
              <Download size={14} color="#2563eb" />
              <Text className="text-blue-600 font-bold text-xs">View</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => uploadFile('loan', 'sanctionLetterUrl')} disabled={saving} className="flex-row items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Upload size={14} color="#4b5563" />
              <Text className="text-gray-600 font-bold text-xs">Upload</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
