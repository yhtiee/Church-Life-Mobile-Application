import { supaBaseClient } from '../client';
import type { Parish } from '@/constants/parishes';
import type {
  AuthUser,
} from '@/context/AuthContext';
import type {
  DatabaseAuditEntry,
  Group,
  ParishOverviewRow,
} from '../entities/types';

/**
 * Platform administration, for holders of the `is_super_admin` flag.
 *
 * Every write goes through an `sa_` database function rather than a table
 * write. Row level security across the app is parish-scoped, and a platform
 * administrator works across parishes by definition, so the functions carry
 * the authority and the audit trail instead of loosening ~55 policies.
 */
export class PlatformService {
  /** Parishes with member, admin and unverified-payment counts. No amounts. */
  async fetchParishOverview() {
    try {
      const { data, error } = await supaBaseClient.rpc('sa_parish_overview');
      if (error) throw error;
      return { data: (data ?? []) as ParishOverviewRow[], error: null };
    } catch (error: any) {
      console.error('Error fetching parish overview:', error.message || error);
      return { data: null, error };
    }
  }

  /** Creates a parish, or updates one when `id` is supplied. */
  async saveParish(parish: {
    id?: string | null;
    name: string;
    diocese: string;
    state: string;
    country: string;
  }) {
    try {
      const { data, error } = await supaBaseClient.rpc('sa_save_parish', {
        parish_name: parish.name,
        parish_diocese: parish.diocese,
        parish_state: parish.state,
        parish_country: parish.country,
        parish_id: parish.id ?? null,
      });

      if (error) throw error;
      return { data: data as Parish, error: null };
    } catch (error: any) {
      console.error('Error saving parish:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Grants or revokes parish admin for any parish.
   *
   * The parish-scoped equivalent cannot do this: it requires the caller to
   * already administer the same parish, so a newly created parish could never
   * get its first admin.
   */
  async setParishAdmin(targetUserId: string, makeAdmin: boolean) {
    try {
      const { data, error } = await supaBaseClient.rpc('sa_set_parish_admin', {
        target_user_id: targetUserId,
        make_admin: makeAdmin,
      });

      if (error) throw error;
      return { data: data as AuthUser, error: null };
    } catch (error: any) {
      console.error('Error setting parish admin:', error.message || error);
      return { data: null, error };
    }
  }

  /** Moves a member to another parish, dropping groups and duty title. */
  async setMemberParish(targetUserId: string, parishId: string) {
    try {
      const { data, error } = await supaBaseClient.rpc('sa_set_member_parish', {
        target_user_id: targetUserId,
        new_parish_id: parishId,
      });

      if (error) throw error;
      return { data: data as AuthUser, error: null };
    } catch (error: any) {
      console.error('Error moving member:', error.message || error);
      return { data: null, error };
    }
  }

  /** Grants or revokes platform access. Cannot remove the last holder. */
  async setSuperAdmin(targetUserId: string, grantAccess: boolean) {
    try {
      const { data, error } = await supaBaseClient.rpc('sa_set_super_admin', {
        target_user_id: targetUserId,
        grant_access: grantAccess,
      });

      if (error) throw error;
      return { data: data as AuthUser, error: null };
    } catch (error: any) {
      console.error('Error setting platform access:', error.message || error);
      return { data: null, error };
    }
  }

  /** Creates or updates a group shared by every parish. */
  async saveGlobalGroup(group: {
    id?: string | null;
    name: string;
    description: string;
    isSecure: boolean;
  }) {
    try {
      const { data, error } = await supaBaseClient.rpc('sa_save_global_group', {
        group_name: group.name,
        group_description: group.description,
        group_is_secure: group.isSecure,
        group_id: group.id ?? null,
      });

      if (error) throw error;
      return { data: data as Group, error: null };
    } catch (error: any) {
      console.error('Error saving global group:', error.message || error);
      return { data: null, error };
    }
  }

  /** Recent administrative actions. Readable only by platform admins. */
  async fetchAuditLog(limit = 100) {
    try {
      const { data, error } = await supaBaseClient
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data as DatabaseAuditEntry[], error: null };
    } catch (error: any) {
      console.error('Error fetching audit log:', error.message || error);
      return { data: null, error };
    }
  }

  /** Every profile, for the platform-wide member search. */
  async searchProfiles(term: string) {
    try {
      let query = supaBaseClient
        .from('profiles')
        .select('id, fullName, email, role, parishId, parishName, is_super_admin')
        .order('fullName', { ascending: true })
        .limit(50);

      if (term.trim()) {
        const safe = term.trim().replace(/[%,()]/g, '');
        query = query.or(`fullName.ilike.%${safe}%,email.ilike.%${safe}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data as AuthUser[], error: null };
    } catch (error: any) {
      console.error('Error searching profiles:', error.message || error);
      return { data: null, error };
    }
  }
}
