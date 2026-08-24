"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, Wand2, Plus } from "lucide-react";
import { UnitGrid } from "@/features/inventory/components/units/UnitGrid";
import { UnitDetailsDrawer } from "@/features/inventory/components/units/UnitDetailsDrawer";
import { AiTowerGenerator } from "@/features/inventory/components/wizards/AiTowerGenerator";
import { ManualTowerWizard } from "@/features/inventory/components/wizards/ManualTowerWizard";
import { ProjectDocuments } from "@/features/inventory/components/project/ProjectDocuments";
import PossessionModal, {
  ConstructionStatus,
} from "@/features/inventory/components/modals/PossessionModal";
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
  canAssignTowers = false,
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
  const [activeTab, setActiveTab] = useState<"TOWERS" | "DOCUMENTS">("TOWERS");

  const [possessionModal, setPossessionModal] = useState<{
    isOpen: boolean;
    towerId: string;
    towerName: string;
    initialStatus?: ConstructionStatus;
    initialTimeline?: { value: number; unit: "MONTHS" | "YEARS" };
  }>({ isOpen: false, towerId: "", towerName: "" });

  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    towerId: string;
    towerName: string;
  }>({ isOpen: false, towerId: "", towerName: "" });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const loadTowers = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${baseUrl}/api/inventory/projects/${projectId}/towers`
      );
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
    const res = await fetch(
      `${baseUrl}/api/inventory/units/${unitId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updates.status,
          clearBooking: updates.status === "AVAILABLE",
          ...updates,
        }),
      }
    );
    if (!res.ok) throw new Error("Failed to update unit");
    await loadTowers();
    setSelectedUnit(null);
  };

  const handleUnitClick = (unit: any) => {
    const fullUnit = {
      ...unit,
      floor: activeTower.floors.find((f: any) => f.id === unit.floorId),
    };

    if (canManageTowers || canEditUnits) {
      setSelectedUnit(fullUnit);
    } else if (canBookUnits) {
      if (unit.status === "AVAILABLE") {
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
        const matchSearch = unit.unitNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchStatus =
          filterStatus === "ALL" || unit.status === filterStatus;
        const matchType = filterType === "ALL" || unit.type === filterType;
        return matchSearch && matchStatus && matchType;
      });
      return floor;
    });

    clonedTower.floors = clonedTower.floors.filter(
      (floor: any) => floor.units.length > 0
    );

    return clonedTower;
  }, [activeTower, searchQuery, filterStatus, filterType]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-enter">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-2xs">
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
          <div className="flex border-b border-slate-100 mt-5 overflow-x-auto scrollbar-hide gap-6">
            <button
              onClick={() => setActiveTab("TOWERS")}
              className={`pb-3 font-extrabold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "TOWERS"
                  ? "border-[var(--brand-600)] text-[var(--brand-700)]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Grid Inventory
            </button>
            <button
              onClick={() => setActiveTab("DOCUMENTS")}
              className={`pb-3 font-extrabold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "DOCUMENTS"
                  ? "border-[var(--brand-600)] text-[var(--brand-700)]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Documents & Media Vault
            </button>
          </div>

          {/* Sub Navigation: Tower Tabs */}
          {activeTab === "TOWERS" && towers.length > 0 && (
            <div className="flex gap-2 mt-3.5 overflow-x-auto pb-1 scrollbar-hide">
              {towers.map((tower) => (
                <button
                  key={tower.id}
                  onClick={() => setActiveTower(tower)}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all active:scale-[0.96] press-effect cursor-pointer ${
                    activeTower?.id === tower.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
        {activeTab === "DOCUMENTS" ? (
          <ProjectDocuments
            projectId={projectId}
            towerId={activeTower?.id}
            towers={towers}
            readOnly={!canManageTowers}
          />
        ) : (
          /* Tower Grid Content */
          <>
            {loading && towers.length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-200 border-t-[var(--brand-600)] rounded-full animate-spin" />
              </div>
            ) : towers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 border-dashed shadow-2xs">
                <Building2 className="w-14 h-14 text-slate-200 mx-auto mb-3" />
                <h2 className="text-base font-bold text-[var(--text-primary)] m-0">
                  No Towers Configured Yet
                </h2>
                {canManageTowers ? (
                  <>
                    <p className="text-xs text-[var(--text-muted)] mt-1 mb-5 font-medium">
                      Start by generating a tower using AI or create one manually.
                    </p>
                    <button
                      onClick={() => setIsAiGeneratorOpen(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.96] press-effect cursor-pointer"
                    >
                      <Wand2 size={14} />
                      <span>Generate First Tower</span>
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    This project does not have any inventory towers configured yet.
                  </p>
                )}
              </div>
            ) : activeTower ? (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 overflow-hidden space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
                      {activeTower.name} Unit Matrix
                    </h2>
                    {canSetPossession && (
                      <button
                        onClick={() =>
                          setPossessionModal({
                            isOpen: true,
                            towerId: activeTower.id,
                            towerName: activeTower.name,
                            initialStatus: activeTower.constructionStatus,
                            initialTimeline: activeTower.possessionTimeline,
                          })
                        }
                        className="px-2.5 py-1 text-[11px] font-bold bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 rounded-lg transition-all border border-purple-200 cursor-pointer"
                      >
                        Set Possession
                      </button>
                    )}
                    {canAssignTowers && (
                      <button
                        onClick={() =>
                          setAssignmentModal({
                            isOpen: true,
                            towerId: activeTower.id,
                            towerName: activeTower.name,
                          })
                        }
                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all border border-emerald-200 cursor-pointer"
                      >
                        Assign Tower
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"></span>{" "}
                      Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></span>{" "}
                      Reserved
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs"></span>{" "}
                      Sold
                    </span>
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
                  <div className="text-center py-12 text-xs font-semibold text-[var(--text-muted)] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    No units match your active filter criteria.
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
          onClose={() =>
            setPossessionModal((prev) => ({ ...prev, isOpen: false }))
          }
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
          onClose={() =>
            setAssignmentModal((prev) => ({ ...prev, isOpen: false }))
          }
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
