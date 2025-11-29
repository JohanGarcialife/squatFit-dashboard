/**
 * Hooks para gestión de Recetas
 */

import { useState, useCallback, useMemo } from "react";

import { recetasData } from "@/app/(main)/dashboard/dieta/_components/data";
import { Receta, FiltrosRecetas } from "@/app/(main)/dashboard/dieta/_components/schema";

/**
 * Hook para obtener todas las recetas
 */
export function useRecetas() {
  const data = recetasData;
  const isLoading = false;
  const isError = false;
  const error = null;

  return { data: data ?? [], isLoading, isError, error };
}

/**
 * Hook para obtener una receta por ID
 */
export function useReceta(id: string | null) {
  const { data: recetas } = useRecetas();

  return useMemo(() => {
    if (!id) return null;
    return recetas.find((r) => r.id === id) ?? null;
  }, [recetas, id]);
}

/**
 * Hook para buscar recetas con filtros
 */
export function useRecetasFiltradas(filtros: FiltrosRecetas) {
  const { data: recetas } = useRecetas();

  const recetasFiltradas = useMemo(() => {
    const resultado = recetas.filter((receta) => {
      const matchBusqueda =
        !filtros.busqueda ||
        receta.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        receta.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase());

      const matchTipo = !filtros.tipoComida?.length || filtros.tipoComida.includes(receta.tipoComida);
      const matchEtiquetas = !filtros.etiquetas?.length || filtros.etiquetas.some((e) => receta.etiquetas.includes(e));
      const matchTiempo = !filtros.tiempoMax || receta.tiempoPreparacion <= filtros.tiempoMax;
      const matchEstado = !filtros.estado?.length || filtros.estado.includes(receta.estado);

      return matchBusqueda && matchTipo && matchEtiquetas && matchTiempo && matchEstado;
    });

    if (filtros.ordenarPor) {
      resultado.sort((a, b) => {
        let valorA: number | string;
        let valorB: number | string;

        switch (filtros.ordenarPor) {
          case "proteinas":
            valorA = a.proteinasPorcion;
            valorB = b.proteinasPorcion;
            break;
          case "calorias":
            valorA = a.caloriasPorcion;
            valorB = b.caloriasPorcion;
            break;
          case "tiempo":
            valorA = a.tiempoPreparacion;
            valorB = b.tiempoPreparacion;
            break;
          case "nombre":
            return filtros.ordenDireccion === "asc"
              ? a.nombre.localeCompare(b.nombre)
              : b.nombre.localeCompare(a.nombre);
          default:
            return 0;
        }

        return filtros.ordenDireccion === "asc" ? valorA - valorB : valorB - valorA;
      });
    }

    return resultado;
  }, [recetas, filtros]);

  return recetasFiltradas;
}

/**
 * Hook para crear una receta
 */
export function useCrearReceta() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const crearReceta = useCallback(async (receta: Omit<Receta, "id" | "createdAt">) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Creando receta:", receta);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ...receta,
        id: `rec-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { crearReceta, isLoading, error };
}

/**
 * Hook para duplicar una receta
 */
export function useDuplicarReceta() {
  const { crearReceta, isLoading, error } = useCrearReceta();

  const duplicarReceta = useCallback(
    async (recetaOriginal: Receta) => {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...datos } = recetaOriginal;
      return crearReceta({
        ...datos,
        nombre: `${datos.nombre} (copia)`,
        estado: "borrador",
      });
    },
    [crearReceta],
  );

  return { duplicarReceta, isLoading, error };
}
