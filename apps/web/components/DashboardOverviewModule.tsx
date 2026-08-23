"use client";

import { authClient } from "@/lib/auth-client";
import { UserCircle, Shield, Building } from "lucide-react";
import LiveTrackingMap from "@/components/LiveTrackingMap";

export default function DashboardOverview() {
  const { data: session } = authClient.useSession();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Welcome, User!</h1>
        <p className="text-gray-500">
          This is your enterprise command center. Access your authorized tools from the sidebar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            <UserCircle className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Phone Number / Account</p>
          <p className="text-lg font-semibold truncate text-gray-800">{session?.user?.email}</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Role ID Reference</p>
          <p className="text-sm font-mono bg-gray-50 p-2 rounded-lg truncate mt-1 text-gray-700 border border-gray-100">
            {/* @ts-ignore */}
            {session?.user?.roleId || "No role assigned"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
            <Building className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Session Status</p>
          <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active & Secured
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-sm mb-10">
        <h2 className="text-xl font-bold mb-4 text-emerald-900">Live GPS Tracking</h2>
        <p className="text-emerald-800 leading-relaxed mb-6">
          This map automatically tracks your location in real-time as sent by the background service on your mobile device.
        </p>
        {/* @ts-ignore */}
        <LiveTrackingMap userId={session?.user?.id || 'default'} />
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-blue-900">Isolated Access Works Here</h2>
        <p className="text-blue-800 leading-relaxed">
          The sidebar navigation is now strictly filtered. You are only seeing the links that belong to your designated
          department role.
          <br /><br />
          The backend is also strictly locking down all other endpoints. If you were to somehow bypass the
          frontend navigation and type the URL for another department manually, the backend will actively
          intercept and throw a <strong>403 Forbidden Access Denied</strong> error.
        </p>
      </div>
    </div>
  );
}
