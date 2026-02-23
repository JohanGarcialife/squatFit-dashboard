import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Pack } from "@/lib/services/packs-service";
import { PacksService, CreatePackDto, UpdatePackDto } from "@/lib/services/packs-service";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const packsKeys = {
  all: ["packs"] as const,
  lists: () => [...packsKeys.all, "list"] as const,
  list: () => [...packsKeys.lists()] as const,
  details: () => [...packsKeys.all, "detail"] as const,
  detail: (id: string) => [...packsKeys.details(), id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

export function usePacks() {
  return useQuery({
    queryKey: packsKeys.list(),
    queryFn: () => PacksService.getPacks(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function usePack(id: string) {
  return useQuery({
    queryKey: packsKeys.detail(id),
    queryFn: () => PacksService.getPackById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useCreatePack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePackDto) => PacksService.createPack(data),
    onMutate: () => toast.loading("Creando pack...", { id: "create-pack" }),
    onSuccess: (pack) => {
      queryClient.invalidateQueries({ queryKey: packsKeys.lists() });
      queryClient.setQueryData(packsKeys.detail(pack.id), pack);
      toast.success("Pack creado exitosamente", { id: "create-pack" });
    },
    onError: (e: Error) => toast.error(e.message || "Error al crear el pack", { id: "create-pack" }),
  });
}

export function useUpdatePack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackDto }) => PacksService.updatePack(id, data),
    onMutate: () => toast.loading("Actualizando pack...", { id: "update-pack" }),
    onSuccess: (updated) => {
      queryClient.setQueryData(packsKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: packsKeys.lists() });
      toast.success("Pack actualizado exitosamente", { id: "update-pack" });
    },
    onError: (e: Error) => toast.error(e.message || "Error al actualizar el pack", { id: "update-pack" }),
  });
}

export function useDeletePack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PacksService.deletePack(id),
    onMutate: () => toast.loading("Eliminando pack...", { id: "delete-pack" }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: packsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: packsKeys.lists() });
      toast.success("Pack eliminado exitosamente", { id: "delete-pack" });
    },
    onError: (e: Error) => toast.error(e.message || "Error al eliminar el pack", { id: "delete-pack" }),
  });
}
