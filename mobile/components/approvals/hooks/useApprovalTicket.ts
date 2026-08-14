import { useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { authClient } from '../../../lib/auth-client';

export function useApprovalTicket(ticket: any, onUpdate: () => void) {
  const [loading, setLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyTitle, setReplyTitle] = useState('');
  const [replyDesc, setReplyDesc] = useState('');
  const [replyFile, setReplyFile] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REPLY'>('REPLY');

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setReplyFile(result.assets[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async () => {
    if (!replyTitle || !replyDesc) {
      Alert.alert('Error', 'Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      
      let uploadedUrl = '';
      if (replyFile) {
        const formData = new FormData();
        const filename = replyFile.name || replyFile.uri.split('/').pop() || 'upload.file';
        const type = replyFile.mimeType || 'application/octet-stream';
        formData.append('file', { uri: replyFile.uri, name: filename, type } as any);
        
        const uploadRes = await fetch(`${baseURL}/api/approvals/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedUrl = uploadData.url || '';
        } else {
          Alert.alert('Error', 'Failed to upload file');
          setLoading(false);
          return;
        }
      }

      const { error } = await authClient.$fetch(`/api/approvals/${ticket.id}/messages`, {
        baseURL,
        method: 'POST',
        body: {
          title: replyTitle,
          description: replyDesc,
          fileUrl: uploadedUrl,
          action: actionType,
        },
      });

      if (error) {
        Alert.alert('Error', 'Failed to submit message');
        return;
      }

      Alert.alert('Success', actionType === 'APPROVE' ? 'Request Approved!' : 'Message Sent!');
      setShowReplyForm(false);
      setReplyTitle('');
      setReplyDesc('');
      setReplyFile(null);
      onUpdate();
    } catch (e) {
      Alert.alert('Error', 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    Alert.alert('Close Ticket', 'Are you sure you want to close this ticket?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
            const { error } = await authClient.$fetch(`/api/approvals/${ticket.id}/close`, {
              baseURL,
              method: 'PATCH',
            });
            if (!error) {
              Alert.alert('Success', 'Ticket closed');
              onUpdate();
            }
          } catch (e) {
            Alert.alert('Error', 'Error closing ticket');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return {
    loading,
    showReplyForm,
    setShowReplyForm,
    replyTitle,
    setReplyTitle,
    replyDesc,
    setReplyDesc,
    replyFile,
    setReplyFile,
    actionType,
    setActionType,
    handleSelectFile,
    handleReply,
    handleCloseTicket,
  };
}
