import { useState } from 'react';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import { authClient } from '../../../lib/auth-client';

export function useApprovalTicket(ticket: any, onUpdate: () => void) {
  const [loading, setLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyTitle, setReplyTitle] = useState('');
  const [replyDesc, setReplyDesc] = useState('');
  const [replyFile, setReplyFile] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REPLY'>('REPLY');

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
      Toast.show({ type: 'error', text1: 'Error', text2: 'Title and description are required.' });
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
        
        const uploadRes = await authClient.$fetch('/api/approvals/upload', {
          baseURL,
          method: 'POST',
          body: formData as any,
        });
        
        if (!uploadRes.error && uploadRes.data) {
          uploadedUrl = (uploadRes.data as any).url || '';
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to upload file' });
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
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to submit message' });
        return;
      }

      Toast.show({ type: 'success', text1: actionType === 'APPROVE' ? 'Request Approved!' : actionType === 'REJECT' ? 'Request Rejected!' : 'Message Sent!' });
      setShowReplyForm(false);
      setReplyTitle('');
      setReplyDesc('');
      setReplyFile(null);
      onUpdate();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch(`/api/approvals/${ticket.id}/close`, {
        baseURL,
        method: 'PATCH',
      });
      if (!error) {
        Toast.show({ type: 'success', text1: 'Ticket closed' });
        onUpdate();
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error closing ticket' });
    } finally {
      setLoading(false);
    }
  };

  const handleRedo = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error, data } = await authClient.$fetch(`/api/approvals/${ticket.id}/redo`, {
        baseURL,
        method: 'POST',
      });
      if (!error) {
        Toast.show({ type: 'success', text1: 'Action Undone' });
        onUpdate();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Cannot redo' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error undoing action' });
    } finally {
      setLoading(false);
    }
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
    handleRedo,
  };
}
