import { useQuery } from '@tanstack/react-query';
import { ParishServices } from '@/lib/supabase/services/parishes';
import { QUERY_KEYS } from '@/constants/query-keys';

const parishService = new ParishServices();

export function useParishesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.parishes(),
    queryFn: async () => {
      const res = await parishService.fetchParishes();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

export function useParishQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.parish(id),
    queryFn: async () => {
      const res = await parishService.fetchParishById(id);
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!id,
  });
}

/**
 * Pending transfers OUT of a parish — the review queue for that parish's
 * admins, who are the ones who decide.
 */
export function useParishTransferRequestsQuery(parishId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.parishTransfers(parishId ?? ''),
    queryFn: async () => {
      if (!parishId) return [];
      const res = await parishService.fetchTransferRequestsByParish(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

/** A member's own transfer requests, so they can see where one stands. */
export function useMyParishTransfersQuery(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.myParishTransfers(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];
      const res = await parishService.fetchMyTransferRequests(userId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!userId,
  });
}
