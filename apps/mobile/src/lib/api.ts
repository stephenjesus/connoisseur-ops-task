import * as SecureStore from "expo-secure-store";
import { createApiClient } from "@connoisseur/api-client";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const TOKEN_KEY = "connoisseur_token";

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export const api = createApiClient({
  baseUrl: API_URL,
  getToken,
});
