import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Materia, SeleccionMaterias, SeleccionGrupos, ConfigHorario } from "@/types/horario";

interface HorarioData {
  materias: Materia[];
  seleccionMaterias: SeleccionMaterias;
  seleccionGrupos: SeleccionGrupos;
  config?: ConfigHorario;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "horario.json");

const DEFAULT_CONFIG: ConfigHorario = {
  primeraHora: "06:20",
  duracionMin: 100,
  descansoMin: 5,
};

const DEFAULT_DATA: HorarioData = {
  materias: [],
  seleccionMaterias: { materiaIds: [] },
  seleccionGrupos: {},
  config: DEFAULT_CONFIG,
};

async function readData(): Promise<HorarioData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<HorarioData>;
    return {
      materias: parsed.materias ?? DEFAULT_DATA.materias,
      seleccionMaterias: parsed.seleccionMaterias ?? DEFAULT_DATA.seleccionMaterias,
      seleccionGrupos: parsed.seleccionGrupos ?? DEFAULT_DATA.seleccionGrupos,
      config: parsed.config ? { ...DEFAULT_CONFIG, ...parsed.config } : DEFAULT_CONFIG,
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

async function writeData(data: HorarioData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error reading data:", err);
    return NextResponse.json(
      { error: "Error al leer datos" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<HorarioData>;
    const current = await readData();

    const next: HorarioData = {
      materias: body.materias ?? current.materias,
      seleccionMaterias: body.seleccionMaterias ?? current.seleccionMaterias,
      seleccionGrupos: body.seleccionGrupos ?? current.seleccionGrupos,
      config: body.config !== undefined ? { ...DEFAULT_CONFIG, ...body.config } : current.config,
    };

    await writeData(next);
    return NextResponse.json(next);
  } catch (err) {
    console.error("Error writing data:", err);
    return NextResponse.json(
      { error: "Error al guardar datos" },
      { status: 500 }
    );
  }
}
