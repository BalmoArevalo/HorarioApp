import Link from "next/link";
import { HomeNav } from "@/components/HomeNav";
import { HomeAnonymousBanner } from "@/components/HomeAnonymousBanner";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-3xl font-bold">Horario Universitario</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Registra materias, elige las que cursarás y genera una propuesta de horario sin choques.
      </p>
      <HomeAnonymousBanner />
      <nav className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/materias"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Materias
        </Link>
        <Link
          href="/horario"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Ver horario
        </Link>
        <Link
          href="/configuracion"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Configuración
        </Link>
      </nav>
      <HomeNav />
    </main>
  );
}
