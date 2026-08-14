"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, Wand2 } from "lucide-react";
import { UnitGrid } from "@/features/inventory/components/units/UnitGrid";
import { UnitDetailsDrawer } from "@/features/inventory/components/units/UnitDetailsDrawer";
import { AiTowerGenerator } from "@/features/inventory/components/wizards/AiTowerGenerator";
import { ManualTowerWizard } from "@/features/inventory/components/wizards/ManualTowerWizard";
import { ProjectDocuments } from "@/features/inventory/components/project/ProjectDocuments";
import PossessionModal, { ConstructionStatus } from "@/features/inventory/components/modals/PossessionModal";
import { BookingModal } from "@/features/inventory/components/modals/BookingModal";
import { UnitInfoDrawer } from "@/features/inventory/components/units/UnitInfoDrawer";
import AssignmentModal from "@/features/inventory/components/modals/AssignmentModal";
import { InventoryHeader } from "./InventoryHeader";
import { InventoryFilters } from "./InventoryFilters";

interface SharedProjectInventoryPageProps {
  projectId: string;
  backLink: string;
  title: string;
  canManageTowers: boolean;
  canBookUnits: boolean;
  canSetPossession: boolean;
  canEditUnits?: boolean;
  canAssignTowers?: boolean;
}

export function SharedProjectInventoryPage({
  projectId,
  backLink,
  title,
  canManageTowers,
  canBookUnits,
  canSetPossession,
  canEditUnits = false,
  canAssignTowers = false
}: SharedProjectInventoryPageProps) {
  const router = useRouter();
  const [towers, setTowers] = useState<any[]>([]);
  const [activeTower, setActiveTower] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedAvailableUnit, setSelectedAvailableUnit] = useState<any>(null);
  const [selectedReservedUnit, setSelectedReservedUnit] = useState<any>(null);
  
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isManualWizardOpen, setIsManualWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'TOWERS' | 'DOCUMENTS'>('TOWERS');

  const [possessionModal, setPossessionModal] = useState<{
    isOpen: boolean;
    towerId: string;
    towerName: string;
    initialStatus?: ConstructionStatus;
    initialTimeline?: { value: number; unit: 'MONTHS' | 'YEARS' };
  }>({ isOpen: false, towerId: '', towerName: '' });

  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    towerId: string;
    towerName: string;
  }>({ isOpen: false, towerId: '', towerName: '' });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const loadTowers = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${baseUrl}/api/inventory/projects/${projectId}/towers`);
      if (!res.ok) throw new Error("Failed to fetch towers");
      const data = await res.json();
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
    loadTowers();
  }, [projectId]);

  const handleUnitUpdate = async (unitId: string, updates: any) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
    const res = await fetch(`${baseUrl}/api/inventory/units/${unitId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: updates.status,
        clearBooking: updates.status === 'AVAILABLE',
        ...updates
      })
    });
    if (!res.ok) throw new Error("Failed to update unit");
    await loadTowers();
    setSelectedUnit(null);
  };

  const handleUnitClick = (unit: any) => {
    const fullUnit = { ...unit, floor: activeTower.floors.find((f: any) => f.id === unit.floorId) };
    
    if (canManageTowers || canEditUnits) {
      setSelectedUnit(fullUnit);
    } else if (canBookUnits) {
      if (unit.status === 'AVAILABLE') {
        setSelectedAvailableUnit(fullUnit);
      } else {
        setSelectedReservedUnit(fullUnit);
      }
    } else {
      setSelectedUnit(fullUnit);
    }
  };

  const handleBookingSuccess = () => {
    setSelectedAvailableUnit(null);
    loadTowers();
  };

  const onTowerGenerated = () => {
    setIsAiGeneratorOpen(false);
    setIsManualWizardOpen(false);
    loadTowers();
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4">
          
          <InventoryHeader 
            title={title}
            backLink={backLink}
            loading={loading}
            canManageTowers={canManageTowers}
            onRefresh={loadTowers}
            onManualClick={() => setIsManualWizardOpen(true)}
            onAiClick={() => setIsAiGeneratorOpen(true)}
          />

          {/* Main Navigation Tabs */}
          <div className="flex border-b border-slate-200 mt-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('TOWERS')}
              className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'TOWERS'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
              Grid Inventory
            </button>
            <button
              onClick={() => setActiveTab('DOCUMENTS')}
              className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'DOCUMENTS'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
              Documents & Media
            </button>
          </div>

          {/* Sub Navigation: Tower Tabs */}
          {activeTab === 'TOWERS' && towers.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {towers.map(tower => (
                <button
                  key={tower.id}
                  onClick={() => setActiveTower(tower)}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${activeTower?.id === tower.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {tower.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        {activeTab === 'DOCUMENTS' ? (
          <ProjectDocuments projectId={projectId} towerId={activeTower?.id} towers={towers} readOnly={!canManageTowers} />
        ) : (
          /* Tower Grid Content */
          <>
            {loading && towers.length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : towers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900">No Towers Yet</h2>
                {canManageTowers ? (
                  <>
                    <p className="text-slate-500 mt-2 mb-6">Start by generating a tower using our AI or create one manually.</p>
                    <button
                      onClick={() => setIsAiGeneratorOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm"
                    >
                      <Wand2 className="w-5 h-5" /> Generate First Tower
                    </button>
                  </>
                ) : (
                  <p className="text-slate-500 mt-2">This project doesn't have any towers configured yet.</p>
                )}
              </div>
            ) : activeTower ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-900">{activeTower.name} Grid</h2>
                    {canSetPossession && (
                      <button
                        onClick={() => setPossessionModal({
                          isOpen: true,
                          towerId: activeTower.id,
                          towerName: activeTower.name,
                          initialStatus: activeTower.constructionStatus,
                          initialTimeline: activeTower.possessionTimeline
                        })}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                      >
                        Set Possession
                      </button>
                    )}
                    {canAssignTowers && (
                      <button
                        onClick={() => setAssignmentModal({
                          isOpen: true,
                          towerId: activeTower.id,
                          towerName: activeTower.name
                        })}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                      >
                        Assign Tower
                      </button>
                    )}
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Available</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Reserved</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-400"></span> Sold</span>
                  </div>
                </div>

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
                    onUnitClick={handleUnitClick}
                  />
                ) : (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No units match your filters.
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Modals and Drawers */}
      <UnitDetailsDrawer
        unit={selectedUnit}
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onSave={handleUnitUpdate}
        readOnly={!(canManageTowers || canEditUnits)}
      />

      {canBookUnits && (
        <>
          <BookingModal
            unit={selectedAvailableUnit}
            isOpen={!!selectedAvailableUnit}
            onClose={() => setSelectedAvailableUnit(null)}
            onSuccess={handleBookingSuccess}
          />
          <UnitInfoDrawer
            unit={selectedReservedUnit}
            isOpen={!!selectedReservedUnit}
            onClose={() => setSelectedReservedUnit(null)}
          />
        </>
      )}

      {(isAiGeneratorOpen || isManualWizardOpen) && canManageTowers && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl">
            {isAiGeneratorOpen && (
              <AiTowerGenerator
                projectId={projectId}
                onSuccess={onTowerGenerated}
                onCancel={() => setIsAiGeneratorOpen(false)}
              />
            )}
            {isManualWizardOpen && (
              <ManualTowerWizard
                projectId={projectId}
                onSuccess={onTowerGenerated}
                onCancel={() => setIsManualWizardOpen(false)}
              />
            )}
          </div>
        </div>
      )}

      {canSetPossession && (
        <PossessionModal
          isOpen={possessionModal.isOpen}
          onClose={() => setPossessionModal(prev => ({ ...prev, isOpen: false }))}
          entityId={possessionModal.towerId}
          entityType="tower"
          entityName={possessionModal.towerName}
          initialStatus={possessionModal.initialStatus}
          initialTimeline={possessionModal.initialTimeline}
          onSuccess={() => {
            loadTowers();
          }}
        />
      )}

      {assignmentModal.isOpen && (
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
      )}
    </div>
  );
}
