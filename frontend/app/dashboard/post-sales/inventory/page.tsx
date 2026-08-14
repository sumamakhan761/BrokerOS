"use client";
import { SharedInventoryDashboard } from "@/features/inventory/components/project/SharedInventoryDashboard";

export default function PostSalesInventoryDashboard() {
  return (
    <SharedInventoryDashboard
      roleCode="POST_SALES"
      title="Post-Sales Inventory"
      subtitle="View projects and update tower possession timelines."
      linkPrefix="/dashboard/post-sales/inventory"
      canCreateProject={false}
      canSetPossession={true}
      emptyStateTitle="No Projects Found"
      emptyStateSubtitle="There are currently no projects available."
    />
  );
}
