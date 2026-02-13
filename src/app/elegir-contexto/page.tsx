"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Universidad = { id: string; nombre: string; slug: string | null };
type Carrera = {
  id: string;
  nombre: string;
  slug: string | null;
  primera_hora: string;
  duracion_min: number;
  descanso_min: number;
};

export default function ElegirContextoPage() {
  const router = useRouter();
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [step, setStep] = useState<"universidad" | "carrera">("universidad");
  const [universidadId, setUniversidadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasCarrera, setHasCarrera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addUniNombre, setAddUniNombre] = useState("");
  const [addUniSlug, setAddUniSlug] = useState("");
  const [addCarreraNombre, setAddCarreraNombre] = useState("");
  const [addCarreraSlug, setAddCarreraSlug] = useState("");
  const [addCarreraPrimeraHora, setAddCarreraPrimeraHora] = useState("06:20");
  const [addCarreraDuracion, setAddCarreraDuracion] = useState(100);
  const [addCarreraDescanso, setAddCarreraDescanso] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session) return;
      setIsAnonymous(session.user.is_anonymous === true);

      const { data: uc } = await supabase
        .from("user_carrera")
        .select("carrera_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (uc) {
        setHasCarrera(true);
      }

      const { data: unis, error: e1 } = await supabase
        .from("universidades")
        .select("id, nombre, slug")
        .order("nombre");
      if (cancelled) return;
      if (e1) {
        setError(e1.message);
        setLoading(false);
        return;
      }
      setUniversidades(unis ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!universidadId) {
      setCarreras([]);
      return;
    }
    let cancelled = false;
    async function loadCarreras() {
      const { data, error: e } = await supabase
        .from("carreras")
        .select("id, nombre, slug, primera_hora, duracion_min, descanso_min")
        .eq("universidad_id", universidadId)
        .order("nombre");
      if (cancelled) return;
      if (e) {
        setCarreras([]);
        return;
      }
      setCarreras(data ?? []);
    }
    loadCarreras();
    return () => {
      cancelled = true;
    };
  }, [universidadId]);

  async function handleElegirCarrera(carreraId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.from("user_carrera").upsert(
      { user_id: user.id, carrera_id: carreraId },
      { onConflict: "user_id" }
    );
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  async function handleAgregarUniversidad(e: React.FormEvent) {
    e.preventDefault();
    if (!addUniNombre.trim()) return;
    setSubmitting(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("universidades")
      .insert({ nombre: addUniNombre.trim(), slug: addUniSlug.trim() || null })
      .select("id, nombre, slug")
      .single();
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data) {
      setUniversidades((prev) => [...prev, data]);
      setUniversidadId(data.id);
      setStep("carrera");
      setAddUniNombre("");
      setAddUniSlug("");
    }
  }

  async function handleAgregarCarrera(e: React.FormEvent) {
    e.preventDefault();
    if (!universidadId || !addCarreraNombre.trim()) return;
    setSubmitting(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("carreras")
      .insert({
        universidad_id: universidadId,
        nombre: addCarreraNombre.trim(),
        slug: addCarreraSlug.trim() || null,
        primera_hora: addCarreraPrimeraHora || "06:20",
        duracion_min: addCarreraDuracion || 100,
        descanso_min: addCarreraDescanso ?? 5,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data) {
      await handleElegirCarrera(data.id);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="container max-w-lg mx-auto py-8 px-4">
      {hasCarrera && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-3">
              Ya tienes una universidad y carrera elegidas.
            </p>
            <Button onClick={() => router.replace("/")} variant="default" className="w-full sm:w-auto">
              Ya tengo carrera, ir al inicio
            </Button>
          </CardContent>
        </Card>
      )}

      <h1 className="text-2xl font-bold mb-6">
        {step === "universidad" ? "Elegir universidad" : "Elegir carrera"}
      </h1>

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      {step === "universidad" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Universidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {universidades.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay universidades. {!isAnonymous && "Agrega una abajo."}
              </p>
            ) : (
              universidades.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-2">
                  <span>{u.nombre}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUniversidadId(u.id);
                      setStep("carrera");
                    }}
                  >
                    Elegir
                  </Button>
                </div>
              ))
            )}
            {!isAnonymous && (
              <form onSubmit={handleAgregarUniversidad} className="pt-4 border-t space-y-2">
                <Label>Agregar universidad</Label>
                <Input
                  placeholder="Nombre"
                  value={addUniNombre}
                  onChange={(e) => setAddUniNombre(e.target.value)}
                />
                <Input
                  placeholder="Slug (opcional)"
                  value={addUniSlug}
                  onChange={(e) => setAddUniSlug(e.target.value)}
                />
                <Button type="submit" disabled={submitting || !addUniNombre.trim()}>
                  Agregar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {step === "carrera" && universidadId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Carreras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("universidad");
                setUniversidadId(null);
              }}
            >
              ← Cambiar universidad
            </Button>
            {carreras.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay carreras. {!isAnonymous && "Agrega una abajo."}
              </p>
            ) : (
              carreras.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2">
                  <span>{c.nombre}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleElegirCarrera(c.id)}
                  >
                    Elegir
                  </Button>
                </div>
              ))
            )}
            {!isAnonymous && (
              <form onSubmit={handleAgregarCarrera} className="pt-4 border-t space-y-2">
                <Label>Agregar carrera</Label>
                <Input
                  placeholder="Nombre"
                  value={addCarreraNombre}
                  onChange={(e) => setAddCarreraNombre(e.target.value)}
                />
                <Input
                  placeholder="Slug (opcional)"
                  value={addCarreraSlug}
                  onChange={(e) => setAddCarreraSlug(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Primera hora (06:20)"
                    value={addCarreraPrimeraHora}
                    onChange={(e) => setAddCarreraPrimeraHora(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Duración min"
                    value={addCarreraDuracion}
                    onChange={(e) => setAddCarreraDuracion(Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Descanso min"
                    value={addCarreraDescanso}
                    onChange={(e) => setAddCarreraDescanso(Number(e.target.value))}
                  />
                </div>
                <Button type="submit" disabled={submitting || !addCarreraNombre.trim()}>
                  Agregar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground">
        <Link href="/entrar" className="underline">
          Volver
        </Link>
      </p>
    </main>
  );
}
