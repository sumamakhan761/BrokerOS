import React from "react";

export function CircleProgress({ done, target, label, color }: { done: number; target: number; label: string; color: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const pct = target === 0 ? 0 : Math.round(Math.min(1, done / target) * 100);
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={48} cy={48} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
          <circle
            cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{pct}%</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#374353ff", marginTop: 2 }}>{done} / {target}</div>
      </div>
    </div>
  );
}
