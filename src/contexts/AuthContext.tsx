"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  session: unknown;
  user: { id: string; is_anonymous?: boolean } | null;
  isAnonymous: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  isAnonymous: false,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  const user =
    session && typeof session === "object" && "user" in session
      ? (session as { user: { id: string; is_anonymous?: boolean } }).user
      : null;
  const isAnonymous = user?.is_anonymous === true;

  const value: AuthContextValue = {
    session,
    user,
    isAnonymous,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      session: null,
      user: null,
      isAnonymous: false,
      loading: false,
    };
  }
  return ctx;
}
