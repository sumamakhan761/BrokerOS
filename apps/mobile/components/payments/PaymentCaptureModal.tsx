import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, Upload } from 'lucide-react-native';

interface PaymentCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  scheduleId: string;
  amount: number;
  onSuccess: () => void;
}

export function PaymentCaptureModal({ visible, onClose, scheduleId, amount, onSuccess }: PaymentCaptureModalProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, requestPermission] = ImagePicker.useCameraPermissions();

  const handleCapture = async () => {
    if (!cameraPermission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        Toast.show({ type: 'info', text1: 'Permission Required', text2: 'Camera permission is required to capture the receipt.' });
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('amountPaid', amount.toString());
      formData.append('remarks', 'Uploaded via Mobile App');

      const filename = imageUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      // @ts-ignore
      formData.append('receipt', {
        uri: imageUri,
        name: filename,
        type,
      });

      // Fetch the base URL from env or use standard proxy
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${apiUrl}/api/payments/${scheduleId}/pay`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Note: Content-Type is set automatically by fetch when using FormData
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      Toast.show({ type: 'success', text1: 'Success', text2: 'Payment marked as paid successfully!' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Upload Error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to upload receipt. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 min-h-[50%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Mark as Paid</Text>
            <TouchableOpacity onPress={onClose} disabled={uploading}>
              <X size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-4">
            You are about to mark this installment of ₹{amount.toLocaleString('en-IN')} as paid. Please capture a picture of the receipt or cheque.
          </Text>

          {imageUri ? (
            <View className="items-center mb-6">
              <Image 
                source={{ uri: imageUri }} 
                className="w-full h-64 rounded-xl mb-4"
                resizeMode="cover"
              />
              <TouchableOpacity 
                onPress={handleCapture}
                className="py-2 px-4 bg-gray-100 rounded-lg"
                disabled={uploading}
              >
                <Text className="text-gray-700 font-medium">Retake Picture</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={handleCapture}
              className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center mb-6"
            >
              <Camera size={48} color="#9CA3AF" />
              <Text className="text-gray-500 font-medium mt-2">Tap to open Camera</Text>
            </TouchableOpacity>
          )}

          <View className="mt-auto">
            <TouchableOpacity
              onPress={handleUpload}
              disabled={!imageUri || uploading}
              className={`flex-row justify-center items-center py-4 rounded-xl ${
                !imageUri || uploading ? 'bg-blue-300' : 'bg-blue-600'
              }`}
            >
              {uploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Upload size={20} color="white" className="mr-2" />
                  <Text className="text-white font-bold text-lg">Confirm & Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
