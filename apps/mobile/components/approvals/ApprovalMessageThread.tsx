import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ApprovalMessageThreadProps {
  messages: any[];
  role: 'SALES_EXECUTIVE' | 'SALES_MANAGER';
}

export function ApprovalMessageThread({ messages, role }: ApprovalMessageThreadProps) {
  const handleOpenDoc = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  return (
    <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      {messages.map((msg: any) => {
        const isManager = msg.sender?.role?.code === 'SALES_MANAGER';
        const alignRight = (role === 'SALES_MANAGER' && isManager) || (role === 'SALES_EXECUTIVE' && !isManager);

        return (
          <View key={msg.id} className={`mb-4 w-full flex ${alignRight ? 'items-end' : 'items-start'}`}>
            <View className="flex-row items-center mb-1 px-1 gap-2">
              <Text
                className="text-xs font-bold text-slate-800"
                style={{ includeFontPadding: false }}
              >
                {msg.sender?.name || 'User'}
              </Text>
              <Text
                className="text-[10px] text-slate-400 font-medium"
                style={{ fontVariant: ['tabular-nums'], includeFontPadding: false }}
              >
                {new Date(msg.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View
              className={`max-w-[85%] rounded-3xl p-4 shadow-xs ${alignRight
                ? 'bg-blue-600 rounded-tr-sm'
                : 'bg-white border border-slate-200/80 rounded-tl-sm'
                }`}
            >
              <Text
                className={`text-sm leading-relaxed ${alignRight ? 'text-white font-medium' : 'text-slate-800'
                  }`}
                style={{ includeFontPadding: false }}
              >
                {msg.description}
              </Text>

              {msg.metadata?.documents && msg.metadata.documents.length > 0 ? (
                <View className={`mt-3 pt-2.5 border-t ${alignRight ? 'border-blue-500/80' : 'border-slate-100 mr-2'}`}>
                  {msg.metadata.documents.map((doc: any, i: number) => (
                    <Pressable
                      key={i}
                      onPress={() => handleOpenDoc(doc.url)}
                      accessibilityRole="link"
                      className="flex-row items-center mb-2 active:opacity-75"
                    >
                      <FileText size={14} color={alignRight ? '#dbeafe' : '#2563eb'} />
                      <Text
                        className={`text-xs font-bold ml-2 ${alignRight ? 'text-blue-100' : 'text-blue-600'
                          }`}
                        style={{ includeFontPadding: false }}
                      >
                        View {doc.name || 'Attachment'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : msg.fileUrl ? (
                <Pressable
                  onPress={() => handleOpenDoc(msg.fileUrl)}
                  accessibilityRole="link"
                  className={`mt-3 pt-2.5 border-t flex-row items-center active:opacity-75 ${alignRight ? 'border-blue-500/80' : 'border-slate-100'
                    }`}
                >
                  <FileText size={14} color={alignRight ? '#dbeafe' : '#2563eb'} />
                  <Text
                    className={`text-xs font-bold ml-2 ${alignRight ? 'text-blue-100' : 'text-blue-600'
                      }`}
                    style={{ includeFontPadding: false }}
                  >
                    View Attachment
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
