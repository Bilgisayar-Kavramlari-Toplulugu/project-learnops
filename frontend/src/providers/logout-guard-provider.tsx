"use client";

import { createContext, useContext, useRef, useCallback, type ReactNode } from "react";

// Guard fonksiyonu: UserMenu tarafından çağrılır, proceed() logout'u sürdürür.
type GuardFn = (proceed: () => void) => void;

interface LogoutGuardContextValue {
  registerGuard: (fn: GuardFn) => void;
  unregisterGuard: () => void;
  triggerGuard: (proceed: () => void) => boolean; // true = guard tetiklendi, logout dur
}

const LogoutGuardContext = createContext<LogoutGuardContextValue | null>(null);

export function LogoutGuardProvider({ children }: { children: ReactNode }) {
  const guardRef = useRef<GuardFn | null>(null);

  const registerGuard = useCallback((fn: GuardFn) => {
    guardRef.current = fn;
  }, []);

  const unregisterGuard = useCallback(() => {
    guardRef.current = null;
  }, []);

  const triggerGuard = useCallback((proceed: () => void): boolean => {
    if (!guardRef.current) return false;
    guardRef.current(proceed);
    return true;
  }, []);

  return (
    <LogoutGuardContext.Provider value={{ registerGuard, unregisterGuard, triggerGuard }}>
      {children}
    </LogoutGuardContext.Provider>
  );
}

export function useLogoutGuard() {
  const ctx = useContext(LogoutGuardContext);
  if (!ctx) throw new Error("useLogoutGuard must be used within LogoutGuardProvider");
  return ctx;
}
