/**
 * Hooks para gestión de Recetas con React Query
 * Conectado al backend según ANALISIS_FUNCIONALIDADES_BACKEND.md
 */

import { useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Receta, FiltrosRecetas } from "@/app/(main)/dashboard/dieta/_components/schema";
import {
  getAllRecipes,
  getUserRecipes,
  createRecipe,
  uploadRecipeImage,
  duplicateRecipe,
} from "@/lib/services/recipe-service";
import { transformBackendToUI, transformUIToBackend } from "@/lib/services/recipe-types";

// Query keys para React Query
export const recipeKeys = {
  all: ["recipes"] as const,
  allRecipes: () => [...recipeKeys.all, "all"] as const,
  userRecipes: () => [...recipeKeys.all, "user"] as const,
  recipe: (id: string) => [...recipeKeys.all, "detail", id] as const,
};

/**
 * Hook para obtener todas las recetas del sistema
 * Endpoint: GET /api/v1/recipe/all
 */
export function useRecetas() {
  const query = useQuery({
    queryKey: recipeKeys.allRecipes(),
    queryFn: async () => {
      const backendRecipes = await getAllRecipes();
      // Transformar recetas del backend al formato de la UI
      return backendRecipes.map((recipe) => transformBackendToUI(recipe));
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener las recetas del usuario autenticado
 * Endpoint: GET /api/v1/recipe/by-user
 */
export function useRecetasUsuario() {
  const query = useQuery({
    queryKey: recipeKeys.userRecipes(),
    queryFn: async () => {
      const backendRecipes = await getUserRecipes();
      return backendRecipes.map((recipe) => transformBackendToUI(recipe));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obtener una receta por ID
 * Nota: Como no existe endpoint GET /api/v1/recipe/:id, se busca en la lista de todas las recetas
 */
export function useReceta(id: string | null) {
  const { data: recetas } = useRecetas();

  return useMemo(() => {
    if (!id) return null;
    return recetas.find((r) => r.id === id) ?? null;
  }, [recetas, id]);
}

/**
 * Hook para buscar recetas con filtros (lado cliente)
 * Aplica filtros sobre las recetas obtenidas del backend
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
 * Endpoint: POST /api/v1/recipe/create
 */
export function useCrearReceta() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (receta: Partial<Receta>) => {
      const payload = transformUIToBackend(receta);
      const backendRecipe = await createRecipe(payload);
      return transformBackendToUI(backendRecipe);
    },
    onSuccess: () => {
      // Invalidar las queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      toast.success("Receta creada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear receta: ${error.message}`);
    },
  });

  return {
    crearReceta: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook para subir imagen de una receta
 * Endpoint: PUT /api/v1/recipe/upload-receipe-image
 */
export function useSubirImagenReceta() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ recipeId, file }: { recipeId: string; file: File }) => {
      const backendRecipe = await uploadRecipeImage(recipeId, file);
      return transformBackendToUI(backendRecipe);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      toast.success("Imagen subida exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al subir imagen: ${error.message}`);
    },
  });

  return {
    subirImagen: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook para duplicar una receta
 * Usa el endpoint de crear con datos modificados
 */
export function useDuplicarReceta() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (recetaOriginal: Receta) => {
      // Transformar a formato backend
      const backendRecipe = {
        id: recetaOriginal.id,
        name: recetaOriginal.nombre,
        description: recetaOriginal.descripcion,
        kcal: recetaOriginal.caloriasTotal,
        carbohydrates: recetaOriginal.carbohidratosTotal,
        proteins: recetaOriginal.proteinasTotal,
        fats: recetaOriginal.grasasTotal,
        image: recetaOriginal.imagen,
      };

      const duplicated = await duplicateRecipe(backendRecipe);
      return transformBackendToUI(duplicated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      toast.success("Receta duplicada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al duplicar receta: ${error.message}`);
    },
  });

  return {
    duplicarReceta: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
