import type { Location, Role, Stage } from "./constants";

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorBody };

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type StyleDto = {
  id: string;
  sku: string;
  name: string;
  createdAt: string;
};

export type BundleDto = {
  id: string;
  styleId: string;
  quantity: number;
  currentStage: Stage;
  createdAt: string;
  style: Pick<StyleDto, "id" | "sku" | "name">;
};

export type StockBalanceDto = {
  styleId: string;
  location: Location;
  quantity: number;
  style: Pick<StyleDto, "id" | "sku" | "name">;
};

export type StageTransitionDto = {
  id: string;
  bundleId: string;
  fromStage: Stage;
  toStage: Stage;
  createdAt: string;
  user: Pick<AuthUser, "id" | "name" | "email">;
  bundle: Pick<BundleDto, "id" | "style">;
};

export type DashboardDto = {
  wipByStage: Record<Stage, number>;
  stock: StockBalanceDto[];
  recentActivity: StageTransitionDto[];
};
