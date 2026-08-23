"use client";
import { SharedInventoryDashboard } from "@/features/inventory/components/project/SharedInventoryDashboard";

export default function SalesExecutiveInventory() {
  return (
    <SharedInventoryDashboard
      roleCode="SALES_EXECUTIVE"
      title="My Assigned Projects"
      subtitle="View live availability and book units for your clients."
      linkPrefix="/dashboard/sales-executive/inventory"
      canCreateProject={false}
      canSetPossession={false}
      emptyStateTitle="No Projects Assigned"
      emptyStateSubtitle="Please contact your Sales Manager to get assigned to a project."
    />
  );
}
