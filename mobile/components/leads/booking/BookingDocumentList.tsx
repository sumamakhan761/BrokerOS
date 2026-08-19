import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { authClient } from '@/lib/auth-client';

const DOC_TYPES = [
  { key: 'AADHAAR', label: 'Aadhaar Card' },
  { key: 'PAN', label: 'PAN Card' },
  { key: 'PASSPORT_PHOTO', label: 'Passport Photo' },
  { key: 'BOOKING_FORM', label: 'Signed Booking Form' },
  { key: 'INCOME_DOCUMENT', label: 'Income Proof (optional)' },
  { key: 'OTHER', label: 'Other Document' },
];

interface BookingDocument {
  type: string;
  fileUrl: string;
  title: string;
}

interface BookingData {
  id: string;
  unitDescription?: string;
  agreedPrice?: number;
  bookingAmount?: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  paymentMode?: string;
  transactionRef?: string;
  loanRequired?: boolean;
  remarks?: string;
  documents: BookingDocument[];
  status: string;
  createdAt: string;
}

interface BookingDocumentListProps {
  booking: BookingData;
  leadId: string;
  onRefresh: () => void;
  saving: boolean;
  setSaving: (val: boolean) => void;
  uploadingType: string | null;
  setUploadingType: (val: string | null) => void;
}

export default function BookingDocumentList({
  booking,
  leadId,
  onRefresh,
  saving,
  setSaving,
  uploadingType,
  setUploadingType
}: BookingDocumentListProps) {

  const handleDocumentUpload = async (docType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets[0] && booking) {
        setUploadingType(docType);
        const file = result.assets[0];
        
        const formData = new FormData();
        formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as any);
        formData.append('docType', docType);
        formData.append('bookingId', booking.id);
        
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await fetch(`${baseURL}/api/leads/${leadId}/booking/documents`, {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          onRefresh();
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to upload document' });
        }
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Upload failed' });
    } finally {
      setUploadingType(null);
    }
  };

  const handleMarkDone = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch(`/api/leads/${leadId}/booking/done`, {
        baseURL,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { bookingId: booking.id },
      });
      if (!error) {
        onRefresh();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to mark as done' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="mt-6 border-t border-gray-100 pt-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-bold text-gray-900 text-lg">Documents Required</Text>
        <View className="bg-blue-50 px-2 py-1 rounded">
          <Text className="text-blue-600 text-xs font-bold">{booking.documents?.length || 0} / {DOC_TYPES.length - 2} uploaded</Text>
        </View>
      </View>
      
      <View className="space-y-3">
        {DOC_TYPES.map(docType => {
          const uploadedDoc = booking.documents?.find(d => d.type === docType.key);
          const isUploading = uploadingType === docType.key;
          
          return (
            <View key={docType.key} className="flex-row items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
              <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${uploadedDoc ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Feather name={uploadedDoc ? "check" : "file"} size={16} color={uploadedDoc ? "#16a34a" : "#64748b"} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{docType.label}</Text>
                  {uploadedDoc ? (
                    <Text className="text-xs text-green-600 font-medium">Uploaded Successfully</Text>
                  ) : (
                    <Text className="text-xs text-gray-500">Pending upload</Text>
                  )}
                </View>
              </View>
              
              <View className="flex-row items-center ml-2">
                {uploadedDoc && (
                  <TouchableOpacity 
                    onPress={() => {
                      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
                      Linking.openURL(uploadedDoc.fileUrl.startsWith('http') ? uploadedDoc.fileUrl : `${baseUrl}${uploadedDoc.fileUrl}`);
                    }}
                    className="p-2 mr-1"
                  >
                    <Feather name="eye" size={18} color="#2563eb" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  onPress={() => handleDocumentUpload(docType.key)}
                  disabled={isUploading}
                  className={`p-2 rounded-lg ${uploadedDoc ? 'bg-gray-200' : 'bg-blue-100'}`}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <Feather name={uploadedDoc ? "refresh-cw" : "upload"} size={16} color={uploadedDoc ? "#475569" : "#2563eb"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
      
      {booking.status !== 'CONFIRMED' && (
        <View className="mt-6">
          <Text className="text-sm text-gray-500 mb-3 text-center">
            Once you have uploaded the signed booking form and payment proof, you can send it for manager approval.
          </Text>
          <TouchableOpacity
            onPress={handleMarkDone}
            disabled={saving || !booking.documents?.some(d => d.type === 'BOOKING_FORM')}
            className={`w-full py-4 rounded-xl flex-row justify-center items-center ${
              !booking.documents?.some(d => d.type === 'BOOKING_FORM') ? 'bg-gray-300' : 'bg-emerald-600'
            }`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="check-circle" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Submit for Approval</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
