"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ChevronRight } from "lucide-react";

const PUBLIC_PATHS = ["/entrar", "/login", "/elegir-contexto"];

type Context = { universidad: string; carrera: string } | null;

export function ContextBreadcrumb() {
  const pathname = usePathname();
  const [context, setContext] = useState<Context>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setLoading(false);
      setContext(null);
      return;
    }

    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_carrera")
        .select(
          "carreras(nombre, universidades(nombre))"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const nested = data?.carreras as
        | { nombre: string; universidades: { nombre: string } | null }
        | null;
      if (nested?.nombre) {
        setContext({
          universidad: nested.universidades?.nombre ?? "Universidad",
          carrera: nested.nombre,
        });
      } else {
        setContext(null);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (loading || !context || PUBLIC_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <nav
      className="border-b bg-muted/40 px-4 py-2 text-sm text-muted-foreground"
      aria-label="Contexto actual"
    >
      <div className="container mx-auto flex flex-wrap items-center gap-1">
        <span className="font-medium text-foreground">{context.universidad}</span>
        <ChevronRight className="size-4 shrink-0" aria-hidden />
        <span className="font-medium text-foreground">{context.carrera}</span>
        <span className="ml-2 shrink-0">
          <Link
            href="/elegir-contexto"
            className="underline hover:text-foreground"
          >
            Cambiar
          </Link>
        </span>
      </div>
    </nav>
  );
}
