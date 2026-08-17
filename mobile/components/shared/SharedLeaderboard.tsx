import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';

export interface LeaderboardColumn<T> {
  key: string;
  label: string;
  width?: string;         // e.g. "w-12" (tailwind class for width)
  flex?: number;          // e.g. 1
  align?: 'left' | 'center' | 'right'; // controls text alignment
  isBold?: boolean;
  isPrimary?: boolean;    // typically for the score column (extra bold/dark)
  render?: (item: T) => React.ReactNode;
}

export interface SharedLeaderboardProps<T> {
  title: string;
  icon?: React.ReactNode; 
  data: T[];
  columns: LeaderboardColumn<T>[];
  currentUserId?: string;
  idKey?: keyof T;
  nameKey?: keyof T;
  emptyMessage?: string;
}

export function SharedLeaderboard<T>({
  title,
  icon,
  data,
  columns,
  currentUserId,
  idKey = 'userId' as keyof T,
  nameKey = 'name' as keyof T,
  emptyMessage = 'No data available yet.',
}: SharedLeaderboardProps<T>) {
  return (
    <View className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 mb-6">
      <View className="flex-row items-center gap-2 mb-4">
        {icon && (
          <View className="bg-amber-50 p-2 rounded-lg">
            {icon}
          </View>
        )}
        <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</Text>
      </View>

      {/* Header Row */}
      <View className="flex-row pb-2.5 border-b border-slate-100 px-2">
        <Text className="w-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Rank</Text>
        <Text className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Name</Text>
        {columns.map((col, idx) => (
          <Text
            key={`header-${idx}`}
            className={`${col.width ? col.width : ''} ${col.flex ? `flex-${col.flex}` : ''} text-[10px] font-bold text-slate-400 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
          >
            {col.label}
          </Text>
        ))}
      </View>

      {/* List */}
      {(!data || data.length === 0) ? (
        <View className="py-6 items-center">
          <Text className="text-slate-400 font-medium text-sm">{emptyMessage}</Text>
        </View>
      ) : (
        <View className="gap-2 mt-2">
          {data.map((item: any, index: number) => {
            const rank = item.rank || (index + 1);
            const isMe = currentUserId && item[idKey] === currentUserId;
            
            let emoji = `${rank}`;
            if (rank === 1) emoji = '🥇';
            else if (rank === 2) emoji = '🥈';
            else if (rank === 3) emoji = '🥉';

            let bgClass = 'bg-white hover:bg-slate-50/50';
            if (isMe) bgClass = 'bg-blue-50/60 border border-blue-100'; // special highlight for "Me"
            else if (rank === 1) bgClass = 'bg-amber-50/60';
            else if (rank === 2) bgClass = 'bg-slate-50/60';
            else if (rank === 3) bgClass = 'bg-orange-50/40';

            const name = item[nameKey] || '—';

            return (
              <View key={item[idKey] || `row-${index}`} className={`flex-row items-center py-2 px-2 rounded-xl ${bgClass}`}>
                <Text className="w-8 text-sm font-bold text-slate-700 text-center">{emoji}</Text>
                
                <View className="flex-1 flex-row items-center gap-2 pr-2 ml-1">
                  <Avatar name={name} size={24} />
                  <Text className={`text-xs font-semibold ${isMe ? 'text-blue-700' : 'text-slate-900'}`} numberOfLines={1}>
                    {name}{isMe ? ' (You)' : ''}
                  </Text>
                </View>

                {columns.map((col, idx) => {
                  let textClass = 'text-[11px] font-semibold text-slate-500';
                  if (col.isBold || col.isPrimary) textClass = 'text-[11px] font-extrabold text-slate-900';
                  if (isMe && col.isPrimary) textClass = 'text-[11px] font-extrabold text-blue-800';

                  const alignment = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                  return (
                    <Text
                      key={`col-${idx}`}
                      className={`${col.width ? col.width : ''} ${col.flex ? `flex-${col.flex}` : ''} ${textClass} ${alignment}`}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </Text>
                  );
                })}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
