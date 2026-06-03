const TOKEN_KEY = "chathub_token";
const USER_KEY = "chathub_user";
const COOKIE_NAME = "chathub_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_KEY);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function saveToken(token: string) {
  const payload = parseJwt(token);
  const userId = payload.UserID.toString();

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, userId);
  document.cookie = `${COOKIE_NAME}=${token}; path=/; SameSite=Lax`;
}

function parseJwt(token: string): { UserID: number } {
  const base64Payload = token.split(".")[1];
  const payload = atob(base64Payload);
  return JSON.parse(payload);
}
