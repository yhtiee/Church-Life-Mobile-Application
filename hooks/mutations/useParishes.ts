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
