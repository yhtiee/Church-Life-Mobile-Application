import { supaBaseClient } from '../client';
import { Announcement } from '@/constants/mockData';

export class AnnoucementService {
  
  /**
   * Fetches all announcements from the 'announcements' table.
   * Can filter to only important ones.
   */
  async fetchAnnouncements(importantOnly: boolean = false) {
    try {
      let query = supaBaseClient
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });
  
      if (importantOnly) {
        query = query.eq('important', true);
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
      return { data: data as Announcement[], error: null };
    } catch (error: any) {
      console.error('Error fetching announcements:', error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Fetches an announcement by its ID.
   */
  async fetchAnnouncementById(id: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error) throw error;
      return { data: data as Announcement, error: null };
    } catch (error: any) {
      console.error(`Error fetching announcement (${id}):`, error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Creates a new announcement. (Typically run by group_admin or parish_admin)
   */
  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'date'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('announcements')
        .insert([
          {
            ...announcement,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          },
        ])
        .select()
        .single();
  
      if (error) throw error;
      return { data: data as Announcement, error: null };
    } catch (error: any) {
      console.error('Error creating announcement:', error.message || error);
      return { data: null, error };
    }
  }
}

