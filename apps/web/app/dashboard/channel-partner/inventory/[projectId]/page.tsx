"use client";
import { useParams } from "next/navigation";
import { SharedProjectInventoryPage } from "@/features/inventory/components/project/SharedProjectInventoryPage";

export default function ChannelPartnerProjectInventoryPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <SharedProjectInventoryPage
      projectId={projectId}
      backLink="/dashboard/channel-partner/inventory"
      title="Project Towers (Channel Partner)"
      canManageTowers={true}
      canBookUnits={false}
      canSetPossession={true}
      canAssignTowers={true}
    />
  );
}
