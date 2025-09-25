import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useApi() {
  const { getToken } = useAuth();

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  return { request };
}

export type ScheduleItem = {
  _id: string;
  userId?: string;
  therapistId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status?: string;
};


