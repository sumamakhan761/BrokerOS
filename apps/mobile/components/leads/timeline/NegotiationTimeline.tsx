import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

interface NegotiationTimelineProps {
  negotiationNotes: any[];
}

export default function NegotiationTimeline({ negotiationNotes }: NegotiationTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const parseNegotiationContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch (e) {
      return { raw: content };
    }
  };

  if (!negotiationNotes || negotiationNotes.length === 0) {
    return (
      <View className="items-center py-6 border border-gray-100 rounded-2xl bg-gray-50/50">
        <Feather name="trending-up" size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
        <Text className="text-sm font-bold text-gray-600">No negotiation rounds yet</Text>
        <Text className="text-xs text-gray-400 mt-1">Click "Add Round" to log the first negotiation</Text>
      </View>
    );
  }

  return (
    <View className="space-y-3">
      {negotiationNotes.map((note) => {
        const data = {
          askingPrice: note.askingPrice,
          offeredPrice: note.offeredPrice,
          objections: note.customerObjections,
          strategy: note.managerSuggestion,
          title: note.negotiationNotes,
          nextStep: note.nextActionPlan,
        };
        const isExpanded = expandedId === note.id;
        const gap = data.askingPrice && data.offeredPrice
          ? Number(data.askingPrice) - Number(data.offeredPrice)
          : null;

        return (
          <View key={note.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white mb-3">
            <TouchableOpacity
              onPress={() => toggleExpand(note.id)}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center border border-indigo-100">
                  <FontAwesome5 name="handshake" size={16} color="#4f46e5" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900 text-sm">{data.title || 'Round'}</Text>
                  <Text className="text-xs font-medium text-gray-500 mt-0.5">
                    {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>
              <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-50">
                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#64748b" />
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                {(data.askingPrice || data.offeredPrice) && (
                  <View className="flex-row gap-3 mb-3">
                    {data.askingPrice && (
                      <View className="bg-blue-50 rounded-xl p-3 flex-1 items-center border border-blue-100">
                        <Text className="text-[10px] uppercase text-blue-700 font-bold mb-1">Our Price</Text>
                        <Text className="text-sm font-bold text-blue-900" numberOfLines={1} adjustsFontSizeToFit>₹{Number(data.askingPrice).toLocaleString('en-IN')}</Text>
                      </View>
                    )}
                    {data.offeredPrice && (
                      <View className="bg-orange-50 rounded-xl p-3 flex-1 items-center border border-orange-100">
                        <Text className="text-[10px] uppercase text-orange-700 font-bold mb-1">Cust. Offered</Text>
                        <Text className="text-sm font-bold text-orange-900" numberOfLines={1} adjustsFontSizeToFit>₹{Number(data.offeredPrice).toLocaleString('en-IN')}</Text>
                      </View>
                    )}
                    {gap !== null && gap > 0 && (
                      <View className="bg-red-50 rounded-xl p-3 flex-1 items-center border border-red-100">
                        <Text className="text-[10px] uppercase text-red-700 font-bold mb-1">Gap</Text>
                        <Text className="text-sm font-bold text-red-900" numberOfLines={1} adjustsFontSizeToFit>₹{gap.toLocaleString('en-IN')}</Text>
                      </View>
                    )}
                  </View>
                )}

                <View className="space-y-3">
                  {data.objections && (
                    <View className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm mb-3">
                      <View className="flex-row items-center gap-2 mb-1.5">
                        <View className="w-1.5 h-1.5 rounded-full bg-red-500"></View>
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer Objections</Text>
                      </View>
                      <Text className="text-sm text-gray-700 leading-tight">{data.objections}</Text>
                    </View>
                  )}
                  
                  {data.strategy && (
                    <View className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm mb-3">
                      <View className="flex-row items-center gap-2 mb-1.5">
                        <View className="w-1.5 h-1.5 rounded-full bg-indigo-500"></View>
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Our Strategy</Text>
                      </View>
                      <Text className="text-sm text-gray-700 leading-tight">{data.strategy}</Text>
                    </View>
                  )}
                  
                  {data.nextStep && (
                    <View className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                      <View className="flex-row items-center gap-2 mb-1.5">
                        <View className="w-1.5 h-1.5 rounded-full bg-green-500"></View>
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Next Step</Text>
                      </View>
                      <Text className="text-sm text-gray-700 leading-tight">{data.nextStep}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
