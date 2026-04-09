import type { ExportData, StudyDay, SerializedReviewLog, ExportWordV2 } from "./types";

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

export async function syncPush(words: ExportWordV2[], studyDays?: StudyDay[], reviewLogs?: SerializedReviewLog[]): Promise<{ synced: number }> {
  const auth = getStoredAuth();
  if (!auth) throw new Error("Not logged in");

  const res = await fetch(`${API_URL}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ version: 2, words, studyDays, reviewLogs }),
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
  const data = await res.json() as ExportData;
  if (data.version === 1) {
    return data;
  }
  return data as ExportData;
}

export interface Classroom {
  id: string;
  name: string;
  inviteCode: string;
  role: 'teacher' | 'student';
  teacherName?: string;
}

export interface ClassroomStudent {
  email: string;
  name: string;
  joinedAt: string;
  lastActive: string | null;
  streak: number;
  totalCards: number;
  retentionRate: number;
  cardsDue: number;
}

export interface ShareData {
  id: string;
  teacherName: string;
  classroomName: string;
  expiresAt: string;
  words: ExportWordV2[];
}

export async function createClassroom(token: string, name: string): Promise<Classroom> {
  const res = await fetch(`${API_URL}/classroom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Create classroom failed: ${res.status}`);
  return res.json() as Promise<Classroom>;
}

export async function fetchClassrooms(token: string): Promise<Classroom[]> {
  const res = await fetch(`${API_URL}/classroom`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Fetch classrooms failed: ${res.status}`);
  return res.json() as Promise<Classroom[]>;
}

export async function fetchStudents(token: string, classroomId: string): Promise<ClassroomStudent[]> {
  const res = await fetch(`${API_URL}/classroom/${classroomId}/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Fetch students failed: ${res.status}`);
  return res.json() as Promise<ClassroomStudent[]>;
}

export async function getInviteLink(token: string, classroomId: string): Promise<{ inviteCode: string; inviteLink: string }> {
  const res = await fetch(`${API_URL}/classroom/${classroomId}/invite`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Get invite link failed: ${res.status}`);
  return res.json() as Promise<{ inviteCode: string; inviteLink: string }>;
}

export async function joinClassroom(token: string, inviteCode: string): Promise<Classroom> {
  const res = await fetch(`${API_URL}/classroom/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ inviteCode }),
  });
  if (!res.ok) throw new Error(`Join classroom failed: ${res.status}`);
  return res.json() as Promise<Classroom>;
}

export async function createShare(token: string, classroomId: string, words: ExportWordV2[]): Promise<{ id: string; shareLink: string }> {
  const res = await fetch(`${API_URL}/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ classroomId, words }),
  });
  if (!res.ok) throw new Error(`Create share failed: ${res.status}`);
  return res.json() as Promise<{ id: string; shareLink: string }>;
}

export async function getShare(shareId: string): Promise<ShareData> {
  const res = await fetch(`${API_URL}/share/${shareId}`);
  if (!res.ok) throw new Error(`Get share failed: ${res.status}`);
  return res.json() as Promise<ShareData>;
}
