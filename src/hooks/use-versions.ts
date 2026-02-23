import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { LibrosService, CreateVersionDto, UpdateVersionDto, VersionApi } from "@/lib/services/libros-service";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const versionsKeys = {
  all: ["versions"] as const,
  lists: () => [...versionsKeys.all, "list"] as const,
  list: (bookId: string) => [...versionsKeys.lists(), bookId] as const,
  details: () => [...versionsKeys.all, "detail"] as const,
  detail: (versionId: string) => [...versionsKeys.details(), versionId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

export function useVersions(bookId: string) {
  return useQuery({
    queryKey: versionsKeys.list(bookId),
    queryFn: () => LibrosService.getVersions(bookId),
    enabled: !!bookId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useVersion(versionId: string) {
  return useQuery({
    queryKey: versionsKeys.detail(versionId),
    queryFn: () => LibrosService.getVersionById(versionId),
    enabled: !!versionId,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useCreateVersion(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVersionDto) => LibrosService.createVersion(bookId, data),
    onMutate: () => {
      toast.loading("Creando versión...", { id: "create-version" });
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: versionsKeys.list(bookId) });
      queryClient.invalidateQueries({ queryKey: ["libros"] });
      toast.success("Versión creada exitosamente", { id: "create-version" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la versión", { id: "create-version" });
    },
  });
}

export function useUpdateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ versionId, data }: { versionId: string; data: UpdateVersionDto }) =>
      LibrosService.updateVersion(versionId, data),
    onMutate: () => {
      toast.loading("Actualizando versión...", { id: "update-version" });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: versionsKeys.detail(updated.id) });
      queryClient.invalidateQueries({ queryKey: versionsKeys.list(updated.book_id) });
      queryClient.invalidateQueries({ queryKey: ["libros"] });
      toast.success("Versión actualizada exitosamente", { id: "update-version" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la versión", { id: "update-version" });
    },
  });
}

export function useDeleteVersion(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: string) => LibrosService.deleteVersion(versionId),
    onMutate: () => {
      toast.loading("Eliminando versión...", { id: "delete-version" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: versionsKeys.list(bookId) });
      queryClient.invalidateQueries({ queryKey: ["libros"] });
      toast.success("Versión eliminada exitosamente", { id: "delete-version" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la versión", { id: "delete-version" });
    },
  });
}

export function useUploadVersionPdf(versionId: string, bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => LibrosService.uploadVersionPdf(versionId, file),
    onMutate: () => {
      toast.loading("Subiendo PDF...", { id: "upload-version-pdf" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: versionsKeys.detail(versionId) });
      queryClient.invalidateQueries({ queryKey: versionsKeys.list(bookId) });
      toast.success("PDF actualizado exitosamente", { id: "upload-version-pdf" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al subir el PDF", { id: "upload-version-pdf" });
    },
  });
}
