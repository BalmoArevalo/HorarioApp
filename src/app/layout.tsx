import type { Metadata } from "next";
import "./globals.css";
import { ScheduleConfigProvider } from "@/components/ScheduleConfigProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { ContextBreadcrumb } from "@/components/ContextBreadcrumb";

export const metadata: Metadata = {
  title: "Horario Universitario",
  description: "Construye tu horario universitario y evita choques",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ScheduleConfigProvider>
          <AuthProvider>
            <AuthGuard>
            <ContextBreadcrumb />
            {children}
          </AuthGuard>
          </AuthProvider>
        </ScheduleConfigProvider>
      </body>
    </html>
  );
}
