import { supaBaseClient } from '../client';
import { AuthUser, RegisterPayload } from '@/context/AuthContext';

export class AuthService {

  /**
   * Signs in a user using email and password.
   * Returns the Supabase Auth response.
   */
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supaBaseClient.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      // console.error('Error signing in:', error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Registers a new user. This signs them up in Supabase Auth and creates
   * a corresponding profile record in the 'profiles' database table.
   */
  async signUpWithEmail(payload: RegisterPayload): Promise<{ data: any; profile: any; error: any }> {
    try {
      // 1. Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supaBaseClient.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            fullName: payload.fullName,
            baptismalName: payload.baptismalName,
          },
        },
      });
  
      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed - no user returned.');
  
      // Fetch the group name from 'groups'
      let groupName = 'Unknown Group';
      if (payload.groupId) {
        const { data: groupData } = await supaBaseClient
          .from('groups')
          .select('name')
          .eq('id', payload.groupId)
          .single();
        if (groupData) {
          groupName = groupData.name;
        }
      }

      // 2. Create the user profile in your database 'profiles' table
      const profileData = {
        id: authData.user.id,
        fullName: payload.fullName,
        baptismalName: payload.baptismalName,
        email: payload.email,
        sex: payload.sex,
        birthdayMonth: payload.birthdayMonth,
        parishId: payload.parishId,
        parishName: payload.parishName,
        groupId: payload.groupId,
        groupName: groupName,
        role: 'member', // Default role for newly registered users
        hasParishAccess: payload.parishId !== null,
        createdAt: new Date().toISOString(),
      };
  
      const { error: profileError } = await supaBaseClient
        .from('profiles')
        .insert([profileData]);
  
      if (profileError) {
        console.error('Auth succeeded but profile creation failed:', profileError.message);
        throw profileError;
      }

      return { data: authData, profile: profileData, error: null };
    } catch (error: any) {
      console.error('Error during registration:', error.message || error);
      return { data: null, profile: null, error };
    }
  }
  
  /**
   * Signs out the current user session.
   */
  async signOut() {
    try {
      const { error } = await supaBaseClient.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error signing out:', error.message || error);
      return { error };
    }
  }
  
  /**
   * Retrieves the profile of a user from the 'profiles' table by their user ID.
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId);
  
      if (error) throw error;
      const profile = data && data.length > 0 ? data[0] : null;
      return { data: profile as AuthUser | null, error: null };
    } catch (error: any) {
      console.error(`Error fetching user profile (${userId}):`, error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Updates the user's profile in the 'profiles' database table.
   */
  async updateUserProfile(userId: string, updates: Partial<AuthUser>) {
    try {
      const { data, error } = await supaBaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
  
      if (error) throw error;
      return { data: data as AuthUser, error: null };
    } catch (error: any) {
      console.error(`Error updating user profile (${userId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches all registered user profiles.
   */
  async fetchAllProfiles() {
    try {
      const { data, error } = await supaBaseClient
        .from('profiles')
        .select('*')
        .order('fullName', { ascending: true });
  
      if (error) throw error;
      return { data: data as AuthUser[], error: null };
    } catch (error: any) {
      console.error('Error fetching all profiles:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches profiles filtered by parish.
   */
  async fetchProfilesByParish(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('profiles')
        .select('*')
        .eq('parishId', parishId)
        .order('fullName', { ascending: true });
  
      if (error) throw error;
      return { data: data as AuthUser[], error: null };
    } catch (error: any) {
      console.error(`Error fetching profiles for parish (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }
}
