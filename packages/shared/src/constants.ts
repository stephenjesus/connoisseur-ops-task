export const STAGES = [
  "CUTTING",
  "STITCHING",
  "FINISHING",
  "PACKING",
  "COMPLETED",
] as const;

export type Stage = (typeof STAGES)[number];

export const PRODUCTION_STAGES = [
  "CUTTING",
  "STITCHING",
  "FINISHING",
  "PACKING",
] as const;

export type ProductionStage = (typeof PRODUCTION_STAGES)[number];

export const LOCATIONS = ["FACTORY_STORE", "DISPATCH"] as const;

export type Location = (typeof LOCATIONS)[number];

export const ROLES = ["OPERATOR", "MANAGER"] as const;

export type Role = (typeof ROLES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  CUTTING: "Cutting",
  STITCHING: "Stitching",
  FINISHING: "Finishing",
  PACKING: "Packing",
  COMPLETED: "Completed",
};

export const STAGE_COLORS: Record<ProductionStage, string> = {
  CUTTING: "amber",
  STITCHING: "blue",
  FINISHING: "purple",
  PACKING: "green",
};

export const LOCATION_LABELS: Record<Location, string> = {
  FACTORY_STORE: "Factory Store",
  DISPATCH: "Dispatch",
};

export function getNextStage(current: Stage): Stage | null {
  const index = STAGES.indexOf(current);
  if (index === -1 || index >= STAGES.length - 1) return null;
  return STAGES[index + 1];
}

export function isValidTransition(from: Stage, to: Stage): boolean {
  return getNextStage(from) === to;
}
