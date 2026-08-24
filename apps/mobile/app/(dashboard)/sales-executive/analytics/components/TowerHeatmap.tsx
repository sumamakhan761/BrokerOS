import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export function TowerHeatmap({ inventoryData }: { inventoryData: any }) {
  if (!inventoryData || !inventoryData.projects || inventoryData.projects.length === 0) return null;

  const [selectedProjectId, setSelectedProjectId] = useState(inventoryData.projects[0].id);
  const selectedProject = inventoryData.projects.find((p: any) => p.id === selectedProjectId) || inventoryData.projects[0];
  const [selectedTowerId, setSelectedTowerId] = useState(selectedProject?.towers?.[0]?.id);
  const selectedTower = selectedProject?.towers?.find((t: any) => t.id === selectedTowerId) || selectedProject?.towers?.[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-100 border-emerald-200';
      case 'RESERVED': return 'bg-amber-100 border-amber-200';
      case 'SOLD': return 'bg-indigo-600 border-indigo-700';
      case 'BLOCKED': return 'bg-slate-200 border-slate-300';
      default: return 'bg-slate-100 border-slate-200';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'SOLD': return 'text-white';
      case 'AVAILABLE': return 'text-emerald-800';
      case 'RESERVED': return 'text-amber-800';
      case 'BLOCKED': return 'text-slate-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <View className="px-6 mb-8">
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <Text className="text-lg font-bold text-slate-800 mb-4">Inventory Heatmap</Text>
        
        <View className="bg-slate-50 rounded-lg border border-slate-200 mb-2 overflow-hidden h-12 justify-center">
          <Picker
            selectedValue={selectedProjectId}
            onValueChange={(val) => {
              setSelectedProjectId(val);
              const proj = inventoryData.projects.find((p: any) => p.id === val);
              if (proj?.towers?.length > 0) setSelectedTowerId(proj.towers[0].id);
            }}
            style={{ height: 50, width: '100%', fontSize: 14, color: '#0f172a' }}
            dropdownIconColor="#0f172a"
          >
            {inventoryData.projects.map((p: any) => (
              <Picker.Item key={p.id} label={p.name} value={p.id} color="#0f172a" />
            ))}
          </Picker>
        </View>

        {selectedProject?.towers?.length > 0 && (
          <View className="bg-slate-50 rounded-lg border border-slate-200 mb-6 overflow-hidden h-12 justify-center">
            <Picker
              selectedValue={selectedTowerId}
              onValueChange={(val) => setSelectedTowerId(val)}
              style={{ height: 50, width: '100%', fontSize: 14, color: '#0f172a' }}
              dropdownIconColor="#0f172a"
            >
              {selectedProject.towers.map((t: any) => (
                <Picker.Item key={t.id} label={t.name} value={t.id} color="#0f172a" />
              ))}
            </Picker>
          </View>
        )}

        {selectedTower ? (
          <ScrollView className="max-h-80" nestedScrollEnabled>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="gap-2 pb-4 pr-4">
                {selectedTower.floors?.sort((a: any, b: any) => b.floorNumber - a.floorNumber).map((floor: any) => (
                  <View key={floor.id} className="flex-row items-center gap-4">
                    <View className="w-12 items-end">
                      <Text className="text-[10px] font-bold text-slate-400">Flr {floor.floorNumber}</Text>
                    </View>
                    <View className="flex-row gap-2">
                      {floor.units?.sort((a: any, b: any) => a.unitNumber.localeCompare(b.unitNumber)).map((unit: any) => (
                        <TouchableOpacity
                          key={unit.id}
                          className={`w-12 h-10 rounded border items-center justify-center ${getStatusColor(unit.status)}`}
                        >
                          <Text className={`text-[10px] font-bold ${getTextColor(unit.status)}`}>
                            {unit.unitNumber.slice(-3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
        ) : (
          <View className="h-32 items-center justify-center">
            <Text className="text-sm font-medium text-slate-400">No towers found.</Text>
          </View>
        )}
      </View>
      {/* Sales by Unit Type & Facing */}
      {(inventoryData.salesByType?.length > 0 || inventoryData.salesByFacing?.length > 0) && (
        <View className="mt-6 gap-6">
          {inventoryData.salesByType?.length > 0 && (
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Text className="text-sm font-bold text-slate-800 mb-4">My Sales by Unit Type</Text>
              <View className="gap-3">
                {inventoryData.salesByType.map((entry: any, index: number) => {
                  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-purple-500'];
                  const color = colors[index % colors.length];
                  const total = inventoryData.salesByType.reduce((sum: number, item: any) => sum + item.value, 0) || 1;
                  const percentage = Math.round((entry.value / total) * 100);
                  return (
                    <View key={entry.name} className="gap-1.5">
                      <View className="flex-row justify-between items-center text-xs">
                        <Text className="font-medium text-slate-600">{entry.name}</Text>
                        <Text className="font-bold text-slate-800">{entry.value} ({percentage}%)</Text>
                      </View>
                      <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <View className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {inventoryData.salesByFacing?.length > 0 && (
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Text className="text-sm font-bold text-slate-800 mb-4">My Sales by Facing</Text>
              <View className="gap-3">
                {inventoryData.salesByFacing.map((entry: any, index: number) => {
                  const colors = ['bg-amber-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-emerald-500'];
                  const color = colors[index % colors.length];
                  const total = inventoryData.salesByFacing.reduce((sum: number, item: any) => sum + item.value, 0) || 1;
                  const percentage = Math.round((entry.value / total) * 100);
                  return (
                    <View key={entry.name} className="gap-1.5">
                      <View className="flex-row justify-between items-center text-xs">
                        <Text className="font-medium text-slate-600">{entry.name}</Text>
                        <Text className="font-bold text-slate-800">{entry.value} ({percentage}%)</Text>
                      </View>
                      <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <View className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
