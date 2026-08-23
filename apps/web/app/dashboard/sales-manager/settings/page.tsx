import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm">Manage preferences and configurations.</p>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Settings className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Manager Settings</h3>
        <p className="text-gray-500 text-sm mt-2 text-center max-w-sm">
          Configure notification settings and dashboard preferences.
        </p>
      </div>
    </div>
  );
}
