/* ── Shared Avatar ──────────────────────────────────────────────────
   Replaces: pre-sales/components/Avatar.tsx
             pre-sales-manager/_components/Avatar.tsx
   ------------------------------------------------------------------ */

const AVATAR_COLORS = [
  { bg: "var(--brand-600)", text: "#fff" },
  { bg: "#7c3aed", text: "#fff" },
  { bg: "#0369a1", text: "#fff" },
  { bg: "#15803d", text: "#fff" },
  { bg: "#b45309", text: "#fff" },
  { bg: "#be123c", text: "#fff" },
];

export function Avatar({
  name,
  image,
  size = 36,
}: {
  name?: string;
  image?: string;
  size?: number;
}) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const colorIdx = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  const color = AVATAR_COLORS[colorIdx];

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid var(--border-subtle)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color.bg,
        color: color.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
        letterSpacing: "0.02em",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {initials}
    </div>
  );
}
