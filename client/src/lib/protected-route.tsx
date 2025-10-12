import { useAuth } from "@/hooks/use-auth";
import { ComponentType } from "react";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = []
}: {
  path: string;
  component: ComponentType<any>;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check role permissions if specified
  if (allowedRoles.length > 0 && user.role?.name) {
    if (!allowedRoles.includes(user.role.name)) {
      return (
        <Route path={path}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </div>
          </div>
        </Route>
      );
    }
  }

  return <Route path={path}><Component /></Route>;
}
