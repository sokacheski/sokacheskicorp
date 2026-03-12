import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

function safeGet(key: string) {
  try {
    return (
      localStorage.getItem(key) ||
      sessionStorage.getItem(key)
    );
  } catch {
    return null;
  }
}

export function RequireAuth({ children }: Props) {
  const token = safeGet("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: Props) {
  const rawUser = safeGet("user");

  if (!rawUser) {
    return <Navigate to="/" replace />;
  }

  let user: any;

  try {
    user = JSON.parse(rawUser);
  } catch {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
