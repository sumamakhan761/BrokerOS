import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeft, XCircle, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ApprovalTicketHeaderProps {
  ticket: any;
  role: 'SALES_EXECUTIVE' | 'SALES_MANAGER';
  onBack: () => void;
  loading: boolean;
  onCloseTicket: () => void;
}

export function ApprovalTicketHeader({ ticket, role, onBack, loading, onCloseTicket }: ApprovalTicketHeaderProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return { bg: 'bg-amber-50 border-amber-200/80', text: 'text-amber-700' };
      case 'APPROVED':
        return { bg: 'bg-emerald-50 border-emerald-200/80', text: 'text-emerald-700' };
      case 'REJECTED':
        return { bg: 'bg-rose-50 border-rose-200/80', text: 'text-rose-700' };
      case 'CLOSED':
        return { bg: 'bg-slate-100 border-slate-200/80', text: 'text-slate-600' };
      default:
        return { bg: 'bg-slate-100 border-slate-200/80', text: 'text-slate-600' };
    }
  };

  const statusBadge = getStatusBadge(ticket.status);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCloseTicket();
  };

  return (
    <View className="p-4 border-b border-slate-200/80 bg-white flex-row items-center justify-between shadow-xs">
      <View className="flex-row items-center flex-1 pr-2">
        <Pressable
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Back to approvals list"
          className="mr-3 w-9 h-9 bg-slate-50 rounded-xl items-center justify-center border border-slate-200/80 active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} color="#0f172a" strokeWidth={2.2} />
        </Pressable>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="font-extrabold text-base text-slate-900 leading-tight"
              style={{ includeFontPadding: false }}
            >
              Ticket #{ticket.id.slice(0, 8).toUpperCase()}
            </Text>
            {ticket.type === 'BOOKING' && (
              <View className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                <Text
                  className="text-[10px] font-bold text-blue-700"
                  style={{ includeFontPadding: false }}
                >
                  {ticket.type}
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-xs text-slate-500 mt-0.5 font-medium"
            numberOfLines={1}
            style={{ includeFontPadding: false }}
          >
            {role === 'SALES_MANAGER'
              ? `Requested by ${ticket.salesExec?.name || 'Executive'}`
              : `Sent to ${ticket.manager?.name || 'Manager'}`}
          </Text>
        </View>
      </View>

      <View className="items-end ml-2">
        <View className={`px-2.5 py-1 rounded-full border ${statusBadge.bg}`}>
          <Text
            className={`text-[11px] font-extrabold ${statusBadge.text}`}
            style={{ includeFontPadding: false }}
          >
            {ticket.status}
          </Text>
        </View>

        {role === 'SALES_MANAGER' && ticket.status !== 'CLOSED' && (
          <Pressable
            onPress={handleClose}
            disabled={loading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="mt-2 flex-row items-center gap-1 active:opacity-60"
          >
            <XCircle size={13} color="#64748b" />
            <Text
              className="text-xs text-slate-500 font-semibold"
              style={{ includeFontPadding: false }}
            >
              Close Ticket
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
