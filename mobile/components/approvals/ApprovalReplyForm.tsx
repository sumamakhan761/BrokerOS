import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ApprovalReplyFormProps {
  ticketStatus: string;
  role: 'SALES_EXECUTIVE' | 'SALES_MANAGER';
  replyDesc: string;
  setReplyDesc: (desc: string) => void;
  replyFile: any;
  setReplyFile: (file: any) => void;
  handleSelectFile: () => void;
  handleReply: () => void;
  loading: boolean;
  handleRedo: () => void;
  handleInstantAction: (action: 'APPROVE' | 'REJECT') => void;
  ticket: any;
}

export function ApprovalReplyForm({
  ticketStatus,
  role,
  replyDesc,
  setReplyDesc,
  replyFile,
  setReplyFile,
  handleSelectFile,
  handleReply,
  loading,
  handleRedo,
  handleInstantAction,
  ticket,
}: ApprovalReplyFormProps) {
  if (ticketStatus === 'CLOSED') return null;

  return (
    <View className="p-4 bg-white border-t border-slate-200">
      {/* Manager Instant Action Buttons */}
      {role === 'SALES_MANAGER' && ticketStatus === 'REQUESTED' && (
        <View className="flex-row justify-center gap-2 mb-3">
          <TouchableOpacity
            className="flex-1 bg-green-600 p-2.5 rounded-xl flex-row justify-center items-center"
            onPress={() => handleInstantAction('APPROVE')}
            disabled={loading}
          >
            <Feather name="check-circle" size={16} color="white" />
            <Text className="text-white font-bold ml-1.5 text-sm">Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-red-600 p-2.5 rounded-xl flex-row justify-center items-center"
            onPress={() => handleInstantAction('REJECT')}
            disabled={loading}
          >
            <Feather name="x-circle" size={16} color="white" />
            <Text className="text-white font-bold ml-1.5 text-sm">Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {role === 'SALES_MANAGER' && (ticketStatus === 'APPROVED' || ticketStatus === 'REJECTED') && ticket.redoCount < 2 && (
        <View className="flex-row justify-center mb-3">
          <TouchableOpacity
            className="flex-1 bg-yellow-500 p-2.5 rounded-xl flex-row justify-center items-center"
            onPress={handleRedo}
            disabled={loading}
          >
            <Feather name="rotate-ccw" size={16} color="white" />
            <Text className="text-white font-bold ml-1.5 text-sm">Redo Decision ({2 - ticket.redoCount} left)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat Input Area */}
      <View className="flex-col gap-2">
        {replyFile && (
          <View className="flex-row items-center bg-indigo-50 border border-indigo-100 rounded-lg p-2 self-start">
            <Feather name="paperclip" size={14} color="#4338ca" />
            <Text className="text-indigo-700 font-semibold text-xs ml-1 mr-2" numberOfLines={1} style={{ maxWidth: 200 }}>
              {replyFile.name}
            </Text>
            <TouchableOpacity onPress={() => setReplyFile(null)}>
              <Feather name="x-circle" size={16} color="#818cf8" />
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={handleSelectFile}
            className="p-2 rounded-full bg-slate-50 border border-slate-200"
          >
            <Feather name="paperclip" size={20} color="#64748b" />
          </TouchableOpacity>

          <TextInput
            placeholder="Type a message..."
            value={replyDesc}
            onChangeText={setReplyDesc}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 h-11 text-slate-800"
          />

          <TouchableOpacity
            onPress={handleReply}
            disabled={loading || (!replyDesc.trim() && !replyFile)}
            className={`p-2.5 rounded-full flex justify-center items-center ${(loading || (!replyDesc.trim() && !replyFile)) ? 'bg-indigo-300' : 'bg-indigo-600'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Feather name="send" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
