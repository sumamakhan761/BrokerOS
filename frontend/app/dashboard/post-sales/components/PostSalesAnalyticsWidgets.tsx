import React from "react";

export interface PostSalesAnalyticsWidgetsData {
  totalBooked: number;
  totalHandoverCompleted: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRate: string;
}

export function PostSalesAnalyticsWidgets({ widgets }: { widgets: PostSalesAnalyticsWidgetsData }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const widgetData = [
    { label: "Total Booked Customers", value: widgets.totalBooked, icon: "👥", accent: "#6366f1" },
    { label: "Handover Completed", value: widgets.totalHandoverCompleted, icon: "🔑", accent: "#10b981" },
    { label: "Total Revenue Generated", value: formatCurrency(widgets.totalRevenue), icon: "💰", accent: "#f59e0b" },
    { label: "Total Commission", value: formatCurrency(widgets.totalCommission), icon: "💵", accent: "#8b5cf6" },
    { label: "Conversion Rate", value: `${widgets.conversionRate}%`, icon: "📈", accent: "#ec4899" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 18 }}>
      {widgetData.map((w, i) => (
        <div key={w.label} className="widget-card dash-card" style={{ animationDelay: `${i * 0.05}s` }}>
          <div style={{
            position: "absolute", top: 0, right: 0, width: 60, height: 60,
            background: `radial-gradient(circle, ${w.accent}15, transparent)`,
            borderRadius: "0 16px 0 60px",
          }} />
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${w.accent}15`, color: w.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 16 }}>
            {w.icon}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0c1323ff" }}>
            {w.value}
          </div>
          <div style={{ fontSize: 13, color: "#485568ff", marginTop: 4, fontWeight: 500 }}>
            {w.label}
          </div>
        </div>
      ))}
    </div>
  );
}
