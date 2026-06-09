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
