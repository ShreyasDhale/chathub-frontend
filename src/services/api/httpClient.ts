import toast from "react-hot-toast";
import { DynamicApiResponse } from "@/types/api.types";
import { getToken } from "@/utils/auth.storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  showToast?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    showToast = true,
  } = options;

  const token = getToken();

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const call = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(call, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await response.json().catch(() => null)) as
    | DynamicApiResponse
    | null;

  if (!response.ok) {
    throw {
      status: response.status,
      message: json?.Message || "API request failed",
    };
  }

  if (
    showToast &&
    method !== "GET" &&
    json &&
    typeof json === "object" &&
    "Message" in json &&
    json.Message &&
    json.StatusCode === 0
  ) {
    toast.success(json.Message);
  } else if (json && json.StatusCode !== 0) {
    if (showToast && json.Message) {
      toast.error(json.Message);
    }
  }

  return json as T;
}
