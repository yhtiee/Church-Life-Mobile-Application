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

export function useGroupsByParishQuery(parishId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.groups(), parishId],
    queryFn: async () => {
      const res = await communityService.getGroupsByParish(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
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

/**
 * Fetches all pending group transition/join requests (admin view).
 */
export function useGroupRequestsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.groupRequests(),
    queryFn: async () => {
      const res = await communityService.fetchAllGroupRequests();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

/**
 * Fetches group requests filtered by parish (admin view for specific parish).
 */
export function useGroupRequestsByParishQuery(parishId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.groupRequests(), parishId],
    queryFn: async () => {
      const res = await communityService.fetchGroupRequestsByParish(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

/**
 * Fetches recent group updates/bulletins across all groups (admin feed).
 */
export function useAllGroupUpdatesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.allGroupUpdates(),
    queryFn: async () => {
      const res = await communityService.fetchAllGroupUpdates();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

/**
 * Fetches group updates filtered by parish (admin view for specific parish).
 */
export function useGroupUpdatesByParishQuery(parishId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.allGroupUpdates(), parishId],
    queryFn: async () => {
      const res = await communityService.fetchGroupUpdatesByParish(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}
