import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ParishServices } from '@/lib/supabase/services/parishes';
import { QUERY_KEYS } from '@/constants/query-keys';
import { Parish } from '@/constants/parishes';

const parishService = new ParishServices();

export function useUpdateParishMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parishId, updates }: { parishId: string; updates: Partial<Parish> }) => {
      const res = await parishService.updateParishDetails(parishId, updates);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parish(variables.parishId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parishes() });
    },
  });
}

/** Submits a parish transfer request for the signed-in member. */
export function useRequestParishTransferMutation(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetParishId, reason }: { targetParishId: string; reason?: string }) => {
      const res = await parishService.requestTransfer(targetParishId, reason);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myParishTransfers(userId ?? '') });
    },
  });
}

/** Approves or declines a transfer out of the admin's own parish. */
export function useDecideParishTransferMutation(parishId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      approve,
      note,
    }: {
      requestId: string;
      approve: boolean;
      note?: string;
    }) => {
      const res = await parishService.decideTransfer(requestId, approve, note);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parishTransfers(parishId ?? '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allProfiles() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups() });
    },
  });
}
