import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface AdminModeValue {
  isAdmin: boolean;
  registerTermsTap: () => boolean; // returns true if admin just unlocked
  exit: () => void;
}

const Ctx = createContext<AdminModeValue | null>(null);

const TAP_WINDOW_MS = 2500;
const REQUIRED_TAPS = 10;

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const tapsRef = useRef<number[]>([]);

  const registerTermsTap = useCallback(() => {
    if (isAdmin) return false;
    const now = Date.now();
    tapsRef.current = [...tapsRef.current.filter(t => now - t < TAP_WINDOW_MS), now];
    if (tapsRef.current.length >= REQUIRED_TAPS) {
      tapsRef.current = [];
      setIsAdmin(true);
      // Locale-aware toast — read locale directly from localStorage to avoid coupling
      const stored = (typeof window !== 'undefined' && localStorage.getItem('pawswipe_locale')) || 'ka';
      const detected = (typeof window !== 'undefined' && (navigator.language || 'en').toLowerCase().startsWith('ka')) ? 'ka' : 'en';
      const locale = stored === 'ka' || stored === 'en' ? stored : detected;
      toast({ title: locale === 'en' ? '🔓 Admin mode unlocked' : '🔓 ადმინ რეჟიმი ჩართულია' });
      return true;
    }
    return false;
  }, [isAdmin]);

  const exit = useCallback(() => {
    setIsAdmin(false);
    tapsRef.current = [];
  }, []);

  return <Ctx.Provider value={{ isAdmin, registerTermsTap, exit }}>{children}</Ctx.Provider>;
}

export function useAdminMode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminMode must be used inside AdminModeProvider');
  return ctx;
}
