import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { 
  CursosService, 
  CreateCursoDto, 
  GetCursosParams 
} from "@/lib/services/cursos-service";
import { Curso } from "@/app/(main)/dashboard/cursos/_components/schema";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const cursosKeys = {
  all: ["cursos"] as const,
  lists: () => [...cursosKeys.all, "list"] as const,
  list: (params?: GetCursosParams) => [...cursosKeys.lists(), params] as const,
  details: () => [...cursosKeys.all, "detail"] as const,
  detail: (id: string) => [...cursosKeys.details(), id] as const,
};

// ============================================================================
// QUERIES - LECTURA DE DATOS
// ============================================================================

/**
 * Hook para obtener todos los cursos
 * @param params - Parámetros de filtrado (opcional)
 */
export function useCursos(params?: GetCursosParams) {
  return useQuery({
    queryKey: cursosKeys.list(params),
    queryFn: () => CursosService.getCursos(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener un curso específico por ID
 * @param id - ID del curso
 */
export function useCurso(id: string) {
  return useQuery({
    queryKey: cursosKeys.detail(id),
    queryFn: () => CursosService.getCursoById(id),
    enabled: !!id, // Solo ejecuta si hay ID
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// MUTATIONS - ESCRITURA DE DATOS
// ============================================================================

/**
 * Hook para crear un nuevo curso
 */
export function useCreateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCursoDto) => CursosService.createCurso(data),
    onMutate: async () => {
      // Optimistic update podría ir aquí si lo necesitas
      toast.loading("Creando curso...", { id: "create-curso" });
    },
    onSuccess: (newCurso) => {
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: cursosKeys.lists() });
      
      // Opcional: Agregar el nuevo curso al cache
      queryClient.setQueryData(cursosKeys.detail(newCurso.id), newCurso);
      
      toast.success("Curso creado exitosamente", { id: "create-curso" });
    },
    onError: (error: Error) => {
      console.error("Error creando curso:", error);
      toast.error(error.message || "Error al crear el curso", { id: "create-curso" });
    },
  });
}

/**
 * Hook para actualizar un curso existente
 */
export function useUpdateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCursoDto> }) =>
      CursosService.updateCurso(id, data),
    onMutate: async ({ id }) => {
      toast.loading("Actualizando curso...", { id: `update-curso-${id}` });
      
      // Cancelar queries en curso para evitar conflictos
      await queryClient.cancelQueries({ queryKey: cursosKeys.detail(id) });
      
      // Guardar snapshot del estado anterior (para rollback)
      const previousCurso = queryClient.getQueryData<Curso>(cursosKeys.detail(id));
      
      return { previousCurso, id };
    },
    onSuccess: (updatedCurso, { id }) => {
      // Actualizar cache del curso específico
      queryClient.setQueryData(cursosKeys.detail(id), updatedCurso);
      
      // Invalidar lista para refrescar
      queryClient.invalidateQueries({ queryKey: cursosKeys.lists() });
      
      toast.success("Curso actualizado exitosamente", { id: `update-curso-${id}` });
    },
    onError: (error: Error, { id }, context) => {
      // Rollback en caso de error
      if (context?.previousCurso) {
        queryClient.setQueryData(cursosKeys.detail(id), context.previousCurso);
      }
      
      console.error("Error actualizando curso:", error);
      toast.error(error.message || "Error al actualizar el curso", { id: `update-curso-${id}` });
    },
  });
}

/**
 * Hook para eliminar un curso
 */
export function useDeleteCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CursosService.deleteCurso(id),
    onMutate: async (id) => {
      toast.loading("Eliminando curso...", { id: `delete-curso-${id}` });
      
      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: cursosKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: cursosKeys.lists() });
      
      // Guardar snapshot para rollback
      const previousCursos = queryClient.getQueryData<Curso[]>(cursosKeys.lists());
      
      // Optimistic update: remover de la lista
      if (previousCursos) {
        queryClient.setQueryData(
          cursosKeys.lists(),
          previousCursos.filter((curso) => curso.id !== id)
        );
      }
      
      return { previousCursos };
    },
    onSuccess: (_, id) => {
      // Remover del cache individual
      queryClient.removeQueries({ queryKey: cursosKeys.detail(id) });
      
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: cursosKeys.lists() });
      
      toast.success("Curso eliminado exitosamente", { id: `delete-curso-${id}` });
    },
    onError: (error: Error, id, context) => {
      // Rollback en caso de error
      if (context?.previousCursos) {
        queryClient.setQueryData(cursosKeys.lists(), context.previousCursos);
      }
      
      console.error("Error eliminando curso:", error);
      toast.error(error.message || "Error al eliminar el curso", { id: `delete-curso-${id}` });
    },
  });
}

/**
 * Hook para activar/desactivar un curso
 * 
 * NOTA: La API solo devuelve un mensaje, no el curso actualizado.
 * Usamos optimistic updates para actualizar la UI inmediatamente.
 */
export function useToggleCursoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Activo" | "Inactivo" }) =>
      CursosService.toggleCursoStatus(id, status),
    onMutate: async ({ id, status }) => {
      const action = status === "Activo" ? "Activando" : "Desactivando";
      toast.loading(`${action} curso...`, { id: `toggle-curso-${id}` });
      
      // Cancelar queries para evitar conflictos
      await queryClient.cancelQueries({ queryKey: cursosKeys.lists() });
      await queryClient.cancelQueries({ queryKey: cursosKeys.detail(id) });
      
      // Guardar snapshot de la lista
      const previousCursos = queryClient.getQueryData<Curso[]>(cursosKeys.lists());
      
      // Optimistic update en la lista
      if (previousCursos) {
        const updatedCursos = previousCursos.map((curso) =>
          curso.id === id ? { ...curso, status } : curso
        );
        queryClient.setQueryData(cursosKeys.lists(), updatedCursos);
      }
      
      return { previousCursos, id };
    },
    onSuccess: (response, { id, status }) => {
      // Invalidar lista para refrescar con datos del servidor
      queryClient.invalidateQueries({ queryKey: cursosKeys.lists() });
      
      const action = status === "Activo" ? "activado" : "desactivado";
      toast.success(`Curso ${action} exitosamente`, { id: `toggle-curso-${id}` });
      
      console.log("📨 Respuesta del servidor:", response.message);
    },
    onError: (error: Error, { id }, context) => {
      // Rollback: restaurar la lista anterior
      if (context?.previousCursos) {
        queryClient.setQueryData(cursosKeys.lists(), context.previousCursos);
      }
      
      console.error("Error cambiando estado del curso:", error);
      toast.error(error.message || "Error al cambiar el estado", { id: `toggle-curso-${id}` });
    },
  });
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Hook para prefetch de un curso (útil para hover effects)
 */
export function usePrefetchCurso() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: cursosKeys.detail(id),
      queryFn: () => CursosService.getCursoById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar todas las queries de cursos
 */
export function useInvalidateCursos() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: cursosKeys.all });
  };
}

