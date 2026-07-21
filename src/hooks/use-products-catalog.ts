import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProductsService, type Product, type UpdateProductPatch } from "@/lib/services/products-service";

const PRODUCTS_KEY = ["catalog-products"] as const;

export function useCatalogProducts() {
  return useQuery<Product[]>({
    queryKey: PRODUCTS_KEY,
    queryFn: () => ProductsService.list(),
    staleTime: 30_000,
  });
}

/** Opciones del selector de `grant_id` (curso/libro/pack) cargadas bajo demanda. */
export function useGrantTargets(kind: "course" | "book" | "pack" | null) {
  return useQuery({
    queryKey: ["grant-targets", kind],
    queryFn: () => ProductsService.getGrantTargets(kind as "course" | "book" | "pack"),
    enabled: kind != null,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateProductPatch }) => ProductsService.update(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}
