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

export function getNextStage(current: Stage): Stage | null {
  const index = STAGES.indexOf(current);
  if (index === -1 || index >= STAGES.length - 1) return null;
  return STAGES[index + 1];
}

export type BundleDto = {
  id: string;
  styleId: string;
  quantity: number;
  currentStage: Stage;
  createdAt: string;
  style: { id: string; sku: string; name: string };
};

export type LoginResponse = {
  token: string;
  user: { id: string; email: string; name: string; role: string };
};

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

async function request<T>(
  path: string,
  init?: RequestInit & { token?: string | null },
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error(
      `Cannot reach server at ${API_URL}. Use the same Wi‑Fi as your Mac and run pnpm web.`,
    );
  }

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`Server error (${res.status}). Is pnpm web running?`);
  }
  if (!json.success) {
    throw new Error(json.error?.message ?? "Request failed");
  }
  return json.data;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    }),

  getBundle: (id: string, token: string) =>
    request<BundleDto>(`/api/bundles/${id}`, { token }),

  transitionBundle: (
    id: string,
    body: { toStage: Stage; fromStage?: Stage },
    token: string,
    idempotencyKey?: string,
  ) =>
    request<BundleDto>(`/api/bundles/${id}/transition`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
      headers: idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : undefined,
    }),
};
