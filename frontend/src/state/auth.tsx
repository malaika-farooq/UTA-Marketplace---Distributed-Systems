import React, { createContext, useContext, useMemo, useState } from "react";

type AuthCtx = {
  token: string | null;
  userId: string | null;
  setAuth: (token: string, userId: string) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem("userId"));

  const value = useMemo<AuthCtx>(
    () => ({
      token,
      userId,
      setAuth: (t, uid) => {
        setToken(t);
        setUserId(uid);
        localStorage.setItem("token", t);
        localStorage.setItem("userId", uid);
      },
      logout: () => {
        setToken(null);
        setUserId(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      },
    }),
    [token, userId]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}