"use client";

import { createContext, ReactNode, useContext } from "react";

type User = {
  id: number;
  role: "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN";
  fullName: string;
  officialEmail: string;
  empNo: number;
  dept: string;
};

const AuthContext = createContext<User | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: User | null;
  children: ReactNode;
}) {
  return <AuthContext value={user}>{children}</AuthContext>;
}

export function useAuth() {
  return useContext(AuthContext);
}
