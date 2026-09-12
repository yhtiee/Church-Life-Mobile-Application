import { useQuery } from '@tanstack/react-query';
import { ParishContentService, toDateKey } from '@/lib/supabase/services/parishContent';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { ScheduleKind } from '@/lib/supabase/entities/types';

const contentService = new ParishContentService();

/** Mass times, devotions and sacraments for a parish. */
export function useParishScheduleQuery(parishId?: string, kind?: ScheduleKind) {
  return useQuery({
    queryKey: QUERY_KEYS.parishSchedule(parishId ?? '', kind),
    queryFn: async () => {
      if (!parishId) return [];
      const res = await contentService.fetchScheduleItems(parishId, kind);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

/**
 * The parish's reading for a day. Resolves to null when nothing was posted,
 * which is the signal for callers to fall back to the scripture API.
 */
export function useParishDailyReadingQuery(parishId?: string, dateKey: string = toDateKey()) {
  return useQuery({
    queryKey: QUERY_KEYS.parishReading(parishId ?? '', dateKey),
    queryFn: async () => {
      if (!parishId) return null;
      const res = await contentService.fetchDailyReading(parishId, dateKey);
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!parishId,
  });
}

/** Recent readings, newest first, for the admin list. */
export function useRecentParishReadingsQuery(parishId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.parishReadings(parishId ?? ''),
    queryFn: async () => {
      if (!parishId) return [];
      const res = await contentService.fetchRecentReadings(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}
