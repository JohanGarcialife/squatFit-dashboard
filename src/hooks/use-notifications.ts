import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminNotification, NotificationsService, NOTIFICATIONS_POLL_MS } from "@/lib/services/notifications-service";

const QUERY_KEY = ["admin-notifications"];

/** Últimos eventos del panel; sondea cada ~45 s mientras la pestaña está visible. */
export function useNotifications() {
  return useQuery<AdminNotification[]>({
    queryKey: QUERY_KEY,
    queryFn: () => NotificationsService.getNotifications(),
    refetchInterval: NOTIFICATIONS_POLL_MS,
    refetchIntervalInBackground: false,
    staleTime: NOTIFICATIONS_POLL_MS / 2,
  });
}

/** Marca notificaciones como leídas (todas si no se pasan ids) con actualización optimista. */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => NotificationsService.markRead(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<AdminNotification[]>(QUERY_KEY);
      queryClient.setQueryData<AdminNotification[]>(QUERY_KEY, (old) =>
        (old ?? []).map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n)),
      );
      return { previous };
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
