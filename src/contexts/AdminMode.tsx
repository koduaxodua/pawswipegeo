import { createContext, useContext, type ReactNode } from 'react';

interface AdminModeValue {
  isAdmin: false;
  registerTermsTap: () => false;
  exit: () => void;
}

const Ctx = createContext<AdminModeValue | null>(null);

const disabledAdminMode: AdminModeValue = {
  isAdmin: false,
  registerTermsTap: () => false,
  exit: () => {},
};

// Hidden client-side admin mode is intentionally disabled. Real admin access is
// handled by /admin-login and server-side Vercel API routes with HttpOnly cookie
// sessions.
export function AdminModeProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={disabledAdminMode}>{children}</Ctx.Provider>;
}

export function useAdminMode() {
  const ctx = useContext(Ctx);
  if (!ctx) return disabledAdminMode;
  return ctx;
}
