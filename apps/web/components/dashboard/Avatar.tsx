import React from "react";

const AVATAR_PALETTE = [
  "bg-purple-600",
  "bg-indigo-600",
  "bg-sky-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
];

export function Avatar({
  name,
  image,
  size = 34,
}: {
  name?: string;
  image?: string;
  size?: number;
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const colorIdx = name ? name.charCodeAt(0) % AVATAR_PALETTE.length : 0;
  const colorClass = AVATAR_PALETTE[colorIdx];

  if (image) {
    return (
      <img
        src={image}
        alt={name || "Avatar"}
        className="rounded-full object-cover flex-shrink-0 outline outline-1 -outline-offset-1 outline-black/10"
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full ${colorClass} text-white flex items-center justify-center font-extrabold flex-shrink-0 shadow-xs tracking-tight select-none`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.38)),
      }}
    >
      {initials}
    </div>
  );
}
