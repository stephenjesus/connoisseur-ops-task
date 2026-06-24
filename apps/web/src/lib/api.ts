import { createApiClient } from "@connoisseur/api-client";

export const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
});

export function clientApi(getToken?: () => string | null) {
  return createApiClient({
    baseUrl: "",
    getToken: async () => getToken?.() ?? null,
  });
}
