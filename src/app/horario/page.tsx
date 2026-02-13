"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getData, setSeleccionMaterias, setSeleccionGrupos } from "@/lib/storage";
import { buildEntradas, propuestaPorDefecto } from "@/lib/horario-build";
import { detectarChoques, grupoCausaChoque } from "@/lib/schedule-utils";
import type { Materia, SeleccionGrupos } from "@/types/horario";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { Legend } from "@/components/schedule/Legend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const COLORS = [
  "bg-pink-200 dark:bg-pink-900/50",
  "bg-amber-200 dark:bg-amber-900/50",
  "bg-slate-300 dark:bg-slate-700",
  "bg-sky-200 dark:bg-sky-900/50",
  "bg-emerald-200 dark:bg-emerald-900/50",
  "bg-violet-200 dark:bg-violet-900/50",
  "bg-rose-200 dark:bg-rose-900/50",
  "bg-teal-200 dark:bg-teal-900/50",
];

export default function HorarioPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [materiaIds, setMateriaIds] = useState<string[]>([]);
  const [seleccionGrupos, setSeleccionGruposState] = useState<SeleccionGrupos>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData().then(async (data) => {
      const sel = data.seleccionMaterias;
      const allMaterias = data.materias;
      let grupos = data.seleccionGrupos;
      const needDefault = sel.materiaIds.some((id) => !grupos[id] || grupos[id].GT == null);
      if (needDefault && sel.materiaIds.length > 0) {
        grupos = propuestaPorDefecto(allMaterias, sel.materiaIds);
        await setSeleccionGrupos(grupos);
      }
      setMaterias(allMaterias);
      setSelectedIds(new Set(sel.materiaIds));
      setMateriaIds(sel.materiaIds);
      setSeleccionGruposState(grupos);
      setLoading(false);
    });
  }, []);

  function toggleMateria(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  async function saveMaterias() {
    const ids = Array.from(selectedIds);
    await setSeleccionMaterias({ materiaIds: ids });
    setMateriaIds(ids);
    const needDefault = ids.some((id) => !seleccionGrupos[id] || seleccionGrupos[id].GT == null);
    if (needDefault && ids.length > 0) {
      const grupos = propuestaPorDefecto(materias, ids);
      await setSeleccionGrupos(grupos);
      setSeleccionGruposState(grupos);
    }
  }

  function updateGrupo(materiaId: string, tipo: "GT" | "GD" | "GL", numero: number) {
    const next = {
      ...seleccionGrupos,
      [materiaId]: {
        ...(seleccionGrupos[materiaId] ?? {}),
        [tipo]: numero,
      },
    };
    setSeleccionGrupos(next);
    setSeleccionGruposState(next);
  }

  const entradas = useMemo(
    () => buildEntradas(materias, materiaIds, seleccionGrupos),
    [materias, materiaIds, seleccionGrupos]
  );
  const conflictos = useMemo(() => detectarChoques(entradas), [entradas]);
  const colorByMateriaId = useMemo(() => {
    const o: Record<string, string> = {};
    materiaIds.forEach((id, i) => {
      o[id] = COLORS[i % COLORS.length];
    });
    return o;
  }, [materiaIds]);

  if (loading) {
    return (
      <main className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Ver horario</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Cargando…
          </CardContent>
        </Card>
        <p className="mt-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Horario</h1>

      {/* Elegir materias (parte de esta página, antes de grupos) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Elegir materias</CardTitle>
          <p className="text-sm text-muted-foreground">
            Marca las materias que quieres cursar. Guarda la selección y luego elige grupos abajo.
          </p>
        </CardHeader>
        <CardContent>
          {materias.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay materias.{" "}
              <Link href="/materias" className="text-primary underline">
                Registra materias
              </Link>{" "}
              primero.
            </p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-medium w-12">Marcar</th>
                    <th className="text-left p-3 font-medium min-w-[100px]">Código</th>
                    <th className="text-left p-3 font-medium">Materia</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 align-middle">
                        <Checkbox
                          id={`mat-${m.id}`}
                          checked={selectedIds.has(m.id)}
                          onCheckedChange={() => toggleMateria(m.id)}
                        />
                      </td>
                      <td className="p-3 align-middle font-medium">{m.codigo}</td>
                      <td className="p-3 align-middle">
                        <Label
                          htmlFor={`mat-${m.id}`}
                          className="cursor-pointer"
                        >
                          {m.nombre}
                        </Label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Button onClick={saveMaterias} disabled={materias.length === 0}>
              Guardar selección de materias
            </Button>
          </div>
        </CardContent>
      </Card>

      {materiaIds.length === 0 && (
        <Card className="mb-6">
          <CardContent className="py-8 text-center text-muted-foreground">
            Selecciona al menos una materia y guarda la selección para elegir grupos y ver el horario.
          </CardContent>
        </Card>
      )}

      {conflictos.length > 0 && materiaIds.length > 0 && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Choques de horario</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hay conflictos en el mismo día y hora. Cambia el grupo de alguna materia en los selectores abajo para evitar el choque.
            </p>
          </CardHeader>
        </Card>
      )}

      {conflictos.length === 0 && entradas.length > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          No hay choques de horario.
        </p>
      )}

      {materiaIds.length > 0 && (
      <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Elegir grupos por materia</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cambia GT, GD o GL para cada materia para evitar choques.
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-6 pb-4">
              {materiaIds.map((id) => {
                const m = materias.find((x) => x.id === id);
                if (!m) return null;
                const gts = m.grupos.filter((g) => g.tipo === "GT");
                const gds = m.grupos.filter((g) => g.tipo === "GD");
                const gls = m.grupos.filter((g) => g.tipo === "GL");
                const sel = seleccionGrupos[id] ?? {};

                return (
                  <div
                    key={id}
                    className="rounded-lg border p-3 min-w-[180px] space-y-2"
                  >
                    <p className="font-medium text-sm">{m.codigo}</p>
                    {gts.length > 0 && (
                      <div>
                        <Label className="text-xs">GT</Label>
                        <Select
                          value={sel.GT != null ? String(sel.GT) : ""}
                          onValueChange={(v) => updateGrupo(id, "GT", parseInt(v, 10))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="GT" />
                          </SelectTrigger>
                          <SelectContent>
                            {gts.map((g) => (
                              <SelectItem
                                key={g.numero}
                                value={String(g.numero)}
                                className={grupoCausaChoque(materias, materiaIds, seleccionGrupos, id, "GT", g.numero) ? "italic text-destructive" : undefined}
                              >
                                GT{g.numero} {g.salon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {gds.length > 0 && (
                      <div>
                        <Label className="text-xs">GD</Label>
                        <Select
                          value={sel.GD != null ? String(sel.GD) : ""}
                          onValueChange={(v) => updateGrupo(id, "GD", parseInt(v, 10))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="GD" />
                          </SelectTrigger>
                          <SelectContent>
                            {gds.map((g) => (
                              <SelectItem
                                key={g.numero}
                                value={String(g.numero)}
                                className={grupoCausaChoque(materias, materiaIds, seleccionGrupos, id, "GD", g.numero) ? "italic text-destructive" : undefined}
                              >
                                GD{g.numero} {g.salon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {gls.length > 0 && (
                      <div>
                        <Label className="text-xs">GL</Label>
                        <Select
                          value={sel.GL != null ? String(sel.GL) : ""}
                          onValueChange={(v) => updateGrupo(id, "GL", parseInt(v, 10))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="GL" />
                          </SelectTrigger>
                          <SelectContent>
                            {gls.map((g) => (
                              <SelectItem
                                key={g.numero}
                                value={String(g.numero)}
                                className={grupoCausaChoque(materias, materiaIds, seleccionGrupos, id, "GL", g.numero) ? "italic text-destructive" : undefined}
                              >
                                GL{g.numero} {g.salon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <ScheduleGrid
            entradas={entradas}
            conflictos={conflictos}
            colorByMateriaId={colorByMateriaId}
          />
        </CardContent>
      </Card>

      <Legend
        materias={materias}
        materiaIds={materiaIds}
        entradas={entradas}
        conflictos={conflictos}
        seleccionGrupos={seleccionGrupos}
        colorByMateriaId={colorByMateriaId}
      />
      </>
      )}

      <p className="mt-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Volver al inicio
        </Link>
      </p>
    </main>
  );
}
