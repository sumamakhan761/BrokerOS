import React from 'react';
import { View, Text } from 'react-native';
import { Announcement } from '../misc/types';

interface AnnouncementsListProps {
  announcements: Announcement[];
}

export default function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <View className="mb-2">
      {announcements.map((ann) => (
        <View key={ann.id} className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-2xl p-4 flex-row items-start mb-3 shadow-sm shadow-amber-900/5">
          <Text className="text-xl mr-3 mt-0.5">📢</Text>
          <View className="flex-1">
            <Text className="font-bold text-sm text-amber-900 mb-1 tracking-tight">
              {ann.title}
            </Text>
            <Text className="text-sm text-amber-700 leading-5">
              {ann.description}
            </Text>
          </View>
          <Text className="text-xs font-medium text-amber-600 ml-2 mt-1">
            {new Date(ann.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </Text>
        </View>
      ))}
    </View>
  );
}
