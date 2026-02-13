"use client";

import type { EntradaHorario, Conflicto, DiaSemana } from "@/types/horario";
import { esEntradaEnConflicto } from "@/lib/schedule-utils";
import { useScheduleConfig } from "@/contexts/ScheduleConfigContext";
import { cn } from "@/lib/utils";

const DIAS_GRID: DiaSemana[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

type Props = {
  entradas: EntradaHorario[];
  conflictos: Conflicto[];
  colorByMateriaId: Record<string, string>;
};

export function ScheduleGrid({ entradas, conflictos, colorByMateriaId }: Props) {
  const { timeSlots } = useScheduleConfig();
  const byCell = new Map<string, EntradaHorario[]>();
  for (const e of entradas) {
    const key = `${e.dia}|${e.horaInicio}|${e.horaFin}`;
    if (!byCell.has(key)) byCell.set(key, []);
    byCell.get(key)!.push(e);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-border bg-muted/50 p-2 text-left font-medium w-24">
              Hora
            </th>
            {DIAS_GRID.map((d) => (
              <th
                key={d}
                className="border border-border bg-muted/50 p-2 text-center font-medium min-w-[120px]"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.inicio}>
              <td className="border border-border p-1 text-muted-foreground text-xs whitespace-nowrap">
                {slot.inicio} - {slot.fin}
              </td>
              {DIAS_GRID.map((dia) => {
                const cellKey = `${dia}|${slot.inicio}|${slot.fin}`;
                const list = byCell.get(cellKey) ?? [];
                const hasConflict = list.length > 1 || list.some((e) => esEntradaEnConflicto(e, conflictos));
                return (
                  <td
                    key={dia}
                    className={cn(
                      "border border-border p-1 align-top min-h-[60px]",
                      hasConflict && "bg-destructive/15"
                    )}
                  >
                    {list.map((e) => {
                      const color = colorByMateriaId[e.materiaId] ?? "bg-muted";
                      return (
                        <div
                          key={`${e.materiaId}-${e.tipo}-${e.numero}-${e.dia}-${e.horaInicio}`}
                          className={cn(
                            "rounded px-1 py-0.5 text-xs font-medium",
                            "text-gray-900 dark:text-white",
                            color,
                            hasConflict && "ring-1 ring-destructive"
                          )}
                        >
                          {e.codigo} {e.tipo}{e.numero} {e.salon}
                        </div>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
