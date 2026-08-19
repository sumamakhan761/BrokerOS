import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ApprovalReplyFormProps {
  ticketStatus: string;
  role: 'SALES_EXECUTIVE' | 'SALES_MANAGER';
  showReplyForm: boolean;
  setShowReplyForm: (show: boolean) => void;
  actionType: 'APPROVE' | 'REJECT' | 'REPLY';
  setActionType: (type: 'APPROVE' | 'REJECT' | 'REPLY') => void;
  replyTitle: string;
  setReplyTitle: (title: string) => void;
  replyDesc: string;
  setReplyDesc: (desc: string) => void;
  replyFile: any;
  setReplyFile: (file: any) => void;
  handleSelectFile: () => void;
  handleReply: () => void;
  loading: boolean;
  handleRedo: () => void;
  ticket: any;
}

export function ApprovalReplyForm({
  ticketStatus,
  role,
  showReplyForm,
  setShowReplyForm,
  actionType,
  setActionType,
  replyTitle,
  setReplyTitle,
  replyDesc,
  setReplyDesc,
  replyFile,
  setReplyFile,
  handleSelectFile,
  handleReply,
  loading,
  handleRedo,
  ticket,
}: ApprovalReplyFormProps) {
  if (ticketStatus === 'CLOSED') return null;

  return (
    <View className="p-4 bg-white border-t border-slate-200 pb-8">
      {!showReplyForm ? (
        <View className="flex-row justify-center gap-2">
          {role === 'SALES_MANAGER' && ticketStatus === 'REQUESTED' ? (
            <>
              <TouchableOpacity
                className="flex-1 bg-green-600 p-3 rounded-xl flex-row justify-center items-center"
                onPress={() => { setActionType('APPROVE'); setShowReplyForm(true); }}
              >
                <Feather name="check-circle" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600 p-3 rounded-xl flex-row justify-center items-center"
                onPress={() => { setActionType('REJECT'); setShowReplyForm(true); }}
              >
                <Feather name="x-circle" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Reject</Text>
              </TouchableOpacity>
            </>
          ) : role === 'SALES_MANAGER' && (ticketStatus === 'APPROVED' || ticketStatus === 'REJECTED') && ticket.redoCount < 2 ? (
            <TouchableOpacity
              className="flex-1 bg-yellow-500 p-3 rounded-xl flex-row justify-center items-center"
              onPress={handleRedo}
              disabled={loading}
            >
              <Feather name="rotate-ccw" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Redo Decision ({2 - ticket.redoCount} left)</Text>
            </TouchableOpacity>
          ) : ticketStatus === 'REQUESTED' ? (
            <TouchableOpacity
              className="flex-1 bg-[#2563eb] p-3 rounded-xl flex-row justify-center items-center"
              onPress={() => setShowReplyForm(true)}
            >
              <Feather name="message-circle" size={18} color="white" />
              <Text className="text-white font-bold ml-2">
                Send Message
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <View className="space-y-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-slate-800">
              {actionType === 'APPROVE' ? 'Approve' : actionType === 'REJECT' ? 'Reject' : 'Write a Message'}
            </Text>
            <TouchableOpacity onPress={() => setShowReplyForm(false)}>
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Title (e.g., Approved with conditions)"
            value={replyTitle}
            onChangeText={setReplyTitle}
            className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800"
          />
          <TextInput
            placeholder="Write your detailed response here..."
            value={replyDesc}
            onChangeText={setReplyDesc}
            multiline
            numberOfLines={3}
            className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 min-h-[80px]"
            textAlignVertical="top"
          />
          <View>
            <Text className="text-xs font-medium text-slate-500 mb-1">Attachment (Optional)</Text>
            <TouchableOpacity onPress={handleSelectFile} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-row items-center justify-between">
              <Text className="text-slate-600 flex-1 mr-2" numberOfLines={1}>{replyFile ? replyFile.name : 'Select a file...'}</Text>
              {replyFile && (
                 <TouchableOpacity onPress={() => setReplyFile(null)}>
                   <Feather name="x-circle" size={16} color="#94a3b8" />
                 </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`p-3 rounded-xl flex-row justify-center items-center mt-2 ${actionType === 'APPROVE' ? 'bg-green-600' : actionType === 'REJECT' ? 'bg-red-600' : 'bg-[#2563eb]'}`}
            onPress={handleReply}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-bold text-center">
                {actionType === 'APPROVE' ? 'Approve Now' : actionType === 'REJECT' ? 'Reject Now' : 'Send Message'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
