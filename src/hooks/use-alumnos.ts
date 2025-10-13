import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { UsersService, GetAlumnosParams, UpdateUserDto, UserResponse } from "@/lib/services/users-service";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const alumnosKeys = {
  all: ["alumnos"] as const,
  lists: () => [...alumnosKeys.all, "list"] as const,
  list: (params?: GetAlumnosParams) => [...alumnosKeys.lists(), params] as const,
  details: () => [...alumnosKeys.all, "detail"] as const,
  detail: (id: string) => [...alumnosKeys.details(), id] as const,
};

// ============================================================================
// QUERIES - LECTURA DE DATOS
// ============================================================================

/**
 * Hook para obtener todos los alumnos
 * @param params - Parámetros de filtrado (opcional)
 */
export function useAlumnos(params?: GetAlumnosParams) {
  return useQuery({
    queryKey: alumnosKeys.list(params),
    queryFn: () => UsersService.getAlumnos(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener un alumno específico por ID
 * @param id - ID del alumno
 */
export function useAlumno(id: string) {
  return useQuery({
    queryKey: alumnosKeys.detail(id),
    queryFn: async () => {
      // Obtener todos los alumnos y filtrar por ID
      const alumnos = await UsersService.getAlumnos();
      const alumno = alumnos.find((a) => a.id === id);
      if (!alumno) throw new Error("Alumno no encontrado");
      return alumno;
    },
    enabled: !!id, // Solo ejecuta si hay ID
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ============================================================================
// MUTATIONS - ESCRITURA DE DATOS
// ============================================================================

/**
 * Hook para actualizar un alumno existente
 */
export function useUpdateAlumno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserDto) => UsersService.updateUser(data),
    onMutate: async ({ user_id }) => {
      toast.loading("Actualizando alumno...", { id: `update-alumno-${user_id}` });

      // Cancelar queries en curso para evitar conflictos
      await queryClient.cancelQueries({ queryKey: alumnosKeys.detail(user_id) });

      // Guardar snapshot del estado anterior (para rollback)
      const previousAlumno = queryClient.getQueryData<UserResponse>(alumnosKeys.detail(user_id));

      return { previousAlumno, user_id };
    },
    onSuccess: (updatedAlumno, { user_id }) => {
      // Actualizar cache del alumno específico
      queryClient.setQueryData(alumnosKeys.detail(user_id), updatedAlumno);

      // Invalidar lista para refrescar
      queryClient.invalidateQueries({ queryKey: alumnosKeys.lists() });

      toast.success("Alumno actualizado exitosamente", { id: `update-alumno-${user_id}` });
    },
    onError: (error: Error, { user_id }, context) => {
      // Rollback en caso de error
      if (context?.previousAlumno) {
        queryClient.setQueryData(alumnosKeys.detail(user_id), context.previousAlumno);
      }

      console.error("Error actualizando alumno:", error);
      toast.error(error.message || "Error al actualizar el alumno", { id: `update-alumno-${user_id}` });
    },
  });
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Hook para prefetch de un alumno (útil para hover effects)
 */
export function usePrefetchAlumno() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: alumnosKeys.detail(id),
      queryFn: async () => {
        const alumnos = await UsersService.getAlumnos();
        const alumno = alumnos.find((a) => a.id === id);
        if (!alumno) throw new Error("Alumno no encontrado");
        return alumno;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar todas las queries de alumnos
 */
export function useInvalidateAlumnos() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: alumnosKeys.all });
  };
}
