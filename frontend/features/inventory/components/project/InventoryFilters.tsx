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
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="Search Unit # (e.g. 101)"
        className="px-4 py-2 border border-slate-300 rounded-xl flex-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <select
        className="px-4 py-2 border border-slate-300 rounded-xl bg-white shadow-sm"
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value)}
      >
        <option value="ALL">All Status</option>
        <option value="AVAILABLE">Available</option>
        <option value="RESERVED">Reserved</option>
        <option value="SOLD">Sold</option>
        <option value="BLOCKED">Blocked</option>
      </select>
      <select
        className="px-4 py-2 border border-slate-300 rounded-xl bg-white shadow-sm"
        value={filterType}
        onChange={e => setFilterType(e.target.value)}
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
