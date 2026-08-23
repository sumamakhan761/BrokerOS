"use client";
import { SharedInventoryDashboard } from "@/features/inventory/components/project/SharedInventoryDashboard";

export default function InventoryDashboard() {
  return (
    <SharedInventoryDashboard
      roleCode="SALES_MANAGER"
      title="Project Inventory"
      subtitle="Manage towers and unit availability across all your assigned projects."
      linkPrefix="/dashboard/sales-manager/inventory"
      canCreateProject={true}
      canSetPossession={true}
      emptyStateTitle="No Projects Found"
      emptyStateSubtitle="You haven't been assigned to any projects yet, or they haven't been created."
    />
  );
}
