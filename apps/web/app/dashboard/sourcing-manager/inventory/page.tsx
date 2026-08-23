"use client";
import { SharedInventoryDashboard } from "@/features/inventory/components/project/SharedInventoryDashboard";

export default function SourcingManagerInventoryDashboard() {
  return (
    <SharedInventoryDashboard
      roleCode="SOURCING_MANAGER"
      title="Project Inventory"
      subtitle="View your assigned projects and available towers."
      linkPrefix="/dashboard/sourcing-manager/inventory"
      canCreateProject={false}
      canSetPossession={false}
      apiEndpoint="/api/inventory/projects?isCpProject=true"
      emptyStateTitle="No Assigned Projects"
      emptyStateSubtitle="You haven't been assigned to any projects by the Channel Partner yet."
    />
  );
}
