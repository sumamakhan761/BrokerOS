"use client";
import { useParams } from "next/navigation";
import { SharedProjectInventoryPage } from "@/features/inventory/components/project/SharedProjectInventoryPage";

export default function SourcingManagerProjectInventoryPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <SharedProjectInventoryPage
      projectId={projectId}
      backLink="/dashboard/sourcing-manager/inventory"
      title="Project Towers"
      canManageTowers={false}
      canBookUnits={false}
      canSetPossession={false}
    />
  );
}
