import { Navigate, Outlet } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useRole, AppRole } from "@/hooks/use-role";

export function RoleRoute({ allow }: { allow: AppRole | AppRole[] }) {
  const { role, isLoaded } = useRole();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!isLoaded) return null;

  if (!role || !allowed.includes(role)) {
    return (
      <>
        <SignedOut>
          <Navigate to="/sign-in" replace />
        </SignedOut>
        <SignedIn>
          <Navigate to="/select-role" replace />
        </SignedIn>
      </>
    );
  }

  return <Outlet />;
}

export default RoleRoute;


