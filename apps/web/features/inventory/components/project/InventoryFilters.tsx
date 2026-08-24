import React from "react";
import { Search } from "lucide-react";

interface InventoryFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
}

export function InventoryFilters({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search Unit # (e.g. 101, 402)..."
          className="w-full h-9 pl-9 pr-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all tabular-nums"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <select
        className="h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all cursor-pointer"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="ALL">All Statuses</option>
        <option value="AVAILABLE">Available</option>
        <option value="RESERVED">Reserved</option>
        <option value="SOLD">Sold</option>
        <option value="BLOCKED">Blocked</option>
      </select>

      <select
        className="h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all cursor-pointer"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="ALL">All Types</option>
        <option value="SHOP">Shop</option>
        <option value="OFFICE">Office</option>
        <option value="STUDIO">Studio</option>
        <option value="ONE_BHK">1 BHK</option>
        <option value="TWO_BHK">2 BHK</option>
        <option value="THREE_BHK">3 BHK</option>
        <option value="FOUR_BHK">4 BHK</option>
        <option value="PENTHOUSE">Penthouse</option>
        <option value="VILLA">Villa</option>
      </select>
    </div>
  );
}
