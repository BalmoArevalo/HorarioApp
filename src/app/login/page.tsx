"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      router.push("/elegir-contexto");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleContinuarSinCuenta() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      router.push("/elegir-contexto");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setMessage({
        type: "success",
        text: "Cuenta creada. Revisa tu correo para confirmar (si está habilitado) o inicia sesión.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {message && (
              <p
                className={
                  message.type === "error"
                    ? "text-sm text-destructive"
                    : "text-sm text-muted-foreground"
                }
              >
                {message.text}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="flex-1"
                >
                  Entrar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="flex-1"
                >
                  Registrarse
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={handleContinuarSinCuenta}
                disabled={loading}
                className="w-full"
              >
                Continuar sin cuenta
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground text-center">
            <Link href="/entrar" className="underline">
              Volver
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
