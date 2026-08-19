import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ApprovalTicketHeaderProps {
  ticket: any;
  role: 'SALES_EXECUTIVE' | 'SALES_MANAGER';
  onBack: () => void;
  loading: boolean;
  onCloseTicket: () => void;
}

export function ApprovalTicketHeader({ ticket, role, onBack, loading, onCloseTicket }: ApprovalTicketHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className="p-4 border-b border-gray-200 bg-white flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <TouchableOpacity onPress={onBack} className="mr-3 p-2 bg-gray-50 rounded-full">
          <Feather name="arrow-left" size={20} color="#334155" />
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-bold text-lg text-slate-800 mr-2">
              Ticket #{ticket.id.slice(0, 8).toUpperCase()}
            </Text>
            {ticket.type === 'BOOKING' && (
              <View className="bg-indigo-100 px-2 py-0.5 rounded">
                <Text className="text-[10px] font-bold text-indigo-700">{ticket.type}</Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-slate-500 mt-0.5">
            {role === 'SALES_MANAGER' ? `Requested by ${ticket.salesExec?.name}` : `Sent to ${ticket.manager?.name}`}
          </Text>
        </View>
      </View>

      <View className="items-end ml-2">
        <View className={`px-2 py-1 rounded-full ${getStatusColor(ticket.status).split(' ')[0]}`}>
          <Text className={`text-xs font-bold ${getStatusColor(ticket.status).split(' ')[1]}`}>
            {ticket.status}
          </Text>
        </View>
        {role === 'SALES_MANAGER' && ticket.status !== 'CLOSED' && (
          <TouchableOpacity onPress={onCloseTicket} disabled={loading} className="mt-2 flex-row items-center">
            <Feather name="x-circle" size={12} color="#64748b" />
            <Text className="text-xs text-slate-500 ml-1">Close</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
