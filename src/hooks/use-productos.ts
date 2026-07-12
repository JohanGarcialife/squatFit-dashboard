import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ProductsService, type CreateProductoDto, type UpdateProductoDto } from "@/lib/services/products-service";

export const productosKeys = {
  all: ["productos"] as const,
  lists: () => [...productosKeys.all, "list"] as const,
  list: () => [...productosKeys.lists()] as const,
};

export function useProductos() {
  return useQuery({
    queryKey: productosKeys.list(),
    queryFn: () => ProductsService.getProductos(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Aún sin backend desplegado devuelve 401; no reintentar en bucle.
    retry: 1,
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductoDto) => ProductsService.createProducto(data),
    onMutate: () => toast.loading("Creando producto...", { id: "create-producto" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
      toast.success("Producto creado", { id: "create-producto" });
    },
    onError: (e: Error) => toast.error(e.message || "Error al crear el producto", { id: "create-producto" }),
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductoDto }) => ProductsService.updateProducto(id, data),
    onMutate: () => toast.loading("Actualizando producto...", { id: "update-producto" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
      toast.success("Producto actualizado", { id: "update-producto" });
    },
    onError: (e: Error) => toast.error(e.message || "Error al actualizar el producto", { id: "update-producto" }),
  });
}

export function useToggleProductoStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => ProductsService.setProductoStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
      toast.success("Estado actualizado");
    },
    onError: (e: Error) => toast.error(e.message || "Error al cambiar el estado"),
  });
}

export function useDeleteProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ProductsService.deleteProducto(id),
    onMutate: () => toast.loading("Eliminando producto...", { id: "delete-producto" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
      toast.success("Producto eliminado", { id: "delete-producto" });
    },
    onError: (e: Error) => toast.error(e.message || "Error al eliminar el producto", { id: "delete-producto" }),
  });
}
