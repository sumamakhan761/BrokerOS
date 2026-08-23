"use client";
import { useParams } from "next/navigation";
import { SharedProjectInventoryPage } from "@/features/inventory/components/project/SharedProjectInventoryPage";

export default function ClosingManagerProjectInventoryPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <SharedProjectInventoryPage
      projectId={projectId}
      backLink="/dashboard/closing-manager/inventory"
      title="Project Towers"
      canManageTowers={false}
      canBookUnits={false}
      canSetPossession={true}
      canEditUnits={true}
    />
  );
}
