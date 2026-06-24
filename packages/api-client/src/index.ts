import type {
  ApiResponse,
  BundleDto,
  CreateBundleInput,
  CreateStyleInput,
  DashboardDto,
  LoginInput,
  LoginResponse,
  StyleDto,
  TransitionInput,
} from "@connoisseur/shared";

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ClientOptions = {
  baseUrl: string;
  getToken?: () => string | null | Promise<string | null>;
};

export function createApiClient({ baseUrl, getToken }: ClientOptions) {
  async function request<T>(
    path: string,
    init?: RequestInit & { idempotencyKey?: string },
  ): Promise<T> {
    const token = getToken ? await getToken() : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    };

    if (token) headers.Authorization = `Bearer ${token}`;
    if (init?.idempotencyKey) {
      headers["Idempotency-Key"] = init.idempotencyKey;
    }

    const { idempotencyKey: _, ...fetchInit } = init ?? {};

    const res = await fetch(`${baseUrl}${path}`, {
      ...fetchInit,
      headers,
    });

    const json = (await res.json()) as ApiResponse<T>;

    if (!json.success) {
      throw new ApiClientError(
        json.error.code,
        json.error.message,
        res.status,
      );
    }

    return json.data;
  }

  return {
    login: (input: LoginInput) =>
      request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    getDashboard: () => request<DashboardDto>("/api/dashboard"),

    listStyles: () => request<StyleDto[]>("/api/styles"),

    createStyle: (input: CreateStyleInput) =>
      request<StyleDto>("/api/styles", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    listBundles: () => request<BundleDto[]>("/api/bundles"),

    getBundle: (id: string) => request<BundleDto>(`/api/bundles/${id}`),

    createBundle: (input: CreateBundleInput) =>
      request<BundleDto>("/api/bundles", {
        method: "POST",
        body: JSON.stringify(input),
      }),

    transitionBundle: (
      id: string,
      input: TransitionInput,
      idempotencyKey?: string,
    ) =>
      request<BundleDto>(`/api/bundles/${id}/transition`, {
        method: "POST",
        body: JSON.stringify(input),
        idempotencyKey,
      }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
