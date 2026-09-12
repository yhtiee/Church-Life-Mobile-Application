import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ParishContentService } from '@/lib/supabase/services/parishContent';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { DatabaseDailyReading, DatabaseScheduleItem } from '@/lib/supabase/entities/types';

const contentService = new ParishContentService();

type NewScheduleItem = Pick<DatabaseScheduleItem, 'parish_id' | 'kind' | 'label'> &
  Partial<Pick<DatabaseScheduleItem, 'times' | 'details' | 'icon' | 'sort_order'>>;

/**
 * Create, update and delete schedule items for a parish.
 *
 * Grouped into one hook because the editor screen needs all three and they
 * invalidate the same queries. Row level security rejects a write for a
 * parish the caller does not administer.
 */
export function useScheduleMutations(parishId?: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    // Every `kind` variant of the key shares this prefix.
    queryClient.invalidateQueries({ queryKey: ['parishSchedule', parishId ?? ''] });
  };

  const create = useMutation({
    mutationFn: async (item: NewScheduleItem) => {
      const res = await contentService.createScheduleItem(item);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DatabaseScheduleItem> }) => {
      const res = await contentService.updateScheduleItem(id, updates);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await contentService.deleteScheduleItem(id);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

type ReadingInput = Pick<DatabaseDailyReading, 'parish_id' | 'reading_date'> &
  Partial<
    Pick<
      DatabaseDailyReading,
      'first_reading' | 'psalm' | 'second_reading' | 'gospel' | 'reflection' | 'author' | 'created_by'
    >
  >;

/** Saves (creates or replaces) a parish's reading for one date. */
export function useSaveDailyReadingMutation(parishId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reading: ReadingInput) => {
      const res = await contentService.saveDailyReading(reading);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parishReadings(parishId ?? '') });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.parishReading(parishId ?? '', variables.reading_date),
      });
    },
  });
}

/** Removes a posted reading, so the day falls back to the scripture API. */
export function useDeleteDailyReadingMutation(parishId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await contentService.deleteDailyReading(id);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parishReadings(parishId ?? '') });
      queryClient.invalidateQueries({ queryKey: ['parishReading', parishId ?? ''] });
    },
  });
}
