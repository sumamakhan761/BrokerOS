import React from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { CheckCircle2, XCircle, RotateCcw, Paperclip, Send, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

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

  const onInstantAction = (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    handleInstantAction(action);
  };

  const onSendReply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleReply();
  };

  const onRedoAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleRedo();
  };

  const onAttach = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSelectFile();
  };

  const canSend = Boolean(replyDesc.trim() || replyFile);

  return (
    <View className="p-4 bg-white border-t border-slate-200/80 shadow-xs">
      {/* Manager Instant Action Buttons */}
      {role === 'SALES_MANAGER' && ticketStatus === 'REQUESTED' && (
        <View className="flex-row justify-center gap-2.5 mb-3">
          <Pressable
            className="flex-1 bg-emerald-600 p-3 rounded-2xl flex-row justify-center items-center gap-1.5 active:scale-[0.98] transition-transform shadow-xs"
            onPress={() => onInstantAction('APPROVE')}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Approve Ticket"
          >
            <CheckCircle2 size={18} color="white" strokeWidth={2.5} />
            <Text
              className="text-white font-extrabold text-sm"
              style={{ includeFontPadding: false }}
            >
              Approve
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 bg-rose-600 p-3 rounded-2xl flex-row justify-center items-center gap-1.5 active:scale-[0.98] transition-transform shadow-xs"
            onPress={() => onInstantAction('REJECT')}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Reject Ticket"
          >
            <XCircle size={18} color="white" strokeWidth={2.5} />
            <Text
              className="text-white font-extrabold text-sm"
              style={{ includeFontPadding: false }}
            >
              Reject
            </Text>
          </Pressable>
        </View>
      )}

      {/* Redo Decision Button */}
      {role === 'SALES_MANAGER' && (ticketStatus === 'APPROVED' || ticketStatus === 'REJECTED') && ticket.redoCount < 2 && (
        <View className="flex-row justify-center mb-3">
          <Pressable
            className="flex-1 bg-amber-500 p-3 rounded-2xl flex-row justify-center items-center gap-1.5 active:scale-[0.98] transition-transform"
            onPress={onRedoAction}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Redo Decision"
          >
            <RotateCcw size={16} color="white" strokeWidth={2.5} />
            <Text
              className="text-white font-extrabold text-sm"
              style={{ includeFontPadding: false }}
            >
              Redo Decision ({2 - ticket.redoCount} left)
            </Text>
          </Pressable>
        </View>
      )}

      {/* Chat Input Area */}
      <View className="gap-2">
        {replyFile && (
          <View className="flex-row items-center bg-blue-50 border border-blue-200/80 rounded-xl p-2.5 self-start">
            <Paperclip size={14} color="#2563eb" />
            <Text
              className="text-blue-700 font-bold text-xs ml-1.5 mr-2"
              numberOfLines={1}
              style={{ maxWidth: 220, includeFontPadding: false }}
            >
              {replyFile.name}
            </Text>
            <Pressable
              onPress={() => setReplyFile(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={14} color="#64748b" />
            </Pressable>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onAttach}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 items-center justify-center active:scale-95 transition-transform"
          >
            <Paperclip size={18} color="#64748b" />
          </Pressable>

          <TextInput
            placeholder="Type a message or rationale…"
            placeholderTextColor="#94a3b8"
            value={replyDesc}
            onChangeText={setReplyDesc}
            className="flex-1 bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 h-11 text-slate-900 text-sm font-medium"
          />

          <Pressable
            onPress={onSendReply}
            disabled={loading || !canSend}
            className={`w-11 h-11 rounded-2xl items-center justify-center active:scale-95 transition-transform shadow-xs ${
              !canSend || loading ? 'bg-blue-300' : 'bg-blue-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Send size={18} color="white" strokeWidth={2.2} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
