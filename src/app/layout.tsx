import type { Metadata } from "next";
import "./globals.css";
import { ScheduleConfigProvider } from "@/components/ScheduleConfigProvider";

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
        <ScheduleConfigProvider>{children}</ScheduleConfigProvider>
      </body>
    </html>
  );
}
