"use client";
import { SharedInventoryDashboard } from "@/features/inventory/components/project/SharedInventoryDashboard";

export default function ClosingManagerInventoryDashboard() {
  return (
    <SharedInventoryDashboard
      roleCode="CLOSING_MANAGER"
      title="Project Inventory"
      subtitle="View your assigned projects and manage unit statuses."
      linkPrefix="/dashboard/closing-manager/inventory"
      canCreateProject={false}
      canSetPossession={false}
      apiEndpoint="/api/inventory/projects?isCpProject=true"
      emptyStateTitle="No Assigned Projects"
      emptyStateSubtitle="You haven't been assigned to any projects by the Channel Partner yet."
    />
  );
}
