import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export function TowerHeatmap({ inventoryData }: { inventoryData: any }) {
  if (!inventoryData || !inventoryData.projects || inventoryData.projects.length === 0) return null;

  const [selectedProjectId, setSelectedProjectId] = useState(inventoryData.projects[0].id);
  const selectedProject = inventoryData.projects.find((p: any) => p.id === selectedProjectId) || inventoryData.projects[0];
  const [selectedTowerId, setSelectedTowerId] = useState(selectedProject?.towers?.[0]?.id);
  const selectedTower = selectedProject?.towers?.find((t: any) => t.id === selectedTowerId) || selectedProject?.towers?.[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-100 hover:bg-emerald-200 border-emerald-200 text-emerald-800';
      case 'RESERVED': return 'bg-amber-100 hover:bg-amber-200 border-amber-200 text-amber-800';
      case 'SOLD': return 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700 text-white';
      case 'BLOCKED': return 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-500';
      default: return 'bg-slate-100 border-slate-200 text-slate-500';
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Heatmap Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-slate-800">Inventory Heatmap</h3>
          <div className="flex gap-2">
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const proj = inventoryData.projects.find((p: any) => p.id === e.target.value);
                setSelectedTowerId(proj?.towers?.[0]?.id);
              }}
            >
              {inventoryData.projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedProject?.towers?.length > 0 && (
              <select
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedTowerId}
                onChange={(e) => setSelectedTowerId(e.target.value)}
              >
                {selectedProject.towers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedTower ? (
          <div className="flex-1 overflow-auto max-h-[500px] pr-2">
            <div className="flex flex-col gap-2">
              {selectedTower.floors?.sort((a: any, b: any) => b.floorNumber - a.floorNumber).map((floor: any) => (
                <div key={floor.id} className="flex items-center gap-4">
                  <div className="w-16 text-right text-xs font-bold text-slate-400">Flr {floor.floorNumber}</div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {floor.units?.sort((a: any, b: any) => a.unitNumber.localeCompare(b.unitNumber)).map((unit: any) => (
                      <div
                        key={unit.id}
                        title={`${unit.unitNumber} - ${unit.type || 'N/A'} - ${unit.status}`}
                        className={`w-12 h-10 rounded-md border flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors ${getStatusColor(unit.status)}`}
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
          <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400">
            No towers found for this project.
          </div>
        )}
      </motion.div>

      {/* Breakdown Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6"
      >
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800 mb-4">My Sales by Unit Type</h3>
          {inventoryData.salesByType && inventoryData.salesByType.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inventoryData.salesByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none">
                    {inventoryData.salesByType.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {inventoryData.salesByType.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No sales data yet.
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800 mb-4">My Sales by Facing</h3>
          {inventoryData.salesByFacing && inventoryData.salesByFacing.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inventoryData.salesByFacing} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none">
                    {inventoryData.salesByFacing.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {inventoryData.salesByFacing.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No sales data yet.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
