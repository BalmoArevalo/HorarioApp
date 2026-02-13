import type { Materia, SeleccionMaterias, SeleccionGrupos, ConfigHorario } from "@/types/horario";

export async function getData(): Promise<{
  materias: Materia[];
  seleccionMaterias: SeleccionMaterias;
  seleccionGrupos: SeleccionGrupos;
  config?: ConfigHorario;
}> {
  if (typeof window === "undefined") {
    return {
      materias: [],
      seleccionMaterias: { materiaIds: [] },
      seleccionGrupos: {},
    };
  }
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch {
    return {
      materias: [],
      seleccionMaterias: { materiaIds: [] },
      seleccionGrupos: {},
    };
  }
}

async function patchData(partial: {
  materias?: Materia[];
  seleccionMaterias?: SeleccionMaterias;
  seleccionGrupos?: SeleccionGrupos;
  config?: ConfigHorario;
}): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
  } catch {
    // ignore
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
  await patchData({ config } as Parameters<typeof patchData>[0]);
}
