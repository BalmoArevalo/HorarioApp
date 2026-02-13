"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMaterias, setMaterias } from "@/lib/storage";
import type { Materia } from "@/types/horario";
import { MateriaForm } from "@/components/forms/MateriaForm";

export default function EditarMateriaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [materia, setMateria] = useState<Materia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaterias().then((list) => {
      const m = list.find((x) => x.id === id) ?? null;
      setMateria(m);
      setLoading(false);
    });
  }, [id]);

  async function onSubmit(updated: Materia) {
    const list = await getMaterias();
    await setMaterias(
      list.map((m) => (m.id === updated.id ? updated : m))
    );
    router.push("/materias");
  }

  if (loading) {
    return (
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <p className="text-muted-foreground">Cargando…</p>
        <Link href="/materias" className="text-primary underline mt-2 inline-block">
          Volver a materias
        </Link>
      </main>
    );
  }

  if (materia === null) {
    return (
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <p className="text-muted-foreground">Materia no encontrada.</p>
        <Link href="/materias" className="text-primary underline mt-2 inline-block">
          Volver a materias
        </Link>
      </main>
    );
  }

  return (
    <main className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Editar materia</h1>
      <MateriaForm
        materia={materia}
        onSubmit={onSubmit}
        onCancel={() => router.push("/materias")}
      />
      <p className="mt-4">
        <Link href="/materias" className="text-muted-foreground hover:text-foreground">
          ← Volver a materias
        </Link>
      </p>
    </main>
  );
}
