import { useQuery } from '@tanstack/react-query';
import { MassService } from '@/lib/supabase/services/mass';
import { QUERY_KEYS } from '@/constants/query-keys';

const massService = new MassService();

export function useMassBookingsQuery(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.massBookings(userId),
    queryFn: async () => {
      const res = await massService.fetchMassBookings(userId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!userId,
  });
}

export function useAllMassBookingsQuery() {
  return useQuery({
    queryKey: [QUERY_KEYS.massBookings('all')],
    queryFn: async () => {
      const res = await massService.fetchAllMassBookings();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

export function useMassBookingsByParishQuery(parishId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.massBookings('all'), parishId],
    queryFn: async () => {
      const res = await massService.fetchMassBookingsByParish(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}
