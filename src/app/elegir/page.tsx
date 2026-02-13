"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getData, setSeleccionMaterias } from "@/lib/storage";
import type { Materia } from "@/types/horario";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ElegirPage() {
  const [materias, setMateriasState] = useState<Materia[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData().then((data) => {
      setMateriasState(data.materias);
      setSelectedIds(new Set(data.seleccionMaterias.materiaIds));
      setLoading(false);
    });
  }, []);

  function toggle(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  async function save() {
    await setSeleccionMaterias({ materiaIds: Array.from(selectedIds) });
    alert("Se guardó tu selección de materias.");
  }

  return (
    <main className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Elegir materias</h1>
      <p className="text-muted-foreground mb-6">
        Marca las materias que quieres cursar. Luego genera tu horario en la página &quot;Ver horario&quot;.
      </p>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Cargando…
          </CardContent>
        </Card>
      ) : materias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay materias.{" "}
            <Link href="/materias" className="text-primary underline">
              Registra materias
            </Link>{" "}
            primero.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Materias disponibles</CardTitle>
            <p className="text-sm text-muted-foreground">
              Seleccionadas: {selectedIds.size} de {materias.length}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {materias.map((m) => (
              <div
                key={m.id}
                className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50"
              >
                <Checkbox
                  id={m.id}
                  checked={selectedIds.has(m.id)}
                  onCheckedChange={() => toggle(m.id)}
                />
                <Label
                  htmlFor={m.id}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {m.codigo} — {m.nombre}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex gap-2">
        <Button onClick={save} disabled={materias.length === 0}>
          Guardar selección
        </Button>
        <Button variant="outline" asChild>
          <Link href="/horario">Ver horario</Link>
        </Button>
      </div>

      <p className="mt-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Volver al inicio
        </Link>
      </p>
    </main>
  );
}
