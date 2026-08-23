export const PIPELINE_STAGES = [
  { key: "NEW", label: "New Lead", color: "#6366f1" },
  { key: "CONTACTED", label: "Contacted", color: "#8b5cf6" },
  { key: "INTERESTED", label: "Interested", color: "#a78bfa" },
  { key: "QUALIFIED", label: "Qualified", color: "#7c3aed" },
  { key: "SITE_VISIT_SCHEDULED", label: "Visit Scheduled", color: "#4f46e5" },
  { key: "SITE_VISIT_COMPLETED", label: "Visit Completed", color: "#4338ca" },
  { key: "BOOKING", label: "Booking", color: "#3730a3" },
  { key: "LOST", label: "Lost", color: "#9ca3af" },
];

export const TEMP_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  HOT: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", label: "Hot" },
  WARM: { bg: "rgba(249,115,22,0.12)", text: "#f97316", label: "Warm" },
  COLD: { bg: "rgba(59,130,246,0.12)", text: "#3b82f6", label: "Cold" },
};

export const STATUS_LABEL: Record<string, string> = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  QUALIFIED: "Qualified",
  SITE_VISIT_SCHEDULED: "Visit Sched.",
  SITE_VISIT_COMPLETED: "Visit Done",
  BOOKING: "Booking",
  LOST: "Lost",
};
