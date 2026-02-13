import type { Materia, SeleccionMaterias, SeleccionGrupos, ConfigHorario } from "@/types/horario";
import { supabase } from "@/lib/supabase";
import { DEFAULT_CARRERA_ID } from "@/lib/constants";

const DEFAULT_CONFIG: ConfigHorario = {
  primeraHora: "06:20",
  duracionMin: 100,
  descansoMin: 5,
};

const EMPTY_DATA = {
  materias: [] as Materia[],
  seleccionMaterias: { materiaIds: [] } as SeleccionMaterias,
  seleccionGrupos: {} as SeleccionGrupos,
  config: DEFAULT_CONFIG,
};

async function getUserIdAndCarrera(): Promise<{ userId: string; carreraId: string } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: uc } = await supabase
    .from("user_carrera")
    .select("carrera_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const carreraId = uc?.carrera_id ?? DEFAULT_CARRERA_ID;
  return { userId: user.id, carreraId };
}

function rowToMateria(row: {
  id: string;
  codigo: string;
  nombre: string;
  instructor: string | null;
  grupos: unknown;
}): Materia {
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    instructor: row.instructor ?? "",
    grupos: Array.isArray(row.grupos) ? row.grupos : [],
  };
}

export async function getData(): Promise<{
  materias: Materia[];
  seleccionMaterias: SeleccionMaterias;
  seleccionGrupos: SeleccionGrupos;
  config?: ConfigHorario;
}> {
  if (typeof window === "undefined") return EMPTY_DATA;
  const ctx = await getUserIdAndCarrera();
  if (!ctx) return EMPTY_DATA;

  const { carreraId, userId } = ctx;

  const [materiasRes, horarioRes, carreraRes] = await Promise.all([
    supabase.from("materias").select("id, codigo, nombre, instructor, grupos").eq("carrera_id", carreraId).order("codigo"),
    supabase.from("user_horario").select("materia_ids, seleccion_grupos, config_override").eq("user_id", userId).maybeSingle(),
    supabase.from("carreras").select("primera_hora, duracion_min, descanso_min").eq("id", carreraId).single(),
  ]);

  const materias: Materia[] = (materiasRes.data ?? []).map(rowToMateria);
  const row = horarioRes.data;
  const carrera = carreraRes.data;

  const config: ConfigHorario = row?.config_override
    ? {
        primeraHora: (row.config_override as ConfigHorario).primeraHora ?? carrera?.primera_hora ?? DEFAULT_CONFIG.primeraHora,
        duracionMin: (row.config_override as ConfigHorario).duracionMin ?? carrera?.duracion_min ?? DEFAULT_CONFIG.duracionMin,
        descansoMin: (row.config_override as ConfigHorario).descansoMin ?? carrera?.descanso_min ?? DEFAULT_CONFIG.descansoMin,
      }
    : {
        primeraHora: carrera?.primera_hora ?? DEFAULT_CONFIG.primeraHora,
        duracionMin: carrera?.duracion_min ?? DEFAULT_CONFIG.duracionMin,
        descansoMin: carrera?.descanso_min ?? DEFAULT_CONFIG.descansoMin,
      };

  return {
    materias,
    seleccionMaterias: {
      materiaIds: (row?.materia_ids ?? []).map((id: string) => String(id)),
    },
    seleccionGrupos: (row?.seleccion_grupos as SeleccionGrupos) ?? {},
    config,
  };
}

async function patchData(partial: {
  materias?: Materia[];
  seleccionMaterias?: SeleccionMaterias;
  seleccionGrupos?: SeleccionGrupos;
  config?: ConfigHorario;
}): Promise<void> {
  if (typeof window === "undefined") return;
  const ctx = await getUserIdAndCarrera();
  if (!ctx) return;

  const { userId, carreraId } = ctx;

  if (partial.materias !== undefined) {
    for (const m of partial.materias) {
      const { error } = await supabase
        .from("materias")
        .upsert(
          {
            id: m.id,
            carrera_id: carreraId,
            codigo: m.codigo,
            nombre: m.nombre,
            instructor: m.instructor || "",
            grupos: m.grupos,
          },
          { onConflict: "id" }
        );
      if (error) throw error;
    }
  }

  const updates: {
    materia_ids?: string[];
    seleccion_grupos?: SeleccionGrupos;
    config_override?: ConfigHorario | null;
  } = {};
  if (partial.seleccionMaterias !== undefined)
    updates.materia_ids = partial.seleccionMaterias.materiaIds;
  if (partial.seleccionGrupos !== undefined)
    updates.seleccion_grupos = partial.seleccionGrupos;
  if (partial.config !== undefined) updates.config_override = partial.config;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("user_horario").upsert(
      {
        user_id: userId,
        carrera_id: carreraId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
  }
}

export async function getMaterias(): Promise<Materia[]> {
  const data = await getData();
  return data.materias;
}

export async function setMaterias(materias: Materia[]): Promise<void> {
  await patchData({ materias });
}

export async function getSeleccionMaterias(): Promise<SeleccionMaterias> {
  const data = await getData();
  return data.seleccionMaterias;
}

export async function setSeleccionMaterias(seleccion: SeleccionMaterias): Promise<void> {
  await patchData({ seleccionMaterias: seleccion });
}

export async function getSeleccionGrupos(): Promise<SeleccionGrupos> {
  const data = await getData();
  return data.seleccionGrupos;
}

export async function setSeleccionGrupos(grupos: SeleccionGrupos): Promise<void> {
  await patchData({ seleccionGrupos: grupos });
}

export async function getConfig(): Promise<ConfigHorario | null> {
  try {
    const data = await getData();
    return data.config ?? null;
  } catch {
    return null;
  }
}

export async function setConfig(config: ConfigHorario): Promise<void> {
  await patchData({ config });
}
