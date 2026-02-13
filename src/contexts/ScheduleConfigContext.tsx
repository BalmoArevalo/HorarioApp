"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { ConfigHorario } from "@/types/horario";
import type { TimeSlot } from "@/types/horario";
import { getConfig, setConfig as saveConfig } from "@/lib/storage";
import {
  DEFAULT_CONFIG,
  generarSlotsConConfig,
  TIME_SLOTS,
} from "@/lib/schedule-utils";

type ScheduleConfigContextValue = {
  /** Slots del día según la config actual (o por defecto mientras carga). */
  timeSlots: TimeSlot[];
  /** Config actual (null mientras carga, luego el guardado o default). */
  config: ConfigHorario | null;
  /** Guarda la config y actualiza timeSlots. */
  setConfig: (config: ConfigHorario) => Promise<void>;
  /** Vuelve a cargar config desde el servidor. */
  refetch: () => Promise<void>;
  loading: boolean;
};

const ScheduleConfigContext = createContext<ScheduleConfigContextValue | null>(
  null
);

export function ScheduleConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<ConfigHorario | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const c = await getConfig();
      setConfigState(c ?? DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const setConfig = useCallback(
    async (newConfig: ConfigHorario) => {
      await saveConfig(newConfig);
      setConfigState(newConfig);
    },
    []
  );

  const timeSlots = useMemo(() => {
    if (!config) return TIME_SLOTS;
    return generarSlotsConConfig(config);
  }, [config]);

  const value = useMemo<ScheduleConfigContextValue>(
    () => ({
      timeSlots,
      config,
      setConfig,
      refetch,
      loading,
    }),
    [timeSlots, config, setConfig, refetch, loading]
  );

  return (
    <ScheduleConfigContext.Provider value={value}>
      {children}
    </ScheduleConfigContext.Provider>
  );
}

export function useScheduleConfig(): ScheduleConfigContextValue {
  const ctx = useContext(ScheduleConfigContext);
  if (!ctx) {
    return {
      timeSlots: TIME_SLOTS,
      config: DEFAULT_CONFIG,
      setConfig: async () => {},
      refetch: async () => {},
      loading: false,
    };
  }
  return ctx;
}
