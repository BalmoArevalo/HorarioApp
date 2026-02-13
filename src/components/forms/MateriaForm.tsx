"use client";

import { useState, useMemo } from "react";
import type { Materia, Grupo, Horario, TipoGrupo, DiaSemana, EntradaHorario, TimeSlot } from "@/types/horario";
import { DIAS, esSlotValido, detectarChoques } from "@/lib/schedule-utils";
import { useScheduleConfig } from "@/contexts/ScheduleConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";

function buildEntradasPreview(codigo: string, grupos: Grupo[]): EntradaHorario[] {
  const entradas: EntradaHorario[] = [];
  for (const g of grupos) {
    for (const h of g.horarios) {
      entradas.push({
        materiaId: "preview",
        codigo: codigo || "…",
        tipo: g.tipo,
        numero: g.numero,
        salon: g.salon,
        dia: h.dia,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
      });
    }
  }
  return entradas;
}

type GruposSectionProps = {
  titulo: string;
  tipo: TipoGrupo;
  grupos: Grupo[];
  timeSlots: TimeSlot[];
  addGrupo: () => void;
  removeGrupo: (i: number) => void;
  updateGrupo: (i: number, upd: Partial<Grupo>) => void;
  addHorario: (grupoIdx: number) => void;
  removeHorario: (grupoIdx: number, horarioIdx: number) => void;
  updateHorario: (grupoIdx: number, horarioIdx: number, upd: Partial<Horario>) => void;
};

