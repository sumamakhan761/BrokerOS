import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { UnitGrid } from '../../../../components/inventory/grid/UnitGrid';
import { BookingModal } from '../../../../components/inventory/modals/BookingModal';
import { UnitInfoModal } from '../../../../components/inventory/modals/UnitInfoModal';
import { ProjectDocuments } from '../../../../components/inventory/misc/ProjectDocuments';
import { authClient } from '../../../../lib/auth-client';

export default function SalesExecutiveProjectInventory() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  
  const [towers, setTowers] = useState<any[]>([]);
  const [activeTower, setActiveTower] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedAvailableUnit, setSelectedAvailableUnit] = useState<any>(null);
  const [selectedReservedUnit, setSelectedReservedUnit] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'GRID' | 'DOCUMENTS'>('GRID');

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const loadTowers = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch(`/api/inventory/projects/${projectId}/towers`, { baseURL: baseUrl });
      if (res.error) throw new Error(res.error.message || "Failed to fetch towers");
      const data = res.data as any;
      setTowers(data);
      if (data.length > 0 && !activeTower) {
        setActiveTower(data[0]);
      } else if (data.length > 0 && activeTower) {
        const updated = data.find((t: any) => t.id === activeTower.id);
        setActiveTower(updated || data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadTowers();
  }, [projectId]);

  const handleUnitClick = (unit: any, floor: any) => {
    const fullUnit = { ...unit, floor };
    if (unit.status === 'AVAILABLE') {
      setSelectedAvailableUnit(fullUnit);
    } else {
      setSelectedReservedUnit(fullUnit);
    }
  };

  const filteredTower = useMemo(() => {
    if (!activeTower) return null;
    const clonedTower = JSON.parse(JSON.stringify(activeTower));
    
    clonedTower.floors = clonedTower.floors.map((floor: any) => {
      floor.units = floor.units.filter((unit: any) => {
        const matchSearch = unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === "ALL" || unit.status === filterStatus;
        const matchType = filterType === "ALL" || unit.type === filterType;
        return matchSearch && matchStatus && matchType;
      });
      return floor;
    });
    
    clonedTower.floors = clonedTower.floors.filter((floor: any) => floor.units.length > 0);
    
    return clonedTower;
  }, [activeTower, searchQuery, filterStatus, filterType]);

  if (loading && towers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="p-4 pt-12 bg-white border-b border-slate-200">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Feather name="arrow-left" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">Live Inventory</Text>
          <TouchableOpacity onPress={loadTowers} className="p-2">
            <Feather name="refresh-cw" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View className="flex-row items-center justify-around mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-emerald-500" />
            <Text className="text-xs font-bold text-slate-700">Available</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-amber-500" />
            <Text className="text-xs font-bold text-slate-700">Reserved</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-rose-500" />
            <Text className="text-xs font-bold text-slate-700">Sold</Text>
          </View>
        </View>

        {/* Main Navigation Tabs */}
        <View className="flex-row mt-4 px-2">
          <TouchableOpacity 
            onPress={() => setActiveTab('GRID')}
            className={`flex-1 py-3 border-b-2 items-center ${activeTab === 'GRID' ? 'border-indigo-600' : 'border-transparent'}`}
          >
            <Text className={`font-bold ${activeTab === 'GRID' ? 'text-indigo-600' : 'text-slate-500'}`}>Unit Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('DOCUMENTS')}
            className={`flex-1 py-3 border-b-2 items-center ${activeTab === 'DOCUMENTS' ? 'border-indigo-600' : 'border-transparent'}`}
          >
            <Text className={`font-bold ${activeTab === 'DOCUMENTS' ? 'text-indigo-600' : 'text-slate-500'}`}>Documents</Text>
          </TouchableOpacity>
        </View>

        {/* Tower Tabs (Only for Grid) */}
        {activeTab === 'GRID' && towers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row gap-2 px-2 pb-2">
              {towers.map(tower => (
                <TouchableOpacity
                  key={tower.id}
                  onPress={() => setActiveTower(tower)}
                  className={`px-5 py-2.5 rounded-full ${
                    activeTower?.id === tower.id ? 'bg-slate-900' : 'bg-slate-100'
                  }`}
                >
                  <Text className={`font-bold ${
                    activeTower?.id === tower.id ? 'text-white' : 'text-slate-600'
                  }`}>
                    {tower.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Main Content Area */}
      <View className="flex-1">
        {activeTab === 'DOCUMENTS' ? (
          <ProjectDocuments projectId={projectId as string} towers={towers} />
        ) : (
          <View className="flex-1 p-4">
            {towers.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Feather name="box" size={48} color="#cbd5e1" />
                <Text className="text-lg font-bold text-slate-900 mt-4">No Towers Available</Text>
                <Text className="text-slate-500 text-center mt-2 px-8 mb-6">There are no units available to book in this project yet.</Text>
              </View>
            ) : activeTower ? (
          <>
            <View className="mb-4 space-y-2">
              <TextInput 
                placeholder="Search Unit # (e.g. 101)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-white border border-slate-300 rounded-xl p-3"
              />
              <View className="flex-row gap-2 mt-2">
                <View className="flex-1 bg-white border border-slate-300 rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={filterStatus}
                    onValueChange={setFilterStatus}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="All Status" value="ALL" />
                    <Picker.Item label="Available" value="AVAILABLE" />
                    <Picker.Item label="Reserved" value="RESERVED" />
                    <Picker.Item label="Sold" value="SOLD" />
                    <Picker.Item label="Blocked" value="BLOCKED" />
                  </Picker>
                </View>
                <View className="flex-1 bg-white border border-slate-300 rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={filterType}
                    onValueChange={setFilterType}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="All Types" value="ALL" />
                    <Picker.Item label="Shop" value="SHOP" />
                    <Picker.Item label="Office" value="OFFICE" />
                    <Picker.Item label="Studio" value="STUDIO" />
                    <Picker.Item label="1 BHK" value="ONE_BHK" />
                    <Picker.Item label="2 BHK" value="TWO_BHK" />
                    <Picker.Item label="3 BHK" value="THREE_BHK" />
                  </Picker>
                </View>
              </View>
            </View>

            {filteredTower && filteredTower.floors.length > 0 ? (
              <UnitGrid 
                tower={filteredTower}
                onUnitClick={handleUnitClick}
              />
            ) : (
              <View className="flex-1 items-center justify-center mt-10">
                <Text className="text-slate-500 font-bold">No units match your filters.</Text>
              </View>
              )}
            </>
          ) : null}
          </View>
        )}
      </View>

      <BookingModal 
        unit={selectedAvailableUnit}
        visible={!!selectedAvailableUnit}
        onClose={() => setSelectedAvailableUnit(null)}
        onSuccess={() => {
          setSelectedAvailableUnit(null);
          loadTowers();
        }}
      />

      <UnitInfoModal 
        unit={selectedReservedUnit}
        visible={!!selectedReservedUnit}
        onClose={() => setSelectedReservedUnit(null)}
      />
    </View>
  );
}
