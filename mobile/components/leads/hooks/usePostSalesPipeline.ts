import { useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { authClient } from '../../../lib/auth-client';

export function usePostSalesPipeline(leadId: string, bookingId: string, onRefresh: () => void) {
  const [saving, setSaving] = useState(false);

  const handleMarkStageDone = async (status: string, subStatus: string) => {
    setSaving(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch(`${baseURL}/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: { status, subStatus },
      });
      if (!error) {
        onRefresh();
      } else {
        Alert.alert('Error', 'Failed to mark stage as done');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (type: 'loan' | 'agreement' | 'handover', fieldName: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets[0]) {
        setSaving(true);
        const file = result.assets[0];
        
        const formData = new FormData();
        formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as any);
        formData.append('bookingId', bookingId);
        formData.append('type', type);
        formData.append('fieldName', fieldName);
        
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await fetch(`${baseURL}/api/leads/${leadId}/booking/post-sales-file`, {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          onRefresh();
        } else {
          Alert.alert('Error', 'Failed to upload file');
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadDoc = async (docType: string, description?: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets[0]) {
        setSaving(true);
        const file = result.assets[0];
        
        const formData = new FormData();
        formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as any);
        formData.append('docType', docType);
        formData.append('bookingId', bookingId);
        if (description) {
          formData.append('description', description);
        }

        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await fetch(`${baseURL}/api/leads/${leadId}/booking/documents`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          onRefresh();
        } else {
          Alert.alert('Error', 'Failed to upload document');
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const saveModelData = async (endpoint: string, data: any) => {
    setSaving(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await fetch(`${baseURL}/api/leads/${leadId}/booking/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bookingId, data }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        Alert.alert('Error', 'Failed to save details');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleMarkStageDone,
    uploadFile,
    uploadDoc,
    saveModelData,
  };
}
