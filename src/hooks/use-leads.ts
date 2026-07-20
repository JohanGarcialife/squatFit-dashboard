import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  LeadsService,
  type CreateLeadInput,
  type Lead,
  type LeadState,
  type LeadsQuery,
} from "@/lib/services/leads-service";

const LEADS_KEY = ["leads"] as const;

export function useLeads(query?: LeadsQuery) {
  return useQuery<Lead[]>({
    queryKey: [...LEADS_KEY, query ?? {}],
    queryFn: () => LeadsService.getLeads(query),
    staleTime: 15_000,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeadInput) => LeadsService.createLead(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function useUpdateLeadState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, state }: { id: string; state: LeadState }) => LeadsService.updateLeadState(id, state),
    // Optimista: mueve la tarjeta de columna al instante en el kanban.
    onMutate: async ({ id, state }) => {
      await queryClient.cancelQueries({ queryKey: LEADS_KEY });
      const snapshots = queryClient.getQueriesData<Lead[]>({ queryKey: LEADS_KEY });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        queryClient.setQueryData<Lead[]>(
          key,
          data.map((l) => (l.id === id ? { ...l, state } : l)),
        );
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function useAddLeadNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => LeadsService.addNote(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function useImportLeadsCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => LeadsService.importCsv(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}