function GruposSection({
  titulo,
  tipo,
  grupos,
  timeSlots,
  addGrupo,
  removeGrupo,
  updateGrupo,
  addHorario,
  removeHorario,
  updateHorario,
}: GruposSectionProps) {
  const filtered = grupos.filter((g) => g.tipo === tipo);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <Button type="button" variant="outline" size="sm" onClick={addGrupo}>
          <Plus className="size-4" />
          Añadir grupo {tipo}
        </Button>
      </div>
      {filtered.map((g) => {
        const gi = grupos.findIndex((x) => x === g);
        return (
          <Card key={gi}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{tipo}</span>
                <Input
                  type="number"
                  min={1}
                  className="w-16"
                  value={g.numero}
                  onChange={(e) =>
                    updateGrupo(gi, { numero: parseInt(e.target.value, 10) || 1 })
                  }
                />
                <Input
                  placeholder="Salón"
                  className="w-24"
                  value={g.salon}
                  onChange={(e) => updateGrupo(gi, { salon: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGrupo(gi)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Horarios (día + slot)
              </Label>
              {g.horarios.map((h, hi) => (
                <div key={hi} className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={h.dia}
                    onValueChange={(v) =>
                      updateHorario(gi, hi, { dia: v as DiaSemana })
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={`${h.horaInicio}-${h.horaFin}`}
                    onValueChange={(v) => {
                      const [inicio, fin] = v.split("-");
                      updateHorario(gi, hi, { horaInicio: inicio, horaFin: fin });
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((s) => (
                        <SelectItem key={s.inicio} value={`${s.inicio}-${s.fin}`}>
                          {s.inicio} - {s.fin}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHorario(gi, hi)}
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addHorario(gi)}
              >
                <Plus className="size-4" />
                Añadir horario
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

type SchedulePreviewProps = { codigo: string; grupos: Grupo[] };

function SchedulePreview({ codigo, grupos }: SchedulePreviewProps) {
  const entradas = useMemo(
    () => buildEntradasPreview(codigo, grupos),
    [codigo, grupos]
  );
  const conflictos = useMemo(() => detectarChoques(entradas), [entradas]);
  const colorByMateriaId = { preview: "bg-sky-200 dark:bg-sky-900/50" };

  if (entradas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Añade grupos y horarios para ver la vista previa.
      </p>
    );
  }

  return (
    <>
      {conflictos.length > 0 && (
        <p className="text-sm text-destructive mb-2">
          Hay choques de horario en esta materia.
        </p>
      )}
      <ScheduleGrid
        entradas={entradas}
        conflictos={conflictos}
        colorByMateriaId={colorByMateriaId}
      />
    </>
  );
}

const emptyHorario = (primerSlot: { inicio: string; fin: string }): Horario => ({
  dia: "Lunes",
  horaInicio: primerSlot.inicio,
  horaFin: primerSlot.fin,
});

const emptyGrupo = (
  tipo: TipoGrupo,
  numero: number,
  primerSlot: { inicio: string; fin: string }
): Grupo => ({
  tipo,
  numero,
  salon: "",
  horarios: [emptyHorario(primerSlot)],
});

type Props = {
  materia?: Materia | null;
  onSubmit: (m: Materia) => void;
  onCancel: () => void;
};

export function MateriaForm({ materia, onSubmit, onCancel }: Props) {
  const { timeSlots } = useScheduleConfig();
  const [codigo, setCodigo] = useState(materia?.codigo ?? "");
  const [nombre, setNombre] = useState(materia?.nombre ?? "");
  const [instructor, setInstructor] = useState(materia?.instructor ?? "");
  const primerSlot = timeSlots[0] ?? { inicio: "06:20", fin: "08:00" };
  const [grupos, setGrupos] = useState<Grupo[]>(
    materia?.grupos?.length
      ? materia.grupos
      : [emptyGrupo("GT", 1, primerSlot)]
  );

  function addGrupo(tipo: TipoGrupo) {
    const maxNum = Math.max(0, ...grupos.filter((g) => g.tipo === tipo).map((g) => g.numero));
    setGrupos([...grupos, emptyGrupo(tipo, maxNum + 1, primerSlot)]);
  }

  function removeGrupo(i: number) {
    setGrupos(grupos.filter((_, idx) => idx !== i));
  }

  function updateGrupo(i: number, upd: Partial<Grupo>) {
    setGrupos(
      grupos.map((g, idx) => (idx === i ? { ...g, ...upd } : g))
    );
  }

  function addHorario(grupoIdx: number) {
    setGrupos(
      grupos.map((g, i) =>
        i === grupoIdx
          ? { ...g, horarios: [...g.horarios, emptyHorario(primerSlot)] }
          : g
      )
    );
  }

  function removeHorario(grupoIdx: number, horarioIdx: number) {
    setGrupos(
      grupos.map((g, i) =>
        i === grupoIdx
          ? {
              ...g,
              horarios: g.horarios.filter((_, hi) => hi !== horarioIdx),
            }
          : g
      )
    );
  }

  function updateHorario(
    grupoIdx: number,
    horarioIdx: number,
    upd: Partial<Horario>
  ) {
    setGrupos(
      grupos.map((g, i) =>
        i === grupoIdx
          ? {
              ...g,
              horarios: g.horarios.map((h, hi) =>
                hi === horarioIdx ? { ...h, ...upd } : h
              ),
            }
          : g
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) return;

    const hasGT = grupos.some((g) => g.tipo === "GT");
    if (!hasGT) {
      alert("Debe haber al menos un grupo teórico (GT).");
      return;
    }

    for (const g of grupos) {
      if (!g.salon.trim()) {
        alert(`Grupo ${g.tipo}${g.numero}: falta el salón.`);
        return;
      }
      for (const h of g.horarios) {
        if (!esSlotValido(h.horaInicio, h.horaFin, timeSlots)) {
          alert(
            `Grupo ${g.tipo}${g.numero}: horario ${h.dia} ${h.horaInicio}-${h.horaFin} no es un slot válido.`
          );
          return;
        }
      }
    }

    const id = materia?.id ?? crypto.randomUUID();
    onSubmit({
      id,
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      instructor: instructor.trim(),
      grupos,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Datos de la materia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="ej. ARC, MIP"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="ej. Arquitectura de computadoras"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="ej. Ing. Boris Alexander"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        <div className="space-y-6">
          <GruposSection
            titulo="Grupos teóricos (GT)"
            tipo="GT"
            grupos={grupos}
            timeSlots={timeSlots}
            addGrupo={() => addGrupo("GT")}
            removeGrupo={removeGrupo}
            updateGrupo={updateGrupo}
            addHorario={addHorario}
            removeHorario={removeHorario}
            updateHorario={updateHorario}
          />
          <GruposSection
            titulo="Grupos de discusión (GD)"
            tipo="GD"
            grupos={grupos}
            timeSlots={timeSlots}
            addGrupo={() => addGrupo("GD")}
            removeGrupo={removeGrupo}
            updateGrupo={updateGrupo}
            addHorario={addHorario}
            removeHorario={removeHorario}
            updateHorario={updateHorario}
          />
          <GruposSection
            titulo="Grupos de laboratorio (GL)"
            tipo="GL"
            grupos={grupos}
            timeSlots={timeSlots}
            addGrupo={() => addGrupo("GL")}
            removeGrupo={removeGrupo}
            updateGrupo={updateGrupo}
            addHorario={addHorario}
            removeHorario={removeHorario}
            updateHorario={updateHorario}
          />
        </div>

        <Card className="lg:sticky lg:top-4 h-fit">
          <CardHeader>
            <CardTitle>Vista previa del horario</CardTitle>
            <p className="text-sm text-muted-foreground">
              Previsualiza cómo queda el horario según los grupos añadidos.
            </p>
          </CardHeader>
          <CardContent>
            <SchedulePreview codigo={codigo} grupos={grupos} />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mt-6">
        <Button type="submit">Guardar materia</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
