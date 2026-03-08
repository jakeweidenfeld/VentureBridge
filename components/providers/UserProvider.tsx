"use client";

import { createContext, useContext, type ReactNode } from "react";

export type UserType = "startup" | "vc";

export interface UserContextValue {
  userId: string;
  email: string;
  fullName: string | null;
  userType: UserType;
  // Startup fields
  companyName: string | null;
  stage: string | null;
  primarySector: string | null;
  // VC fields
  fundName: string | null;
  fundSize: string | null;
  hqCity: string | null;
  // Computed display strings
  displayName: string;
  displaySubtitle: string;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: UserContextValue;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
