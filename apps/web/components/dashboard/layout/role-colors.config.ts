// ============================================================================
// BrokerOS — Dashboard Role Color Mapping (Perceptual OKLCH)
// ============================================================================

export interface RoleColorStyle {
  accent: string;
  bg: string;
  border: string;
  label: string;
}

export const ROLE_CONFIG: Record<string, RoleColorStyle> = {
  PRE_SALES: {
    accent: "oklch(0.535 0.235 275)",
    bg: "oklch(0.975 0.015 275)",
    border: "oklch(0.895 0.075 275)",
    label: "Pre-Sales",
  },
  PRE_SALES_MANAGER: {
    accent: "oklch(0.455 0.215 275)",
    bg: "oklch(0.975 0.015 275)",
    border: "oklch(0.895 0.075 275)",
    label: "Pre-Sales Manager",
  },
  SALES_EXECUTIVE: {
    accent: "oklch(0.48 0.18 240)",
    bg: "oklch(0.965 0.035 240)",
    border: "oklch(0.88 0.06 240)",
    label: "Sales Executive",
  },
  SALES_MANAGER: {
    accent: "oklch(0.45 0.16 230)",
    bg: "oklch(0.965 0.035 230)",
    border: "oklch(0.88 0.06 230)",
    label: "Sales Manager",
  },
  POST_SALES: {
    accent: "oklch(0.42 0.16 145)",
    bg: "oklch(0.965 0.035 145)",
    border: "oklch(0.88 0.06 145)",
    label: "Post-Sales",
  },
  POST_SALES_MANAGER: {
    accent: "oklch(0.38 0.14 145)",
    bg: "oklch(0.965 0.035 145)",
    border: "oklch(0.88 0.06 145)",
    label: "Post-Sales Manager",
  },
  SOURCING_MANAGER: {
    accent: "oklch(0.50 0.17 80)",
    bg: "oklch(0.975 0.04 85)",
    border: "oklch(0.88 0.08 85)",
    label: "Sourcing Manager",
  },
  CLOSING_MANAGER: {
    accent: "oklch(0.46 0.20 25)",
    bg: "oklch(0.965 0.035 25)",
    border: "oklch(0.88 0.07 25)",
    label: "Closing Manager",
  },
  CHANNEL_PARTNER: {
    accent: "oklch(0.535 0.235 275)",
    bg: "oklch(0.975 0.015 275)",
    border: "oklch(0.895 0.075 275)",
    label: "Channel Partner",
  },
  FINANCE: {
    accent: "oklch(0.45 0.14 180)",
    bg: "oklch(0.965 0.035 180)",
    border: "oklch(0.88 0.06 180)",
    label: "Finance",
  },
  BUSINESS_MANAGER: {
    accent: "oklch(0.455 0.215 275)",
    bg: "oklch(0.975 0.015 275)",
    border: "oklch(0.895 0.075 275)",
    label: "Business Manager",
  },
  DIRECTOR: {
    accent: "oklch(0.38 0.18 260)",
    bg: "oklch(0.965 0.03 260)",
    border: "oklch(0.88 0.06 260)",
    label: "Director Suite",
  },
  ADMIN: {
    accent: "oklch(0.46 0.20 25)",
    bg: "oklch(0.965 0.035 25)",
    border: "oklch(0.88 0.07 25)",
    label: "Administrator",
  },
  MARKETING: {
    accent: "oklch(0.55 0.22 310)",
    bg: "oklch(0.975 0.02 310)",
    border: "oklch(0.895 0.07 310)",
    label: "Marketing Suite",
  },
};
