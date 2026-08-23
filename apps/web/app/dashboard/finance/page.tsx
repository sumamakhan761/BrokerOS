"use client";

import { authClient } from "@/lib/auth-client";
import { DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function FinanceDashboard() {
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);

  // @ts-ignore
  const userRole = session?.user?.roleId as any;
  const isManager = userRole.includes('MANAGER') || userRole === 'DIRECTOR' || userRole === 'ADMIN';

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await authClient.$fetch('/dashboard/finance', {

        });
        setData(res);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setData(err?.response?.status === 403 ? "Access Denied (403 Forbidden)" : "Failed to connect to backend");
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Finance Portal</h1>
          <p className="text-gray-500">Role-specific dashboard access.</p>
        </div>
      </div>

      {status === "loading" && (
        <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse flex items-center gap-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Verifying authorization...</span>
        </div>
      )}

      {status === "error" && (
        <div className="p-8 rounded-2xl bg-red-50 border border-red-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Unauthorized Action</h2>
          </div>
          <p className="text-red-600 mb-2 font-medium">
            The backend explicitly rejected your request.
          </p>
          <div className="mt-4 p-4 bg-white rounded-xl border border-red-200 font-mono text-sm text-red-500 shadow-inner">
            Backend Response: {data}
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-4 text-green-600 relative z-10">
              <CheckCircle2 className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Access Granted</h2>
            </div>
            <p className="text-gray-600 mb-6 relative z-10">
              The backend verified your role and authorized access to the Finance Portal.
            </p>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 relative z-10">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Secure Payload</h3>
              <pre className="font-mono text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>

          {isManager && (
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                Manager Overview
              </h2>
              <p className="text-blue-100 opacity-90">
                You have elevated privileges. In future iterations, you will see your team's aggregated data and a Team selector here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
