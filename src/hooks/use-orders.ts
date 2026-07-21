import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  OrdersService,
  type Order,
  type OrdersQuery,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/services/orders-service";

const ORDERS_KEY = ["orders"] as const;

export function useOrders(query?: OrdersQuery) {
  return useQuery({
    queryKey: [...ORDERS_KEY, query ?? {}],
    queryFn: () => OrdersService.list(query),
    staleTime: 15_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => OrdersService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function useUpdateOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: PaymentMethod }) => OrdersService.updatePayment(id, method),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function useSendOrderEmail() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: OrderStatus }) => OrdersService.sendEmail(id, status),
  });
}

export type { Order };
