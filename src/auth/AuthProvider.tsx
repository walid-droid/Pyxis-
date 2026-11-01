import type { ReactNode } from "react";
import { AuthContext, useAuthValue } from "./AuthContext";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthValue();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
