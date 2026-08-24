"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Building2 } from "lucide-react";

export function TowerHeatmap({ inventoryData }: { inventoryData: any }) {
  if (
    !inventoryData ||
    !inventoryData.projects ||
    inventoryData.projects.length === 0
  )
    return null;

  const [selectedProjectId, setSelectedProjectId] = useState(
    inventoryData.projects[0].id
  );
  const selectedProject =
    inventoryData.projects.find((p: any) => p.id === selectedProjectId) ||
    inventoryData.projects[0];
  const [selectedTowerId, setSelectedTowerId] = useState(
    selectedProject?.towers?.[0]?.id
  );
  const selectedTower =
    selectedProject?.towers?.find((t: any) => t.id === selectedTowerId) ||
    selectedProject?.towers?.[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800";
      case "RESERVED":
        return "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800";
      case "SOLD":
        return "bg-[var(--brand-600)] hover:bg-[var(--brand-700)] border-purple-600 text-white";
      case "BLOCKED":
        return "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500";
      default:
        return "bg-slate-50 border-slate-200 text-slate-500";
    }
  };

  const COLORS = ["#9333ea", "#10b981", "#f59e0b", "#0284c7", "#ec4899"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Heatmap Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-3xl shadow-2xs border border-slate-200/80 lg:col-span-2 flex flex-col space-y-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2 m-0">
              <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
                <Building2 size={13} />
              </div>
              <span>Tower Unit Matrix</span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
              Floor-wise inventory status matrix
            </p>
          </div>

          <div className="flex gap-2">
            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-base sm:text-xs font-semibold text-slate-700 outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const proj = inventoryData.projects.find(
                  (p: any) => p.id === e.target.value
                );
                setSelectedTowerId(proj?.towers?.[0]?.id);
              }}
            >
              {inventoryData.projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {selectedProject?.towers?.length > 0 && (
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-base sm:text-xs font-semibold text-slate-700 outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer"
                value={selectedTowerId}
                onChange={(e) => setSelectedTowerId(e.target.value)}
              >
                {selectedProject.towers.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedTower ? (
          <div className="flex-1 overflow-auto max-h-[460px] pr-2">
            <div className="flex flex-col gap-2">
              {selectedTower.floors
                ?.sort((a: any, b: any) => b.floorNumber - a.floorNumber)
                .map((floor: any) => (
                  <div key={floor.id} className="flex items-center gap-3">
                    <div className="w-14 text-right text-[11px] font-extrabold text-slate-400 tabular-nums">
                      F{floor.floorNumber}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-1.5">
                      {floor.units
                        ?.sort((a: any, b: any) =>
                          a.unitNumber.localeCompare(b.unitNumber)
                        )
                        .map((unit: any) => (
                          <div
                            key={unit.id}
                            title={`${unit.unitNumber} • ${
                              unit.type || "Unit"
                            } • ${unit.status}`}
                            className={`w-11 h-8 rounded-lg border flex items-center justify-center text-[10px] font-extrabold cursor-pointer transition-all active:scale-[0.96] tabular-nums ${getStatusColor(
                              unit.status
                            )}`}
                          >
                            {unit.unitNumber.slice(-3)}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-400 py-12">
            No towers available for this project.
          </div>
        )}
      </motion.div>

      {/* Breakdown Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className="bg-white p-6 rounded-3xl shadow-2xs border border-slate-200/80 flex flex-col justify-between space-y-6"
      >
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Sales by Unit Type
          </h3>
          {inventoryData.salesByType &&
          inventoryData.salesByType.length > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData.salesByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    stroke="none"
                  >
                    {inventoryData.salesByType.map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {inventoryData.salesByType.map(
                  (entry: any, index: number) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span>{entry.name}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No sales data recorded
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Sales by Facing Direction
          </h3>
          {inventoryData.salesByFacing &&
          inventoryData.salesByFacing.length > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData.salesByFacing}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    stroke="none"
                  >
                    {inventoryData.salesByFacing.map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[(index + 2) % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {inventoryData.salesByFacing.map(
                  (entry: any, index: number) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: COLORS[(index + 2) % COLORS.length],
                        }}
                      />
                      <span>{entry.name}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No facing data recorded
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
