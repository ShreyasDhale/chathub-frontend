import { DynamicApiResponse } from "@/types/api.types";

/** Extracts a user-facing error string from the backend envelope. */
export function getApiErrorMessage(
  response: Partial<DynamicApiResponse> | null | undefined,
  fallback = "Something went wrong. Please try again."
): string {
  if (response?.Message?.trim()) return response.Message.trim();
  if (response?.Status && response.Status !== "Ok") return response.Status;
  return fallback;
}

/** Normalises fetch/network failures thrown by httpClient. */
export function getRequestErrorMessage(
  error: unknown,
  fallback = "Network error. Please try again."
): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: string }).message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  return fallback;
}
