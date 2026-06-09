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
