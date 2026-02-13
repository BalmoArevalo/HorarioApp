import type {
  Materia,
  EntradaHorario,
  SeleccionGrupos,
  TipoGrupo,
} from "@/types/horario";

/** Dado materias seleccionadas y selección de grupos, construye las entradas para la grilla */
export function buildEntradas(
  materias: Materia[],
  materiaIds: string[],
  seleccionGrupos: SeleccionGrupos
): EntradaHorario[] {
  const entradas: EntradaHorario[] = [];
  const map = new Map(materias.map((m) => [m.id, m]));

  for (const id of materiaIds) {
    const m = map.get(id);
    if (!m) continue;

    const sel = seleccionGrupos[id] ?? {};
    const tipos: TipoGrupo[] = ["GT", "GD", "GL"];

    for (const tipo of tipos) {
      const num = sel[tipo];
      if (num == null) continue;
      const grupo = m.grupos.find((g) => g.tipo === tipo && g.numero === num);
      if (!grupo) continue;
      for (const h of grupo.horarios) {
        entradas.push({
          materiaId: m.id,
          codigo: m.codigo,
          tipo: grupo.tipo,
          numero: grupo.numero,
          salon: grupo.salon,
          dia: h.dia,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
        });
      }
    }
  }
  return entradas;
}

/** Propuesta por defecto: primer grupo de cada tipo por materia */
export function propuestaPorDefecto(materias: Materia[], materiaIds: string[]): SeleccionGrupos {
  const out: SeleccionGrupos = {};
  const map = new Map(materias.map((m) => [m.id, m]));

  for (const id of materiaIds) {
    const m = map.get(id);
    if (!m) continue;
    const sel: { GT?: number; GD?: number; GL?: number } = {};
    for (const g of m.grupos) {
      if (g.tipo === "GT" && sel.GT == null) sel.GT = g.numero;
      if (g.tipo === "GD" && sel.GD == null) sel.GD = g.numero;
      if (g.tipo === "GL" && sel.GL == null) sel.GL = g.numero;
    }
    if (sel.GT != null) out[id] = sel;
  }
  return out;
}
