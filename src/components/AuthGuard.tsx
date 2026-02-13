"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PUBLIC_PATHS = ["/entrar", "/login", "/elegir-contexto"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace("/entrar");
        return;
      }
      const { data: existing } = await supabase
        .from("user_carrera")
        .select("carrera_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!existing) {
        router.replace("/elegir-contexto");
        return;
      }
      setReady(true);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }
  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </main>
    );
  }
  return <>{children}</>;
}
