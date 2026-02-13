export type TipoGrupo = "GT" | "GD" | "GL";

export type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado";

export interface Horario {
  dia: DiaSemana;
  horaInicio: string; // "HH:mm"
  horaFin: string;   // "HH:mm"
}

export interface Grupo {
  tipo: TipoGrupo;
  numero: number;
  salon: string;
  horarios: Horario[];
}

export interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  instructor: string;
  grupos: Grupo[];
}

export interface TimeSlot {
  inicio: string;
  fin: string;
}

/** Selección del usuario: qué materias cursar y qué grupo de cada tipo por materia */
export interface SeleccionMaterias {
  materiaIds: string[];
}

/** Por materia: GT?, GD?, GL? con el número de grupo elegido (ej. GT1 → 1) */
export interface SeleccionGrupos {
  [materiaId: string]: {
    GT?: number;
    GD?: number;
    GL?: number;
  };
}

/** Una entrada en la grilla: materia + grupo + horario + salón (para pintar celdas) */
export interface EntradaHorario {
  materiaId: string;
  codigo: string;
  tipo: TipoGrupo;
  numero: number;
  salon: string;
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

/** Conflicto entre dos o más entradas en el mismo (día, slot) */
export interface Conflicto {
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
  entradas: EntradaHorario[];
}

/** Configuración de horario: primera clase, duración y descanso (editable en Configuración) */
export interface ConfigHorario {
  primeraHora: string; // "HH:mm"
  duracionMin: number;
  descansoMin: number;
}
