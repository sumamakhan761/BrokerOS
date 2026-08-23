/* ── Shared DashboardPageWrapper ────────────────────────────────────
   Handles loading state, error state, and page header for all pages.
   Replaces: Inline loading/error/header code in every page.tsx
   ------------------------------------------------------------------ */

export function DashboardPageWrapper({
  loading,
  error,
  userName,
  title,
  subtitle,
  children,
  headerRight,
}: {
  loading: boolean;
  error?: string | null;
  userName?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}>
        <div style={{ position: "relative", width: 36, height: 36 }}>
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2.5px solid var(--brand-100)",
          }} />
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTopColor: "var(--brand-600)",
            animation: "dash-spin 0.75s linear infinite",
          }} />
        </div>
        <p style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          fontWeight: 500,
        }}>
          Loading…
        </p>
        <style>{`@keyframes dash-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: "var(--danger-bg)",
        border: "1px solid #fecaca",
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        maxWidth: 560,
        margin: "32px auto",
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 18,
        }}>
          ⚠
        </div>
        <div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>
            Failed to load
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--danger-fg)" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 28,
      maxWidth: 1400,
      width: "100%",
      animation: "enter 0.45s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      {/* Page header */}
      {(userName || title) && (
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            {userName && (
              <h1 style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1.1,
              }}>
                {title ? title : <>Welcome back, {userName.split(" ")[0]} <span>👋</span></>}
              </h1>
            )}
            {!userName && title && (
              <h1 style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1.1,
              }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--text-tertiary)",
                marginTop: 6,
                marginBottom: 0,
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}
