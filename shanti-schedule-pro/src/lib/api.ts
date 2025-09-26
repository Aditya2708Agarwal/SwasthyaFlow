import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useApi() {
  const { getToken } = useAuth();

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();
    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          ...(options.headers || {}),
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP error! status: ${res.status}`);
      }
      
      return res.json();
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to server at ${API_URL}. Please check if the server is running.`);
      }
      throw err;
    }
  }

  return { request };
}

export type TherapyType = 'Abhyanga' | 'Shirodhara' | 'Nasya' | 'Basti' | 'Swedana' | 'Panchakarma';

export type ScheduleItem = {
  _id: string;
  patientId: string;
  doctorId: string;
  therapyType: TherapyType;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
};


