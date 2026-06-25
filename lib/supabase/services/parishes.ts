import { supaBaseClient } from '../client';
import { Parish } from '@/constants/parishes';

export class ParishServices {

  /**
   * Fetches all approved Catholic parishes from the 'parishes' table.
   */
  async fetchParishes() {
    try {
      const { data, error } = await supaBaseClient
        .from('parishes')
        .select('*')
        .order('name', { ascending: true });
  
      if (error) throw error;
      return { data: data as Parish[], error: null };
    } catch (error: any) {
      console.error('Error fetching parishes:', error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Fetches a single parish details by its ID.
   */
  async fetchParishById(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('parishes')
        .select('*')
        .eq('id', parishId)
        .single();
  
      if (error) throw error;
      return { data: data as Parish, error: null };
    } catch (error: any) {
      console.error(`Error fetching parish details (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Updates a parish's details (e.g. history, patron, priest, bishop).
   */
  async updateParishDetails(parishId: string, updates: Partial<Parish>) {
    try {
      const { data, error } = await supaBaseClient
        .from('parishes')
        .update(updates)
        .eq('id', parishId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Parish, error: null };
    } catch (error: any) {
      console.error(`Error updating parish details (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }
}

