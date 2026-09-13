import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  PLATFORM_PAGE_SIZE,
  PlatformService,
  type AuditFilter,
  type GroupFilter,
  type ParishStatusFilter,
  type PeopleFilter,
} from '@/lib/supabase/services/platform';
import { QUERY_KEYS } from '@/constants/query-keys';

const platformService = new PlatformService();

/**
 * A full page means there may be another; a short page means the list ended.
 * Pages are fixed size, so this avoids a separate count query per list.
 */
function nextPage<T>(lastPage: T[], allPages: T[][]): number | undefined {
  return lastPage.length === PLATFORM_PAGE_SIZE ? allPages.length : undefined;
}

/** Paged parishes with member, admin and unverified-payment counts. */
export function useParishOverviewQuery(filters: {
  search: string;
  diocese: string | null;
  status: ParishStatusFilter;
}) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.parishOverview(filters),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await platformService.fetchParishOverview({ ...filters, page: pageParam });
      if (res.error) throw res.error;
      return res.data || [];
    },
    getNextPageParam: nextPage,
  });
}

/** Every diocese that has a parish, for the parish filter. */
export function useDiocesesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.dioceses(),
    queryFn: async () => {
      const res = await platformService.fetchDioceses();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

/** Paged people across every parish. */
export function usePlatformProfilesQuery(filters: { search: string; filter: PeopleFilter }) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.platformProfiles(filters),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await platformService.searchProfiles({ ...filters, page: pageParam });
      if (res.error) throw res.error;
      return res.data || [];
    },
    getNextPageParam: nextPage,
  });
}

/** Paged groups shared by every parish. */
export function useGlobalGroupsQuery(filters: { search: string; filter: GroupFilter }) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.globalGroups(filters),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await platformService.fetchGlobalGroups({ ...filters, page: pageParam });
      if (res.error) throw res.error;
      return res.data || [];
    },
    getNextPageParam: nextPage,
  });
}

/** Paged administrative actions, newest first. */
export function useAuditLogQuery(filters: { search: string; category: AuditFilter }) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.auditLog(filters),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await platformService.fetchAuditLog({ ...filters, page: pageParam });
      if (res.error) throw res.error;
      return res.data || [];
    },
    getNextPageParam: nextPage,
  });
}
