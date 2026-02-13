"use client";

import { ScheduleConfigProvider as Provider } from "@/contexts/ScheduleConfigContext";

export function ScheduleConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider>{children}</Provider>;
}
