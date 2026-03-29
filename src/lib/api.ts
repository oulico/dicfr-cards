import type { ExportData, ExportWord } from "./types";

const API_URL = "https://dicfr-api.manemis.workers.dev";
const CLIENT_ID = "353654892895-6cdoksihfk46ljtanobl0sp1ia88it1g.apps.googleusercontent.com";
const REDIRECT_URI = "https://dicfr-cards.pages.dev";
const TOKEN_KEY = "dicfr-auth-token";
const USER_KEY = "dicfr-auth-user";

export interface AuthUser {
  email: string;
  name?: string;
  picture?: string;
}

export function getStoredAuth(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return null;
  }
}

export function startGoogleLogin() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "token",
    scope: "openid email profile",
    prompt: "select_account",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function handleAuthCallback(): { token: string } | null {
  const hash = window.location.hash;
  if (!hash.includes("access_token")) return null;

  const params = new URLSearchParams(hash.slice(1));
  const token = params.get("access_token");
  if (!token) return null;

  window.history.replaceState(null, "", window.location.pathname);
  return { token };
}

export async function authenticateWithAPI(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error("Auth failed");
  const { user } = (await res.json()) as { user: AuthUser };

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function syncPush(words: ExportWord[]): Promise<{ synced: number }> {
  const auth = getStoredAuth();
  if (!auth) throw new Error("Not logged in");

  const res = await fetch(`${API_URL}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ words }),
  });
  if (!res.ok) throw new Error(`Push failed: ${res.status}`);
  return res.json() as Promise<{ synced: number }>;
}

export async function syncPull(): Promise<ExportData> {
  const auth = getStoredAuth();
  if (!auth) throw new Error("Not logged in");

  const res = await fetch(`${API_URL}/sync`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  if (!res.ok) throw new Error(`Pull failed: ${res.status}`);
  return res.json() as Promise<ExportData>;
}
