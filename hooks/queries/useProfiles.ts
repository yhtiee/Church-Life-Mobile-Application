import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@/lib/supabase/services/auth';
import { QUERY_KEYS } from '@/constants/query-keys';

const authService = new AuthService();

export function useUserProfileQuery(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userProfile(userId),
    queryFn: async () => {
      const res = await authService.getUserProfile(userId);
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useAllProfilesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.allProfiles(),
    queryFn: async () => {
      const res = await authService.fetchAllProfiles();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

/**
 * Fetches all profiles filtered by parish (for parishioner selection dropdowns).
 */
export function useProfilesByParishQuery(parishId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.allProfiles(),
    queryFn: async () => {
      if (!parishId) return [];
      const res = await authService.fetchProfilesByParish(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}
