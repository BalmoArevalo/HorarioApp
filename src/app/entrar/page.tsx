"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EntrarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        const { data: uc } = await supabase
          .from("user_carrera")
          .select("carrera_id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (uc) {
          router.replace("/");
          return;
        }
        router.replace("/elegir-contexto");
        return;
      }
      setChecking(false);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleContinuarSinCuenta() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      router.replace("/elegir-contexto");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Horario Universitario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Elige una opción para continuar. Puedes usar la app sin registrarte.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleContinuarSinCuenta}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Continuar sin cuenta
            </Button>
            <Button asChild className="w-full">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
