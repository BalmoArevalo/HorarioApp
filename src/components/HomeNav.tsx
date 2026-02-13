"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function HomeNav() {
  const router = useRouter();
  const { isAnonymous } = useAuth();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/entrar");
    router.refresh();
  }

  if (isAnonymous) {
    return (
      <div className="mt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Cerrar sesión
      </Button>
    </div>
  );
}
