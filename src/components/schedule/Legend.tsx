"use client";

import type { Materia, EntradaHorario, Conflicto } from "@/types/horario";
import { esEntradaEnConflicto } from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";

type Props = {
  materias: Materia[];
  materiaIds: string[];
  entradas: EntradaHorario[];
  conflictos: Conflicto[];
  seleccionGrupos: Record<string, { GT?: number; GD?: number; GL?: number }>;
  colorByMateriaId: Record<string, string>;
};

export function Legend({
  materias,
  materiaIds,
  entradas,
  conflictos,
  seleccionGrupos,
  colorByMateriaId,
}: Props) {
  const map = new Map(materias.map((m) => [m.id, m]));

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">Leyenda</h2>
      <div className="flex flex-wrap gap-3">
        {materiaIds.map((id) => {
          const m = map.get(id);
          if (!m) return null;
          const sel = seleccionGrupos[id] ?? {};
          const gruposStr = [
            sel.GT != null && `GT${sel.GT}`,
            sel.GD != null && `GD${sel.GD}`,
            sel.GL != null && `GL${sel.GL}`,
          ]
            .filter(Boolean)
            .join(", ");
          const materiaEntradas = entradas.filter((e) => e.materiaId === id);
          const hasConflict = materiaEntradas.some((e) =>
            esEntradaEnConflicto(e, conflictos)
          );
          const color = colorByMateriaId[id] ?? "bg-muted";

          return (
            <div
              key={id}
              className={cn(
                "rounded-lg border p-3 min-w-[200px]",
                hasConflict && "border-destructive bg-destructive/5"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-4 rounded shrink-0", color)} />
                <span className="font-medium">{m.codigo}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{m.nombre}</p>
              <p className="text-xs text-muted-foreground">{m.instructor}</p>
              <p className="text-xs mt-1">
                Grupos: {gruposStr || "—"}
                {hasConflict && (
                  <span className="text-destructive ml-1">(choque)</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
