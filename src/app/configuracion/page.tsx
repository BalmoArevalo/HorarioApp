"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScheduleConfig } from "@/contexts/ScheduleConfigContext";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_CONFIG } from "@/lib/schedule-utils";

export default function ConfiguracionPage() {
  const { config, timeSlots, setConfig, loading } = useScheduleConfig();
  const { isAnonymous } = useAuth();
  const [primeraHora, setPrimeraHora] = useState(DEFAULT_CONFIG.primeraHora);
  const [duracionMin, setDuracionMin] = useState(DEFAULT_CONFIG.duracionMin);
  const [descansoMin, setDescansoMin] = useState(DEFAULT_CONFIG.descansoMin);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setPrimeraHora(config.primeraHora);
      setDuracionMin(config.duracionMin);
      setDescansoMin(config.descansoMin);
    }
  }, [config]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await setConfig({
        primeraHora,
        duracionMin: Number(duracionMin) || DEFAULT_CONFIG.duracionMin,
        descansoMin: Number(descansoMin) || DEFAULT_CONFIG.descansoMin,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const duracionHoras = Math.floor((duracionMin || 0) / 60);
  const duracionMins = (duracionMin || 0) % 60;
  const duracionTexto =
    duracionHoras > 0
      ? `${duracionHoras} h ${duracionMins > 0 ? duracionMins + " min" : ""}`
      : `${duracionMin || 0} min`;

  if (loading && !config) {
    return (
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Configuración</h1>
        <p className="text-muted-foreground">Cargando…</p>
        <p className="mt-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <Card>
        <CardHeader>
          <CardTitle>Reglas de horario</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ajusta la hora de la primera clase, la duración de cada clase y el descanso entre clases.
            Los slots del horario se generan según estos valores. Actualiza aquí si tu universidad cambia los horarios.
            {isAnonymous && (
              <span className="block mt-2 text-muted-foreground">
                Inicia sesión para modificar la configuración.
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="primeraHora">Hora de la primera clase</Label>
              <Input
                id="primeraHora"
                type="time"
                value={primeraHora}
                onChange={(e) => setPrimeraHora(e.target.value)}
                required
                disabled={isAnonymous}
              />
              <p className="text-xs text-muted-foreground">
                Formato 24 h (ej. 06:20, 07:00).
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duracionMin">Duración de cada clase (minutos)</Label>
              <Input
                id="duracionMin"
                type="number"
                min={15}
                max={180}
                step={5}
                value={duracionMin}
                onChange={(e) => setDuracionMin(parseInt(e.target.value, 10) || 0)}
                disabled={isAnonymous}
              />
              <p className="text-xs text-muted-foreground">
                Ej. 100 = 1 h 40 min. Actual: {duracionTexto}.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descansoMin">Descanso entre clases (minutos)</Label>
              <Input
                id="descansoMin"
                type="number"
                min={0}
                max={30}
                value={descansoMin}
                onChange={(e) => setDescansoMin(parseInt(e.target.value, 10) || 0)}
                disabled={isAnonymous}
              />
            </div>
            {!isAnonymous && (
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar configuración"}
              </Button>
              {saved && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  Guardado. Los slots se actualizaron.
                </span>
              )}
            </div>
            )}
          </form>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Vista previa:</strong> con estos valores se generan{" "}
              <strong>{timeSlots.length}</strong> slots por día (desde{" "}
              {timeSlots[0]?.inicio} hasta {timeSlots[timeSlots.length - 1]?.fin}
              ). Las materias solo podrán usar estos bloques de horario.
            </p>
          </div>
        </CardContent>
      </Card>
      <p className="mt-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Volver al inicio
        </Link>
      </p>
    </main>
  );
}
