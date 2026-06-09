import { useQuery } from '@tanstack/react-query';
import { ComunityService } from '@/lib/supabase/services/community';
import { QUERY_KEYS } from '@/constants/query-keys';

const communityService = new ComunityService();

export function useGroupsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.groups(),
    queryFn: async () => {
      const res = await communityService.getAllGroups();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

export function useOpenGroupsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.openGroups(),
    queryFn: async () => {
      const res = await communityService.getOpenGroups();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}
