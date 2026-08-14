"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Lock, Phone, ArrowRight, Building2, Loader2, Mail, Briefcase } from "lucide-react";

type Role = {
  id: string;
  name: string;
  code: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch available roles for the dropdown
    async function fetchRoles() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/roles`);
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    }
    fetchRoles();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!roleId) {
      setError("Please select your role identity.");
      return;
    }

    setLoading(true);

    try {
      // We pass the 4-factor payload. Better Auth natively handles email/password.
      // Our custom backend hook on /sign-in/email intercepts this and checks phoneNumber and roleId.
      const { data, error: authError } = await authClient.signIn.email({
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        roleId: roleId
      } as any);

      if (authError) {
        setError(authError.message || "Invalid credentials or identity mismatch.");
      } else if (data) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-200/40 blur-[120px] pointer-events-none animate-pulse delay-1000" />
      
      {/* Glassmorphism Container */}
      <div className="relative w-full max-w-md p-8 md:p-12 mx-4 rounded-3xl bg-white/70 border border-slate-200/50 backdrop-blur-xl shadow-xl shadow-slate-200/50 overflow-hidden my-8">
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">
              Strict Access
            </h1>
            <p className="text-slate-500 mt-2 text-center text-sm font-medium">
              Please provide all 4 identity factors.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-medium text-sm flex items-center justify-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium shadow-sm"
                  placeholder="Email Address"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium shadow-sm"
                  placeholder="Phone Number"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none font-medium shadow-sm"
                  required
                >
                  <option value="" className="text-slate-400">Select Your Role Identity</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium shadow-sm"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-lg shadow-indigo-600/20 mt-8"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify Identity & Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
