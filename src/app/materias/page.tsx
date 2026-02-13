"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getMaterias, setMaterias } from "@/lib/storage";
import type { Materia } from "@/types/horario";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Download, Upload } from "lucide-react";

/** Formato esperado al importar: array de objetos con al menos codigo; opcional nombre, instructor, grupos, id */
function parseMateriasFromJson(json: string): Materia[] {
  const raw = JSON.parse(json);
  const arr = Array.isArray(raw) ? raw : raw?.materias ?? [];
  return arr.map((item: Record<string, unknown>) => ({
    id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
    codigo: String(item.codigo ?? ""),
    nombre: String(item.nombre ?? ""),
    instructor: String(item.instructor ?? ""),
    grupos: Array.isArray(item.grupos) ? item.grupos : [],
  }));
}

export default function MateriasPage() {
  const [materias, setMateriasState] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMaterias().then((data) => {
      setMateriasState(data);
      setLoading(false);
    });
  }, []);

  async function remove(id: string) {
    const next = materias.filter((m) => m.id !== id);
    await setMaterias(next);
    setMateriasState(next);
  }

  function handleExport() {
    const json = JSON.stringify(materias, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `materias-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    setImportMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseMateriasFromJson(text);
      if (imported.length === 0) {
        setImportMessage("El archivo no contiene materias válidas.");
        return;
      }
      const next = [...materias];
      let created = 0;
      let updated = 0;
      for (const item of imported) {
        const codigo = item.codigo?.trim();
        if (!codigo) continue;
        const idx = next.findIndex((m) => m.codigo === codigo);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            nombre: item.nombre ?? next[idx].nombre,
            instructor: item.instructor ?? next[idx].instructor,
            grupos: (item.grupos?.length ? item.grupos : next[idx].grupos) as Materia["grupos"],
          };
          updated++;
        } else {
          next.push({ ...item, id: crypto.randomUUID(), codigo });
          created++;
        }
      }
      await setMaterias(next);
      setMateriasState(next);
      setImportMessage(
        `Importado: ${updated} actualizadas, ${created} nuevas. Total: ${next.length} materias.`
      );
    } catch {
      setImportMessage("Error al leer el archivo. Comprueba que sea un JSON válido.");
    }
    e.target.value = "";
  }

  return (
    <main className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Materias</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || materias.length === 0}>
            <Download className="size-4" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="size-4" />
            Importar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImport}
          />
          <Button asChild>
            <Link href="/materias/nueva">
              <Plus className="size-4" />
              Nueva materia
            </Link>
          </Button>
        </div>
      </div>

      {importMessage && (
        <p className="mb-4 text-sm text-muted-foreground">{importMessage}</p>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Cargando…
          </CardContent>
        </Card>
      ) : materias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay materias registradas.{" "}
            <Link href="/materias/nueva" className="text-primary underline">
              Agregar la primera
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead className="w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materias.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.codigo}</TableCell>
                  <TableCell>{m.nombre}</TableCell>
                  <TableCell>{m.instructor}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/materias/${m.id}/editar`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(m.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="mt-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Volver al inicio
        </Link>
      </p>
    </main>
  );
}
