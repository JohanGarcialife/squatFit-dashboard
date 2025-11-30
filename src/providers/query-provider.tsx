"use client";

import { ReactNode, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Crear el QueryClient dentro del componente para evitar problemas con SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Con SSR, usualmente queremos establecer staleTime por encima de 0 para evitar refetching inmediato en el cliente
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: true,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
