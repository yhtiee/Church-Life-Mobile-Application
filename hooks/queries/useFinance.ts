import { useQuery } from '@tanstack/react-query';
import { FinanaceService } from '@/lib/supabase/services/finance';
import { QUERY_KEYS } from '@/constants/query-keys';

const financeService = new FinanaceService();

export function useDonationsQuery(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.donations(userId),
    queryFn: async () => {
      const res = await financeService.fetchDonations(userId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!userId,
  });
}

export function usePledgesQuery(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.pledges(userId),
    queryFn: async () => {
      const res = await financeService.fetchPledges(userId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!userId,
  });
}
