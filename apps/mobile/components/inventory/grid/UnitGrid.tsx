import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Unit {
  id?: string;
  unitNumber: string;
  type: string;
  status: string;
  basePrice?: number;
  carpetArea?: number;
  facing?: string;
  [key: string]: any;
}

interface Floor {
  id?: string;
  floorNumber: number;
  name: string;
  units: Unit[];
}

interface Tower {
  id?: string;
  name: string;
  floors: Floor[];
}

interface UnitGridProps {
  tower: Tower;
  onUnitClick?: (unit: Unit, floor: Floor) => void;
  isInteractive?: boolean;
}

const getUnitColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE': return 'bg-emerald-100 border-emerald-300';
    case 'RESERVED': return 'bg-amber-100 border-amber-300';
    case 'SOLD': return 'bg-rose-100 border-rose-300';
    case 'BLOCKED': return 'bg-slate-200 border-slate-300';
    default: return 'bg-gray-100 border-gray-200';
  }
};

const getUnitTextColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE': return 'text-emerald-800';
    case 'RESERVED': return 'text-amber-800';
    case 'SOLD': return 'text-rose-800';
    case 'BLOCKED': return 'text-slate-800';
    default: return 'text-gray-800';
  }
};

const getUnitIcon = (type: string, status: string) => {
  const color = getUnitTextColor(status);
  if (type === 'SHOP' || type === 'OFFICE') return <Feather name="shopping-bag" size={16} className={`${color} opacity-70`} />;
  if (type === 'STUDIO') return <Feather name="box" size={16} className={`${color} opacity-70`} />;
  return <Feather name="key" size={16} className={`${color} opacity-70`} />;
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE': return <Feather name="check-circle" size={12} className="text-emerald-600 absolute top-2 right-2" />;
    case 'RESERVED': return <View className="w-2 h-2 rounded-full bg-amber-500 absolute top-2.5 right-2.5" />;
    case 'SOLD': return <Feather name="lock" size={12} className="text-rose-600 absolute top-2 right-2" />;
    default: return null;
  }
};

export function UnitGrid({ tower, onUnitClick, isInteractive = true }: UnitGridProps) {
  const sortedFloors = [...tower.floors].sort((a, b) => b.floorNumber - a.floorNumber);

  const handlePress = (unit: Unit, floor: Floor) => {
    if (isInteractive && onUnitClick) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUnitClick(unit, floor);
    }
  };

  return (
    <View className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
        <ScrollView showsVerticalScrollIndicator={true} bounces={false}>
          <View className="p-4 gap-4">
            {sortedFloors.map((floor) => (
              <View key={floor.id || floor.floorNumber} className="flex-row items-center">
                {/* Floor Label */}
                <View className="w-20 pr-4 mr-4 border-r border-slate-100 justify-center">
                  <Text className="text-sm font-bold text-slate-700 text-right">{floor.name}</Text>
                  <Text className="text-[10px] text-slate-400 text-right font-medium">Floor {floor.floorNumber}</Text>
                </View>
                
                {/* Units */}
                <View className="flex-row gap-3">
                  {floor.units.map((unit, idx) => {
                    const isCommercial = unit.type === 'SHOP' || unit.type === 'OFFICE';
                    return (
                      <TouchableOpacity
                        key={unit.id || unit.unitNumber || idx}
                        activeOpacity={isInteractive ? 0.7 : 1}
                        onPress={() => handlePress(unit, floor)}
                        className={`
                          w-20 h-20 border-2 items-center justify-center relative
                          ${isCommercial ? 'rounded-md border-[3px]' : 'rounded-xl'}
                          ${getUnitColor(unit.status)}
                        `}
                      >
                        {getStatusIcon(unit.status)}
                        {getUnitIcon(unit.type, unit.status)}
                        <Text className={`mt-1.5 font-bold text-sm ${getUnitTextColor(unit.status)}`}>
                          {unit.unitNumber}
                        </Text>
                        <Text className={`text-[9px] font-semibold opacity-70 ${getUnitTextColor(unit.status)}`}>
                          {unit.type.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}
