import { useQuery } from '@tanstack/react-query';
import { PlatformService } from '@/lib/supabase/services/platform';
import { QUERY_KEYS } from '@/constants/query-keys';

const platformService = new PlatformService();

/** Parishes with member, admin and unverified-payment counts. */
export function useParishOverviewQuery(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.parishOverview(),
    queryFn: async () => {
      const res = await platformService.fetchParishOverview();
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled,
  });
}

/** Platform-wide member search by name or email. */
export function usePlatformProfilesQuery(term: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.platformProfiles(term),
    queryFn: async () => {
      const res = await platformService.searchProfiles(term);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled,
  });
}

/** Recent administrative actions. */
export function useAuditLogQuery(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.auditLog(),
    queryFn: async () => {
      const res = await platformService.fetchAuditLog();
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled,
  });
}
