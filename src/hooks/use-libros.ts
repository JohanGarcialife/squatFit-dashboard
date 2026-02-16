import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Libro } from "@/app/(main)/dashboard/libros/_components/schema";
import { LibrosService, CreateLibroDto } from "@/lib/services/libros-service";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const librosKeys = {
  all: ["libros"] as const,
  lists: () => [...librosKeys.all, "list"] as const,
  list: (params?: any) => [...librosKeys.lists(), params] as const,
  details: () => [...librosKeys.all, "detail"] as const,
  detail: (id: string) => [...librosKeys.details(), id] as const,
};

// ============================================================================
// QUERIES - LECTURA DE DATOS
// ============================================================================

/**
 * Hook para obtener todos los libros
 */
export function useLibros() {
  return useQuery({
    queryKey: librosKeys.list(),
    queryFn: () => LibrosService.getLibros(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener un libro específico por ID
 * @param id - ID del libro
 */
export function useLibro(id: string) {
  return useQuery({
    queryKey: librosKeys.detail(id),
    queryFn: () => LibrosService.getLibroById(id),
    enabled: !!id, // Solo ejecuta si hay ID
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// MUTATIONS - ESCRITURA DE DATOS
// ============================================================================

/**
 * Hook para crear un nuevo libro
 */
export function useCreateLibro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLibroDto) => LibrosService.createLibro(data),
    onMutate: async () => {
      // Optimistic update podría ir aquí si lo necesitas
      toast.loading("Creando libro...", { id: "create-libro" });
    },
    onSuccess: (newLibro) => {
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: librosKeys.lists() });

      // Opcional: Agregar el nuevo libro al cache
      queryClient.setQueryData(librosKeys.detail(newLibro.id), newLibro);

      toast.success("Libro creado exitosamente", { id: "create-libro" });
    },
    onError: (error: Error) => {
      console.error("Error creando libro:", error);
      toast.error(error.message || "Error al crear el libro", { id: "create-libro" });
    },
  });
}

/**
 * Hook para actualizar un libro existente
 */
export function useUpdateLibro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLibroDto> }) => LibrosService.updateLibro(id, data),
    onMutate: async ({ id }) => {
      toast.loading("Actualizando libro...", { id: `update-libro-${id}` });

      // Cancelar queries en curso para evitar conflictos
      await queryClient.cancelQueries({ queryKey: librosKeys.detail(id) });

      // Guardar snapshot del estado anterior (para rollback)
      const previousLibro = queryClient.getQueryData<Libro>(librosKeys.detail(id));

      return { previousLibro, id };
    },
    onSuccess: (updatedLibro, { id }) => {
      // Actualizar cache del libro específico
      queryClient.setQueryData(librosKeys.detail(id), updatedLibro);

      // Invalidar lista para refrescar
      queryClient.invalidateQueries({ queryKey: librosKeys.lists() });

      toast.success("Libro actualizado exitosamente", { id: `update-libro-${id}` });
    },
    onError: (error: Error, { id }, context) => {
      // Rollback en caso de error
      if (context?.previousLibro) {
        queryClient.setQueryData(librosKeys.detail(id), context.previousLibro);
      }

      console.error("Error actualizando libro:", error);
      toast.error(error.message || "Error al actualizar el libro", { id: `update-libro-${id}` });
    },
  });
}

/**
 * Hook para eliminar un libro
 */
export function useDeleteLibro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LibrosService.deleteLibro(id),
    onMutate: async (id) => {
      toast.loading("Eliminando libro...", { id: `delete-libro-${id}` });

      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: librosKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: librosKeys.lists() });

      // Guardar snapshot para rollback
      const previousLibros = queryClient.getQueryData<Libro[]>(librosKeys.lists());

      // Optimistic update: remover de la lista
      if (previousLibros) {
        queryClient.setQueryData(
          librosKeys.lists(),
          previousLibros.filter((libro) => libro.id !== id),
        );
      }

      return { previousLibros };
    },
    onSuccess: (_, id) => {
      // Remover del cache individual
      queryClient.removeQueries({ queryKey: librosKeys.detail(id) });

      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: librosKeys.lists() });

      toast.success("Libro eliminado exitosamente", { id: `delete-libro-${id}` });
    },
    onError: (error: Error, id, context) => {
      // Rollback en caso de error
      if (context?.previousLibros) {
        queryClient.setQueryData(librosKeys.lists(), context.previousLibros);
      }

      console.error("Error eliminando libro:", error);
      toast.error(error.message || "Error al eliminar el libro", { id: `delete-libro-${id}` });
    },
  });
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Hook para prefetch de un libro (útil para hover effects)
 */
export function usePrefetchLibro() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: librosKeys.detail(id),
      queryFn: () => LibrosService.getLibroById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar todas las queries de libros
 */
export function useInvalidateLibros() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: librosKeys.all });
  };
}
