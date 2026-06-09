/**
 * Supabase Database Entity Types for ChurchLife
 * This file maps the PostgreSQL schema table definitions to TypeScript interfaces.
 */

export type UserRole = 'member' | 'group_admin' | 'parish_admin';
export type Sex = 'Male' | 'Female';

/**
 * Maps to the public.parishes table.
 */
export interface DatabaseParish {
  id: string; // PK - text (e.g. 'p001')
  name: string;
  diocese: string;
  state: string;
  country: string;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    is_secure: boolean;
    image?: string;
    group_admin_id?: string | null;
    parish_id?: string | null;
    member_ids: string[];
    created_at: string;
    update_at: string;
}

/**
 * Maps to the public.profiles table (extends auth.users).
 */
export interface DatabaseProfile {
  id: string; // PK - uuid (links to auth.users)
  fullName: string;
  baptismalName?: string | null;
  email: string;
  sex?: Sex | null;
  birthdayMonth: string;
  parishId?: string | null;
  parishName?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  role: UserRole;
  hasParishAccess: boolean;
  createdAt: string; // timestamptz string
  push_token?: string | null;
}

/**
 * Maps to the public.notifications table.
 */
export interface DatabaseNotification {
  id: string; // PK - uuid
  user_id: string; // FK to profiles.id
  title: string;
  body: string;
  unread: boolean;
  type: 'giving' | 'announcement' | 'group' | 'system';
  created_at: string; // timestamptz string
}

/**
 * Maps to the public.announcements table.
 */
export interface DatabaseAnnouncement {
  id: string; // PK - uuid
  title: string;
  body: string;
  category: string;
  date: string; // YYYY-MM-DD
  important: boolean;
  author: string;
}

/**
 * Maps to the public.donations table.
 */
export interface DatabaseDonation {
  id: string; // PK - uuid
  user_id: string; // FK to profiles.id
  description: string;
  amount: number;
  currency: string;
  date: string; // YYYY-MM-DD
  category: string;
  receipt?: string | null;
}

/**
 * Maps to the public.pledges table.
 */
export interface DatabasePledge {
  id: string; // PK - uuid
  user_id: string; // FK to profiles.id
  title: string;
  targetAmount: number;
  currency: string;
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  paidDate?: string | null; // YYYY-MM-DD
  paidAmount?: number | null;
}

/**
 * Maps to the public.group_updates table.
 */
export interface DatabaseGroupUpdate {
  id: string; // PK - uuid
  groupId: string;
  title: string;
  body: string;
  date: string; // YYYY-MM-DD
  author: string;
}

/**
 * Maps to the public.group_requests table.
 */
export interface DatabaseGroupRequest {
  id: string; // PK - uuid
  user_id?: string | null; // FK to profiles.id
  userName: string;
  targetGroupId: string;
  currentGroupId?: string | null;
  requestDate: string; // timestamptz string
}

/**
 * Maps to the public.group_messages table (chats).
 */
export interface DatabaseGroupMessage {
  id: string; // PK - uuid
  groupId: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string; // HH:MM AM/PM representation
}

/**
 * Maps to the public.mass_bookings table.
 */
export interface DatabaseMassBooking {
  id: string; // PK - uuid
  user_id?: string | null; // FK to profiles.id
  bookerName: string;
  day: string;
  time: string;
  date: string; // YYYY-MM-DD
  formattedDate: string;
  intentionType: string;
  intentionDetails: string;
  offertoryAmount: string;
  parishName: string;
  createdAt: string; // timestamptz string
  refId: string; // unique booking ref
}
