import type {
  TimeSlot,
  DiaSemana,
  EntradaHorario,
  Conflicto,
  Materia,
  SeleccionGrupos,
  TipoGrupo,
  ConfigHorario,
} from "@/types/horario";
import { buildEntradas } from "@/lib/horario-build";

const DEFAULT_DURACION_MIN = 100; // 1:40 = 100 min
const DEFAULT_DESCANSO_MIN = 5;
const DEFAULT_PRIMERA_HORA = "06:20";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** Config por defecto (cuando no hay config guardada) */
export const DEFAULT_CONFIG: ConfigHorario = {
  primeraHora: DEFAULT_PRIMERA_HORA,
  duracionMin: DEFAULT_DURACION_MIN,
  descansoMin: DEFAULT_DESCANSO_MIN,
};

/** Genera los slots del día según la configuración (primera hora, duración, descanso). */
export function generarSlotsConConfig(config: ConfigHorario): TimeSlot[] {
  const [h, m] = config.primeraHora.split(":").map(Number);
  const slots: TimeSlot[] = [];
  let min = h * 60 + m;
  const finDia = 22 * 60; // 22:00

  while (min + config.duracionMin <= finDia) {
    const inicio = `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
    min += config.duracionMin;
    const fin = `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
    min += config.descansoMin;
    slots.push({ inicio, fin });
  }
  return slots;
}

/** Genera los slots con valores por defecto (06:20, 100 min, 5 min). */
export function generarSlots(): TimeSlot[] {
  return generarSlotsConConfig(DEFAULT_CONFIG);
}

export const TIME_SLOTS = generarSlots();

export const DIAS: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/** Convierte "HH:mm" a minutos desde medianoche */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Agrupa entradas por (dia, horaInicio, horaFin) y detecta conflictos */
export function detectarChoques(entradas: EntradaHorario[]): Conflicto[] {
  const byKey = new Map<string, EntradaHorario[]>();

  for (const e of entradas) {
    const key = `${e.dia}|${e.horaInicio}|${e.horaFin}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(e);
  }

  const conflictos: Conflicto[] = [];
  for (const [, list] of byKey) {
    if (list.length > 1) {
      conflictos.push({
        dia: list[0].dia,
        horaInicio: list[0].horaInicio,
        horaFin: list[0].horaFin,
        entradas: list,
      });
    }
  }
  return conflictos;
}

/** Indica si una entrada está en algún conflicto */
export function esEntradaEnConflicto(
  entrada: EntradaHorario,
  conflictos: Conflicto[]
): boolean {
  return conflictos.some(
    (c) =>
      c.dia === entrada.dia &&
      c.horaInicio === entrada.horaInicio &&
      c.horaFin === entrada.horaFin
  );
}

/** Valida que (horaInicio, horaFin) coincida con algún slot de la lista (por defecto TIME_SLOTS). */
export function esSlotValido(
  horaInicio: string,
  horaFin: string,
  slots: TimeSlot[] = TIME_SLOTS
): boolean {
  return slots.some((s) => s.inicio === horaInicio && s.fin === horaFin);
}

/** Indica si elegir ese grupo (materiaId, tipo, numero) causa al menos un choque con otras entradas */
export function grupoCausaChoque(
  materias: Materia[],
  materiaIds: string[],
  seleccionGrupos: SeleccionGrupos,
  materiaId: string,
  tipo: TipoGrupo,
  numero: number
): boolean {
  const selMod = {
    ...seleccionGrupos,
    [materiaId]: { ...(seleccionGrupos[materiaId] ?? {}), [tipo]: numero },
  };
  const entradas = buildEntradas(materias, materiaIds, selMod);
  const conflictos = detectarChoques(entradas);
  return conflictos.some((c) =>
    c.entradas.some(
      (e) =>
        e.materiaId === materiaId && e.tipo === tipo && e.numero === numero
    )
  );
}
