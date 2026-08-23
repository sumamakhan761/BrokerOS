"use client";
import { SharedInventoryDashboard } from "@/features/inventory/components/project/SharedInventoryDashboard";

export default function ChannelPartnerInventoryDashboard() {
  return (
    <SharedInventoryDashboard
      roleCode="CHANNEL_PARTNER"
      title="Channel Partner Inventory"
      subtitle="Create and manage projects assigned to Sourcing and Closing Managers."
      linkPrefix="/dashboard/channel-partner/inventory"
      canCreateProject={true}
      canSetPossession={true}
      apiEndpoint="/api/inventory/projects?isCpProject=true"
      emptyStateTitle="No CP Projects Found"
      emptyStateSubtitle="You haven't created any channel partner projects yet."
    />
  );
}
