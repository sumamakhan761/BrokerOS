"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, LayoutDashboard, LineChart, Users, FileText, CheckSquare } from "lucide-react";
import SourcingManagerDashboard from "@/app/dashboard/sourcing-manager/page";
import ClosingManagerDashboard from "@/app/dashboard/closing-manager/page";

// We will render the existing components but tell them to fetch from a different baseUrl or they fetch automatically if we patch their fetch calls?
// Actually, SourcingManagerDashboard is exported as a full page. We can reuse it if we pass props, but it currently doesn't accept props.
// Alternatively, since we need to render the exact same dashboard but with different data, we might need to modify those pages to accept `viewAsEmployeeId` prop.

function ViewAsPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const employeeId = params.employeeId as string;
  const role = searchParams.get("role") || "sourcing"; // 'sourcing' | 'closing'
  
  const { data: session, isPending } = authClient.useSession();
  
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const roleTitle = role === "sourcing" ? "Sourcing Manager" : "Closing Manager";

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 min-h-screen">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* View As Banner */}
      <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-lg sticky top-4 z-50 animate-[fadeUp_0.3s_ease]">
        <div className="flex items-center gap-3">
          <span className="text-xl">👀</span>
          <p className="font-medium text-sm">
            Viewing <span className="font-bold">{roleTitle}</span>'s Dashboard
          </p>
        </div>
        <Link href="/dashboard/channel-partner/employees" className="flex items-center gap-2 text-indigo-100 hover:text-white transition-colors text-sm font-semibold bg-indigo-700/50 px-3 py-1.5 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Link>
      </div>

      {/* Render the actual component and pass the employeeId via props.
          We will need to modify SourcingManagerDashboard and ClosingManagerDashboard to accept viewAsEmployeeId.
      */}
      {role === "sourcing" ? (
        <SourcingManagerDashboard viewAsEmployeeId={employeeId} />
      ) : (
        <ClosingManagerDashboard viewAsEmployeeId={employeeId} />
      )}
    </div>
  );
}

export default function ChannelPartnerViewAsEmployee() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>}>
      <ViewAsPageContent />
    </Suspense>
  );
}
