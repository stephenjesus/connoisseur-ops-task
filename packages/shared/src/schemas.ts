import { z } from "zod";
import { LOCATIONS, ROLES, STAGES } from "./constants";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createStyleSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(120),
});

export const createBundleSchema = z.object({
  styleId: z.string().min(1),
  quantity: z.number().int().positive().max(10000),
  id: z.string().min(1).max(50).optional(),
});

export const transitionSchema = z.object({
  toStage: z.enum(STAGES),
  fromStage: z.enum(STAGES).optional(),
});

export const stockTransferSchema = z.object({
  styleId: z.string().min(1),
  fromLocation: z.enum(LOCATIONS),
  toLocation: z.enum(LOCATIONS),
  quantity: z.number().int().positive(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStyleInput = z.infer<typeof createStyleSchema>;
export type CreateBundleInput = z.infer<typeof createBundleSchema>;
export type TransitionInput = z.infer<typeof transitionSchema>;
export type StockTransferInput = z.infer<typeof stockTransferSchema>;

export { ROLES };
