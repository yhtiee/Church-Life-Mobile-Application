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

/** Rows per page for every platform list. */
export const PLATFORM_PAGE_SIZE = 20;

// Filters are lists of ticked values. An empty list means no filter; within
// a list the values are alternatives, and separate lists narrow together.
export type ParishStatus = 'no_admin' | 'unverified';
export type PeopleCategory = 'parish_admin' | 'member' | 'super_admin' | 'no_parish';
export type GroupAccess = 'secured' | 'open';
export type AuditCategory = 'parish' | 'admin' | 'member' | 'superadmin' | 'group';

/** PostgREST condition for each people category, OR-ed together when several are ticked. */
const PEOPLE_CONDITIONS: Record<PeopleCategory, string> = {
  parish_admin: 'role.eq.parish_admin',
  member: 'role.eq.member',
  super_admin: 'is_super_admin.eq.true',
  no_parish: 'parishId.is.null',
};

interface PageArgs {
  search?: string;
  page?: number;
}

/**
 * Strips characters that carry meaning in a PostgREST `or` filter, so a search
 * for "St. Jude, GRA" cannot break the query or smuggle in another condition.
 */
function cleanTerm(term?: string): string {
  return (term ?? '').trim().replace(/[%,()*]/g, '');
}

/** Inclusive row range for a zero-based page. */
function pageRange(page = 0): [number, number] {
  const from = page * PLATFORM_PAGE_SIZE;
  return [from, from + PLATFORM_PAGE_SIZE - 1];
}

/**
 * Platform administration, for holders of the `is_super_admin` flag.
 *
 * Every write goes through an `sa_` database function rather than a table
 * write. Row level security across the app is parish-scoped, and a platform
 * administrator works across parishes by definition, so the functions carry
 * the authority and the audit trail instead of loosening ~55 policies.
 */
export class PlatformService {
  /**
   * One page of parishes with member, admin and unverified-payment counts.
   * Search, filter and paging all run in the database: the counts are
   * aggregates, so filtering on them has to happen after they are computed.
   */
  async fetchParishOverview({
    search,
    page = 0,
    dioceses = [],
    statuses = [],
  }: PageArgs & { dioceses?: string[]; statuses?: ParishStatus[] }) {
    try {
      const { data, error } = await supaBaseClient.rpc('sa_parish_overview', {
        search_term: cleanTerm(search) || null,
        diocese_filters: dioceses.length ? dioceses : null,
        status_filters: statuses.length ? statuses : null,
        page_limit: PLATFORM_PAGE_SIZE,
        page_offset: page * PLATFORM_PAGE_SIZE,
      });
      if (error) throw error;
      return { data: (data ?? []) as ParishOverviewRow[], error: null };
    } catch (error: any) {
      console.error('Error fetching parish overview:', error.message || error);
      return { data: null, error };
    }
  }

  /** Distinct dioceses, for the parish filter. Parishes are publicly readable. */
  async fetchDioceses() {
    try {
      const { data, error } = await supaBaseClient.from('parishes').select('diocese');
      if (error) throw error;
      const dioceses = Array.from(
        new Set((data ?? []).map((row: { diocese: string }) => row.diocese?.trim()).filter(Boolean))
      ).sort() as string[];
      return { data: dioceses, error: null };
    } catch (error: any) {
      console.error('Error fetching dioceses:', error.message || error);
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
    city?: string | null;
    address?: string | null;
  }) {
    try {
      const { data, error } = await supaBaseClient.rpc('sa_save_parish', {
        parish_name: parish.name,
        parish_diocese: parish.diocese,
        parish_state: parish.state,
        parish_country: parish.country,
        parish_id: parish.id ?? null,
        parish_city: parish.city ?? null,
        parish_address: parish.address ?? null,
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

  /** One page of administrative actions, newest first. */
  async fetchAuditLog({
    search,
    page = 0,
    categories = [],
  }: PageArgs & { categories?: AuditCategory[] }) {
    try {
      const [from, to] = pageRange(page);
      let query = supaBaseClient
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      // Actions are namespaced ("parish.create", "admin.grant"), so a
      // category is a prefix match.
      if (categories.length) {
        query = query.or(categories.map((c) => `action.like.${c}.%`).join(','));
      }

      const term = cleanTerm(search);
      if (term) query = query.or(`actor_name.ilike.%${term}%,detail->>name.ilike.%${term}%`);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data as DatabaseAuditEntry[], error: null };
    } catch (error: any) {
      console.error('Error fetching audit log:', error.message || error);
      return { data: null, error };
    }
  }

  /** One page of people across every parish, by name or email. */
  async searchProfiles({
    search,
    page = 0,
    categories = [],
  }: PageArgs & { categories?: PeopleCategory[] }) {
    try {
      const [from, to] = pageRange(page);
      let query = supaBaseClient
        .from('profiles')
        .select('id, fullName, email, role, parishId, parishName, is_super_admin')
        .order('fullName', { ascending: true })
        .range(from, to);

      // A second `or` alongside the search one: PostgREST ANDs separate `or`
      // groups, so this reads as (any ticked category) AND (search match).
      if (categories.length) {
        query = query.or(categories.map((c) => PEOPLE_CONDITIONS[c]).join(','));
      }

      const term = cleanTerm(search);
      if (term) query = query.or(`fullName.ilike.%${term}%,email.ilike.%${term}%`);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data as AuthUser[], error: null };
    } catch (error: any) {
      console.error('Error searching profiles:', error.message || error);
      return { data: null, error };
    }
  }

  /** One page of the groups shared by every parish (no parish_id). */
  async fetchGlobalGroups({
    search,
    page = 0,
    access = [],
  }: PageArgs & { access?: GroupAccess[] }) {
    try {
      const [from, to] = pageRange(page);
      let query = supaBaseClient
        .from('groups')
        .select('*')
        .is('parish_id', null)
        .order('name', { ascending: true })
        .range(from, to);

      // Ticking both is the same as ticking neither, so only one narrows.
      if (access.length === 1) query = query.eq('is_secure', access[0] === 'secured');

      const term = cleanTerm(search);
      if (term) query = query.ilike('name', `%${term}%`);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data as Group[], error: null };
    } catch (error: any) {
      console.error('Error fetching global groups:', error.message || error);
      return { data: null, error };
    }
  }
}
