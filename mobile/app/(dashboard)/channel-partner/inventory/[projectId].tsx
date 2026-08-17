import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { UnitGrid } from '../../../../components/inventory/grid/UnitGrid';
import { UnitDetailsModal } from '../../../../components/inventory/modals/UnitDetailsModal';
import PossessionModal from '../../../../components/inventory/modals/PossessionModal';
import AssignmentModal from '../../../../components/inventory/modals/AssignmentModal';
import InventoryFilters from '../../../../components/shared/InventoryFilters';
import { authClient } from '../../../../lib/auth-client';
// import { AiTowerGenerator } from '../../../../components/inventory/modals/AiTowerGenerator';
// import { ManualTowerWizard } from '../../../../components/inventory/modals/ManualTowerWizard';

export default function ChannelPartnerProjectInventory() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();

  const [towers, setTowers] = useState<any[]>([]);
  const [activeTower, setActiveTower] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isPossessionModalOpen, setIsPossessionModalOpen] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, towerId: '', towerName: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const filteredTower = useMemo(() => {
    if (!activeTower) return null;
    const cloned = JSON.parse(JSON.stringify(activeTower));
    cloned.floors = cloned.floors.map((floor: any) => {
      floor.units = floor.units.filter((unit: any) => {
        const matchesSearch = searchQuery === '' || unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || unit.status === filterStatus;
        const matchesType = filterType === 'ALL' || unit.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
      });
      return floor;
    }).filter((floor: any) => floor.units.length > 0);
    return cloned;
  }, [activeTower, searchQuery, filterStatus, filterType]);

  // const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  // const [isManualWizardOpen, setIsManualWizardOpen] = useState(false);

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

  const handleUnitUpdate = async (unitId: string, updates: any) => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
    const res = await authClient.$fetch(`/api/inventory/units/${unitId}/status`, {
      baseURL: baseUrl,
      method: 'PATCH',
      body: {
        status: updates.status,
        clearBooking: updates.status === 'AVAILABLE',
        ...updates
      }
    });
    if (res.error) throw new Error(res.error.message || "Failed to update unit");
    await loadTowers();
    setSelectedUnit(null);
  };

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
          <TouchableOpacity onPress={() => router.push('/channel-partner/inventory')} className="p-2">
            <Feather name="arrow-left" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 flex-1 ml-2">Project Towers</Text>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => setIsPossessionModalOpen(true)} className="bg-amber-100 rounded-full px-3 py-2 flex-row items-center gap-1 border border-amber-200">
              <Feather name="clock" size={14} color="#b45309" />
              <Text className="text-amber-700 font-bold text-xs">Set Possession</Text>
            </TouchableOpacity>

            {activeTower && (
              <TouchableOpacity 
                onPress={() => setAssignmentModal({
                  isOpen: true,
                  towerId: activeTower.id,
                  towerName: activeTower.name
                })} 
                className="bg-emerald-100 rounded-full px-3 py-2 flex-row items-center gap-1 border border-emerald-200"
              >
                <Feather name="users" size={14} color="#059669" />
                <Text className="text-emerald-700 font-bold text-xs">Assign Tower</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tower Tabs */}
        {towers.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row gap-2 px-2 pb-2">
              {towers.map(tower => (
                <TouchableOpacity
                  key={tower.id}
                  onPress={() => setActiveTower(tower)}
                  className={`px-5 py-2.5 rounded-full ${activeTower?.id === tower.id ? 'bg-slate-900' : 'bg-slate-100'}`}
                >
                  <Text className={`font-bold ${activeTower?.id === tower.id ? 'text-white' : 'text-slate-600'}`}>
                    {tower.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Grid Area */}
      <View className="flex-1 p-4">
        {towers.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Feather name="layers" size={48} color="#cbd5e1" />
            <Text className="text-lg font-bold text-slate-900 mt-4">No Towers Found</Text>
            <Text className="text-slate-500 text-center mt-2 px-8 mb-6">Start by generating a tower.</Text>
            {/* 
            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity onPress={() => setIsManualWizardOpen(true)} className="px-4 py-2 border border-slate-300 rounded-xl">
                <Text className="font-bold text-slate-700">Manual</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAiGeneratorOpen(true)} className="px-4 py-2 bg-indigo-600 rounded-xl flex-row items-center gap-2">
                <Feather name="zap" size={16} color="white" />
                <Text className="font-bold text-white">AI Generate</Text>
              </TouchableOpacity>
            </View>
            */}
          </View>
        ) : activeTower ? (
          <>
            <InventoryFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterType={filterType}
              setFilterType={setFilterType}
            />

            {filteredTower && filteredTower.floors.length > 0 ? (
              <UnitGrid 
                tower={filteredTower}
                onUnitClick={(unit) => setSelectedUnit({ ...unit, floor: activeTower.floors.find((f: any) => f.id === unit.floorId) })}
              />
            ) : (
              <View className="flex-1 items-center justify-center mt-10">
                <Text className="text-slate-500 font-bold">No units match your filters.</Text>
              </View>
            )}
          </>
        ) : null}
      </View>

      <UnitDetailsModal
        unit={selectedUnit}
        visible={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onSave={handleUnitUpdate}
      />

      {/* activeTower or Project possession modal depending on if we pass activeTower.id or projectId */}
      <PossessionModal
        isOpen={isPossessionModalOpen}
        onClose={() => setIsPossessionModalOpen(false)}
        entityId={activeTower ? activeTower.id : projectId}
        entityType={activeTower ? "tower" : "project"}
        entityName={activeTower ? activeTower.name : "Project"}
        onSuccess={() => {
          loadTowers();
        }}
      />

      <AssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={() => setAssignmentModal(prev => ({ ...prev, isOpen: false }))}
        entityId={assignmentModal.towerId}
        entityType="tower"
        entityName={assignmentModal.towerName}
        onSuccess={() => {
          loadTowers();
        }}
      />
    </View>
  );
}
