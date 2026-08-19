import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ApprovalMessageThreadProps {
  messages: any[];
  role: 'SALES_EXECUTIVE' | 'SALES_MANAGER';
}

export function ApprovalMessageThread({ messages, role }: ApprovalMessageThreadProps) {
  return (
    <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 24 }}>
      {messages.map((msg: any) => {
        const isManager = msg.sender.role.code === 'SALES_MANAGER';
        const alignRight = (role === 'SALES_MANAGER' && isManager) || (role === 'SALES_EXECUTIVE' && !isManager);

        return (
          <View key={msg.id} className={`mb-4 w-full flex ${alignRight ? 'items-end' : 'items-start'}`}>
            <View className="flex-row items-center mb-1 px-1">
              <Text className="text-xs font-semibold text-slate-700 mr-2">{msg.sender.name}</Text>
              <Text className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString()}</Text>
            </View>
            <View
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${alignRight
                ? 'bg-[#2563eb] rounded-tr-sm'
                : 'bg-white border border-slate-200 rounded-tl-sm'
                }`}
            >
              <Text className={`text-sm ${alignRight ? 'text-blue-50' : 'text-slate-600'}`}>
                {msg.description}
              </Text>
              {msg.metadata?.documents && msg.metadata.documents.length > 0 ? (
                <View className={`mt-3 pt-3 border-t ${alignRight ? 'border-blue-500' : 'border-slate-100'}`}>
                  {msg.metadata.documents.map((doc: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => Linking.openURL(doc.url)}
                      className="flex-row items-center mb-2"
                    >
                      <Feather name="file-text" size={14} color={alignRight ? '#dbeafe' : '#2563eb'} />
                      <Text className={`text-xs font-medium ml-2 ${alignRight ? 'text-blue-100' : 'text-blue-600'}`}>
                        View {doc.name || 'Attachment'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : msg.fileUrl ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(msg.fileUrl)}
                  className={`mt-3 pt-3 border-t flex-row items-center ${alignRight ? 'border-blue-500' : 'border-slate-100'}`}
                >
                  <Feather name="file-text" size={14} color={alignRight ? '#dbeafe' : '#2563eb'} />
                  <Text className={`text-xs font-medium ml-2 ${alignRight ? 'text-blue-100' : 'text-blue-600'}`}>
                    View Attachment
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
