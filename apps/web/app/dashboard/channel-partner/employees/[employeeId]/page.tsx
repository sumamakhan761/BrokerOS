"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import SourcingManagerDashboard from "@/app/dashboard/sourcing-manager/page";
import ClosingManagerDashboard from "@/app/dashboard/closing-manager/page";

function ViewAsPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const employeeId = params.employeeId as string;
  const role = searchParams.get("role") || "sourcing";

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          Verifying session permissions…
        </p>
      </div>
    );
  }

  const roleTitle =
    role === "sourcing" ? "Sourcing Manager" : "Closing Manager";

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      {/* View As Banner */}
      <div className="bg-[var(--brand-600)] text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-base">👀</span>
          <p className="font-bold text-xs m-0">
            Supervisor Mode: Viewing Active Workspace of{" "}
            <span className="underline">{roleTitle}</span>
          </p>
        </div>
        <Link
          href="/dashboard/channel-partner/employees"
          className="flex items-center gap-1.5 text-white hover:bg-white/10 transition-colors text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 no-underline shadow-2xs"
        >
          <ArrowLeft size={13} /> <span>Back to Roster</span>
        </Link>
      </div>

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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
        </div>
      }
    >
      <ViewAsPageContent />
    </Suspense>
  );
}
