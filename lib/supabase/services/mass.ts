import { supaBaseClient } from '../client';
import { DatabaseMassBooking } from '../entities/types';
import { notifyOnSuccess } from './notification';

export class MassService {
  /**
   * Books a new Mass Intention (raw implementation).
   */
  async createMassBookingRaw(booking: Omit<DatabaseMassBooking, 'id' | 'createdAt'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('mass_bookings')
        .insert([booking])
        .select()
        .single();

      if (error) throw error;
      return { data: data as DatabaseMassBooking, error: null };
    } catch (error: any) {
      console.error('Error booking mass intention:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Books a new Mass Intention (wrapped with notification).
   */
  createMassBooking = notifyOnSuccess(
    this.createMassBookingRaw.bind(this),
    (result, booking) => ({
      title: 'Mass Intention Booked',
      body: `Your mass intention booking (${booking.intentionType}) for ${booking.date} is confirmed.`,
      type: 'announcement',
    })
  );

  /**
   * Fetches all mass bookings created by a specific user.
   */
  async fetchMassBookings(userId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('mass_bookings')
        .select('*')
        .eq('user_id', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return { data: data as DatabaseMassBooking[], error: null };
    } catch (error: any) {
      console.error(`Error fetching mass bookings for user (${userId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Deletes a mass booking intention.
   */
  async deleteMassBooking(bookingId: string) {
    try {
      const { error } = await supaBaseClient
        .from('mass_bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error(`Error deleting mass booking (${bookingId}):`, error.message || error);
      return { error };
    }
  }
}