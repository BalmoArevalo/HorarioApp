"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMaterias, setMaterias } from "@/lib/storage";
import type { Materia } from "@/types/horario";
import { useAuth } from "@/contexts/AuthContext";
import { MateriaForm } from "@/components/forms/MateriaForm";

export default function NuevaMateriaPage() {
  const router = useRouter();
  const { isAnonymous } = useAuth();

  useEffect(() => {
    if (isAnonymous) router.replace("/materias");
  }, [isAnonymous, router]);

  async function onSubmit(m: Materia) {
    const list = await getMaterias();
    await setMaterias([...list, m]);
    router.push("/materias");
  }

  return (
    <main className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Nueva materia</h1>
      <MateriaForm
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
