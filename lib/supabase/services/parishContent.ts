import { supaBaseClient } from '../client';
import type {
  DatabaseDailyReading,
  DatabaseScheduleItem,
  ScheduleKind,
} from '../entities/types';

/** Local calendar date as YYYY-MM-DD. Avoids the UTC shift `toISOString` causes. */
export function toDateKey(date: Date = new Date()): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Parish-authored content: mass schedules, devotions, sacraments and the
 * daily readings with their reflection.
 *
 * Writes are guarded by row level security rather than database functions.
 * These are ordinary content columns, so a parish admin editing any of them
 * is the intended behaviour and there is no privilege escalation to prevent.
 */
export class ParishContentService {
  /** Every active schedule item for a parish, ordered for display. */
  async fetchScheduleItems(parishId: string, kind?: ScheduleKind) {
    try {
      let query = supaBaseClient
        .from('parish_schedule_items')
        .select('*')
        .eq('parish_id', parishId)
        .eq('is_active', true);

      if (kind) query = query.eq('kind', kind);

      const { data, error } = await query
        .order('kind', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data as DatabaseScheduleItem[], error: null };
    } catch (error: any) {
      console.error(`Error fetching schedule for parish (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  async createScheduleItem(
    item: Pick<DatabaseScheduleItem, 'parish_id' | 'kind' | 'label'> &
      Partial<Pick<DatabaseScheduleItem, 'times' | 'details' | 'icon' | 'sort_order'>>
  ) {
    try {
      const { data, error } = await supaBaseClient
        .from('parish_schedule_items')
        .insert([{ times: [], ...item }])
        .select()
        .single();

      if (error) throw error;
      return { data: data as DatabaseScheduleItem, error: null };
    } catch (error: any) {
      console.error('Error creating schedule item:', error.message || error);
      return { data: null, error };
    }
  }

  async updateScheduleItem(id: string, updates: Partial<DatabaseScheduleItem>) {
    try {
      const { data, error } = await supaBaseClient
        .from('parish_schedule_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as DatabaseScheduleItem, error: null };
    } catch (error: any) {
      console.error(`Error updating schedule item (${id}):`, error.message || error);
      return { data: null, error };
    }
  }

  async deleteScheduleItem(id: string) {
    try {
      const { error } = await supaBaseClient
        .from('parish_schedule_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: { id }, error: null };
    } catch (error: any) {
      console.error(`Error deleting schedule item (${id}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * The parish's reading for a given day, or null when none was posted.
   * Callers fall back to the scripture API on null.
   */
  async fetchDailyReading(parishId: string, dateKey: string = toDateKey()) {
    try {
      const { data, error } = await supaBaseClient
        .from('parish_daily_readings')
        .select('*')
        .eq('parish_id', parishId)
        .eq('reading_date', dateKey)
        .maybeSingle();

      if (error) throw error;
      return { data: (data as DatabaseDailyReading) ?? null, error: null };
    } catch (error: any) {
      console.error(`Error fetching daily reading (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /** Recent readings for the parish, newest first, for the admin list. */
  async fetchRecentReadings(parishId: string, limit = 30) {
    try {
      const { data, error } = await supaBaseClient
        .from('parish_daily_readings')
        .select('*')
        .eq('parish_id', parishId)
        .order('reading_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data as DatabaseDailyReading[], error: null };
    } catch (error: any) {
      console.error(`Error fetching readings (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Creates or replaces the reading for one parish and date. Upserting on the
   * unique (parish_id, reading_date) pair means editing today's entry twice
   * updates it rather than failing or duplicating.
   */
  async saveDailyReading(
    reading: Pick<DatabaseDailyReading, 'parish_id' | 'reading_date'> &
      Partial<
        Pick<
          DatabaseDailyReading,
          | 'first_reading'
          | 'psalm'
          | 'second_reading'
          | 'gospel'
          | 'reflection'
          | 'author'
          | 'created_by'
        >
      >
  ) {
    try {
      const { data, error } = await supaBaseClient
        .from('parish_daily_readings')
        .upsert([reading], { onConflict: 'parish_id,reading_date' })
        .select()
        .single();

      if (error) throw error;
      return { data: data as DatabaseDailyReading, error: null };
    } catch (error: any) {
      console.error('Error saving daily reading:', error.message || error);
      return { data: null, error };
    }
  }

  async deleteDailyReading(id: string) {
    try {
      const { error } = await supaBaseClient
        .from('parish_daily_readings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: { id }, error: null };
    } catch (error: any) {
      console.error(`Error deleting daily reading (${id}):`, error.message || error);
      return { data: null, error };
    }
  }
}
