import { useUser } from "@clerk/clerk-react";

export type AppRole = "patient" | "doctor" | undefined;

export function useRole(): {
  role: AppRole;
  isLoaded: boolean;
} {
  const { user, isLoaded } = useUser();
  const role =
    (user?.publicMetadata?.role as AppRole) ??
    (user?.unsafeMetadata?.role as AppRole) ??
    undefined;
  return { role, isLoaded };
}


