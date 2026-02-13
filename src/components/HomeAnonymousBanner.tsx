"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function HomeAnonymousBanner() {
  const { isAnonymous } = useAuth();
  if (!isAnonymous) return null;
  return (
    <p className="text-sm text-muted-foreground text-center max-w-md">
      Regístrate para editar materias y modificar la configuración del horario.{" "}
      <Button variant="link" className="p-0 h-auto text-primary" asChild>
        <Link href="/login">Iniciar sesión</Link>
      </Button>
    </p>
  );
}
