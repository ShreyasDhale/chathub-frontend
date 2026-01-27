const TOKEN_KEY = "chathub_token";
const USER_KEY = "chathub_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  const payload = parseJwt(token);

  const userId = payload.UserID.toString();

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, userId);
}

function parseJwt(token: string): any {
  const base64Payload = token.split(".")[1];
  const payload = atob(base64Payload);
  return JSON.parse(payload);
}

