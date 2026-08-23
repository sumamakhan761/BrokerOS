"use client";
import { useParams } from "next/navigation";
import { SharedProjectInventoryPage } from "@/features/inventory/components/project/SharedProjectInventoryPage";

export default function PostSalesProjectInventoryPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <SharedProjectInventoryPage
      projectId={projectId}
      backLink="/dashboard/post-sales/inventory"
      title="Project Overview"
      canManageTowers={false}
      canBookUnits={false}
      canSetPossession={true}
    />
  );
}
