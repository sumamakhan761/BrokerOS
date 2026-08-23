import React from 'react';
import { View, Text } from 'react-native';

export interface WidgetItem {
  label: string;
  value: string | number;
  icon: any; 
  accent: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky' | 'purple' | 'orange' | 'blue' | 'teal';
}

interface SharedWidgetsGridProps {
  widgets: WidgetItem[];
  title?: string;
}

export function SharedWidgetsGrid({ widgets, title }: SharedWidgetsGridProps) {
  if (!widgets || widgets.length === 0) return null;

  const colors: Record<string, { bg: string, text: string }> = {
    slate: { bg: 'bg-slate-50', text: 'text-slate-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
  };

  const getHexColor = (accent: string) => {
    switch (accent) {
      case 'slate': return '#475569';
      case 'indigo': return '#4f46e5';
      case 'emerald': return '#059669';
      case 'amber': return '#d97706';
      case 'rose': return '#e11d48';
      case 'violet': return '#7c3aed';
      case 'sky': return '#0284c7';
      case 'purple': return '#9333ea';
      case 'orange': return '#ea580c';
      case 'blue': return '#2563eb';
      case 'teal': return '#0d9488';
      default: return '#475569';
    }
  }

  return (
    <View className="mb-6">
      {title && <Text className="text-xl font-bold text-slate-900 mb-4 px-1">{title}</Text>}
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {widgets.map((w, i) => {
          const Icon = w.icon;
          const color = colors[w.accent] || colors.slate;
          return (
            <View key={i} className="w-[48%] bg-white border border-slate-100 shadow-sm rounded-2xl p-4">
              <View className={`w-8 h-8 rounded-full items-center justify-center mb-3 ${color.bg}`}>
                {React.isValidElement(Icon) ? (
                  Icon
                ) : (
                  <Icon size={16} color={getHexColor(w.accent)} strokeWidth={2.5} className={color.text} />
                )}
              </View>
              <Text className="text-2xl font-extrabold text-slate-900">{w.value}</Text>
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{w.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
