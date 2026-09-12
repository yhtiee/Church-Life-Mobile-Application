/**
 * Supabase Database Entity Types for ChurchLife
 * This file maps the PostgreSQL schema table definitions to TypeScript interfaces.
 */

export type UserRole = 'member' | 'group_admin' | 'parish_admin';
export type Sex = 'Male' | 'Female';

/**
 * A duty role is a title only — it carries no permissions of its own.
 * Access is decided entirely by `UserRole`.
 */
export type DutyRole = 'parish_priest' | 'assistant_priest' | 'parish_secretary';

export const DUTY_ROLE_LABELS: Record<DutyRole, string> = {
  parish_priest: 'Parish Priest',
  assistant_priest: 'Assistant Priest',
  parish_secretary: 'Parish Secretary',
};

/**
 * Maps to the public.parishes table.
 */
export interface DatabaseParish {
  id: string; // PK - text (e.g. 'p001')
  name: string;
  diocese: string;
  state: string;
  country: string;
  founded?: string | null;
  patron?: string | null;
  bishop?: string | null;
  parish_priest?: string | null;
  brief?: string | null;
  image_url?: string | null;
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
  phoneNumber?: string | null;
  sex?: Sex | null;
  birthdayMonth: string;
  parishId?: string | null;
  parishName?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  role: UserRole;
  duty_role?: DutyRole | null;
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
  parish_id?: string | null;
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
  parish_id?: string | null;
  description: string;
  amount: number;
  currency: string;
  date: string; // YYYY-MM-DD
  category: string;
  receipt?: string | null;
  status?: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  fulfilled_amount?: number;
  approved_at?: string;
  approved_by?: string;
  admin_notes?: string;
}

/**
 * Maps to the public.pledges table.
 */
export interface DatabasePledge {
  id: string; // PK - uuid
  user_id: string; // FK to profiles.id
  parish_id?: string | null;
  title: string;
  targetAmount: number;
  currency: string;
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  paidDate?: string | null; // YYYY-MM-DD
  paidAmount?: number | null;
  status?: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  fulfilled_amount?: number;
  approved_at?: string;
  approved_by?: string;
  admin_notes?: string;
}

/**
 * Maps to the public.group_updates table.
 */
export interface DatabaseGroupUpdate {
  id: string; // PK - uuid
  groupId: string;
  parish_id?: string | null;
  title: string;
  body: string;
  date: string; // YYYY-MM-DD
  author: string;
}

/**
 * Maps to the public.group_requests table.
 */
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface DatabaseGroupRequest {
  id: string; // PK - uuid
  user_id?: string | null; // FK to profiles.id
  parish_id?: string | null;
  userName: string;
  targetGroupId: string;
  currentGroupId?: string | null;
  requestDate: string; // timestamptz string
  reason?: string | null;
  status: RequestStatus;
  decided_at?: string | null;
  decided_by?: string | null;
  /** Joined in by the admin queries, not a column. */
  targetGroup?: { name: string } | null;
  currentGroup?: { name: string } | null;
}

/**
 * Maps to the public.parish_transfer_requests table.
 *
 * `from_parish_id` is the parish being left, and its admins are the ones who
 * decide the request.
 */
export interface DatabaseParishTransferRequest {
  id: string; // PK - uuid
  user_id: string; // FK to profiles.id
  userName: string;
  from_parish_id?: string | null;
  to_parish_id: string;
  reason?: string | null;
  status: RequestStatus;
  requested_at: string; // timestamptz string
  decided_at?: string | null;
  decided_by?: string | null;
  decision_note?: string | null;
  /** Joined in by the queries, not columns. */
  fromParish?: { name: string } | null;
  toParish?: { name: string } | null;
}

/**
 * Maps to the public.group_messages table (chats).
 */
export interface DatabaseGroupMessage {
  id: string; // PK - uuid
  groupId: string;
  parish_id?: string | null;
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
  parish_id?: string | null;
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

/** What a row in public.parish_schedule_items describes. */
export type ScheduleKind = 'mass' | 'devotion' | 'sacrament';

/**
 * Maps to the public.parish_schedule_items table.
 *
 * For `mass` rows, `label` is a day name and `times` holds that day's mass
 * times. For `devotion` and `sacrament` rows, `label` names it and `details`
 * carries the description.
 */
export interface DatabaseScheduleItem {
  id: string; // PK - uuid
  parish_id: string;
  kind: ScheduleKind;
  label: string;
  times: string[];
  details?: string | null;
  /** Ionicons name. Null means the app picks a default for the kind. */
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Maps to the public.parish_daily_readings table. One row per parish per day;
 * when a parish has not posted, the app falls back to the scripture API.
 */
export interface DatabaseDailyReading {
  id: string; // PK - uuid
  parish_id: string;
  reading_date: string; // YYYY-MM-DD
  first_reading?: string | null;
  psalm?: string | null;
  second_reading?: string | null;
  gospel?: string | null;
  reflection?: string | null;
  author?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}
