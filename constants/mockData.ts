/**
 * Mock data for the ChurchLife app.
 * Replace with real API calls (Supabase) in production.
 */

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  date: string;
  important: boolean;
  author: string;
}

export interface BibleVerse {
  reference: string;
  text: string;
  theme: string;
}

export interface Donation {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  receipt?: string;
}

export interface Pledge {
  id: string;
  title: string;
  targetAmount: number;
  currency: string;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  paidAmount?: number;
}

export interface GroupUpdate {
  id: string;
  groupId: string;
  title: string;
  body: string;
  date: string;
  author: string;
}

export interface ParishHistory {
  founded: string;
  patron: string;
  bishop: string;
  parishPriest: string;
  brief: string;
}

export const PARISH_HISTORY: ParishHistory = {
  founded: '1952',
  patron: 'St. Patrick',
  bishop: 'Most Rev. Ignatius Kaigama',
  parishPriest: 'Rev. Fr. Emmanuel Okafor',
  brief:
    'St. Patrick\'s Parish was founded in 1952 by the Society of African Missions. Over the decades, it has grown from a small mission outpost to a vibrant Catholic community with over 3,000 registered families. The parish has been a beacon of faith, education, and social service in the region, establishing schools, hospitals, and community programs that continue to serve thousands today.',
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a001',
    title: 'Sunday Mass Schedule Change',
    body: 'Kindly note that the 8:00 AM Sunday Mass will now commence at 8:30 AM starting from the 1st Sunday of next month. The 10:30 AM and 6:00 PM Masses remain unchanged. This adjustment is to accommodate the new choir rehearsal schedule.',
    category: 'Liturgy',
    date: '2025-08-01',
    important: true,
    author: 'Parish Office',
  },
  {
    id: 'a002',
    title: 'Sunday Mass Readers — 4th August 2025',
    body: '1st Reading: Bro. Chidi Okonkwo (CMO)\n2nd Reading: Sis. Grace Adeyemi (CWO)\nGospel: Rev. Fr. Emmanuel Okafor\nHomily: Rev. Fr. Emmanuel Okafor\nPrayers of the Faithful: CYON Representatives',
    category: 'Liturgy',
    date: '2025-08-02',
    important: false,
    author: 'Liturgy Committee',
  },
  {
    id: 'a003',
    title: 'Annual Harvest & Bazaar — 15 November 2025',
    body: 'The Annual Parish Harvest & Cultural Bazaar is scheduled for November 15, 2025. All parishioners are encouraged to participate. Forms for food stalls, cultural exhibitions, and volunteering are available at the parish secretariat. Deadline for registration: 1st October 2025.',
    category: 'Events',
    date: '2025-08-01',
    important: true,
    author: 'Harvest Committee',
  },
  {
    id: 'a004',
    title: 'Catechism Classes Resume',
    body: 'Catechism classes for children (7–12 years) and teenagers (13–17 years) resume this Saturday at 9:00 AM in the parish hall. Parents are encouraged to bring their children. New registrations are welcome.',
    category: 'Education',
    date: '2025-07-30',
    important: false,
    author: 'Catechism Department',
  },
  {
    id: 'a005',
    title: 'CYON Meeting This Saturday',
    body: 'All CYON members are reminded of the monthly general meeting holding this Saturday, 3rd August 2025, at 10:00 AM in the CYON hall. Attendance is compulsory. Agenda: Election of new executives and planning for the Youth Day celebration.',
    category: 'Groups',
    date: '2025-07-31',
    important: false,
    author: 'CYON Secretariat',
  },
  {
    id: 'a006',
    title: 'Church Renovation Fund — Target: ₦50 Million',
    body: 'The Parish Finance Committee is pleased to announce the launch of the Church Renovation Fund. We aim to raise ₦50 million for the renovation of the parish church building. Donations can be made at the parish secretariat or via bank transfer. Account details: St. Patrick\'s Parish — GTBank — 0123456789.',
    category: 'Finance',
    date: '2025-07-28',
    important: true,
    author: 'Parish Finance Committee',
  },
];

export const BIBLE_VERSES: BibleVerse[] = [
  {
    reference: 'Jeremiah 29:11',
    text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    theme: 'Hope',
  },
  {
    reference: 'Philippians 4:13',
    text: 'I can do all this through him who gives me strength.',
    theme: 'Strength',
  },
  {
    reference: 'John 3:16',
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    theme: 'Love',
  },
  {
    reference: 'Romans 8:28',
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    theme: 'Faith',
  },
  {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    theme: 'Trust',
  },
];

export const MOCK_DONATIONS: Donation[] = [
  { id: 'd001', description: 'Sunday Offering', amount: 2000, currency: '₦', date: '2025-08-04', category: 'Tithe & Offering' },
  { id: 'd002', description: 'Annual Harvest Donation', amount: 50000, currency: '₦', date: '2025-07-15', category: 'Harvest' },
  { id: 'd003', description: 'Church Renovation Fund', amount: 10000, currency: '₦', date: '2025-07-01', category: 'Special Collection' },
  { id: 'd004', description: 'Sunday Offering', amount: 2000, currency: '₦', date: '2025-07-28', category: 'Tithe & Offering' },
  { id: 'd005', description: 'Mission Sunday', amount: 5000, currency: '₦', date: '2025-06-22', category: 'Mission' },
  { id: 'd006', description: 'Sunday Offering', amount: 2000, currency: '₦', date: '2025-06-15', category: 'Tithe & Offering' },
];

export const MOCK_PLEDGES: Pledge[] = [
  {
    id: 'pl001',
    title: 'Annual Harvest 2025',
    targetAmount: 100000,
    currency: '₦',
    dueDate: '2025-11-15',
    isPaid: false,
  },
  {
    id: 'pl002',
    title: 'Church Renovation Fund',
    targetAmount: 50000,
    currency: '₦',
    dueDate: '2025-12-31',
    isPaid: true,
    paidDate: '2025-07-01',
    paidAmount: 50000,
  },
  {
    id: 'pl003',
    title: 'Parish School Development',
    targetAmount: 25000,
    currency: '₦',
    dueDate: '2026-03-31',
    isPaid: false,
  },
  {
    id: 'pl004',
    title: 'CMO Annual Dues 2024',
    targetAmount: 10000,
    currency: '₦',
    dueDate: '2024-12-31',
    isPaid: true,
    paidDate: '2024-11-20',
    paidAmount: 10000,
  },
];

export const MOCK_GROUP_UPDATES: GroupUpdate[] = [
  {
    id: 'gu001',
    groupId: 'cyon',
    title: 'Monthly Meeting Summary — July 2025',
    body: 'The CYON monthly meeting held on July 5th was a success. Key highlights: (1) Election of new welfare officer concluded — Bro. Samuel Eze elected unanimously. (2) Youth Day celebration date confirmed for August 12th. (3) Community service project at St. Patrick\'s Primary School scheduled for August 8th.',
    date: '2025-07-06',
    author: 'CYON Secretariat',
  },
  {
    id: 'gu002',
    groupId: 'cyon',
    title: 'Youth Day Celebration — August 12, 2025',
    body: 'All CYON members are to note that the 2025 Youth Day Mass and celebration will hold on August 12th at the 10:30 AM Mass. CYON members are required to wear their uniforms. A cultural dance performance has been scheduled after Mass. Refreshments will be served.',
    date: '2025-07-25',
    author: 'CYON President',
  },
  {
    id: 'gu003',
    groupId: 'cwo',
    title: 'CWO August Meeting Rescheduled',
    body: 'Please note that the CWO August meeting originally scheduled for August 3rd has been moved to August 10th, 2025 due to the bishop\'s pastoral visit. Time and venue remain the same — 3:00 PM at the parish hall. Attendance is compulsory for all financial members.',
    date: '2025-07-30',
    author: 'CWO Secretary',
  },
  {
    id: 'gu004',
    groupId: 'cmo',
    title: 'CMO Quarterly Report',
    body: 'The CMO Q2 2025 report is now available for review. Key achievements: Completed renovation of the parish generator house, donated 200 bags of rice to the parish food bank, and sponsored 5 underprivileged students for the academic year.',
    date: '2025-07-28',
    author: 'CMO President',
  },
];

export const GROUP_MEETING_TIMES: Record<string, string[]> = {
  cmo:  ['1st Sunday · 8AM', 'Monthly Exec · Last Fri'],
  cwo:  ['2nd Sunday · After Mass', 'Quarterly Retreat'],
  cyon: ['1st Saturday · 10AM', 'Monthly Meeting · 1st Sat'],
  hca:  ['Every Saturday · 9AM'],
};

export interface MassTime {
  day: string;
  times: string[];
}

export const MASS_TIMES: MassTime[] = [
  { day: 'Sunday',   times: ['6:00 AM', '8:30 AM', '10:30 AM', '6:00 PM'] },
  { day: 'Weekdays', times: ['6:30 AM', '12:00 PM'] },
  { day: 'Saturday', times: ['7:00 AM', '5:00 PM'] },
];

// Get today's verse (cycles based on day of year)
export function getDailyVerse(): BibleVerse {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return BIBLE_VERSES[dayOfYear % BIBLE_VERSES.length];
}

export interface GroupRequest {
  id: string;
  userName: string;
  userAvatar?: string;
  targetGroupId: string;
  currentGroupId?: string;
  requestDate: string;
}

export const MOCK_GROUP_REQUESTS: GroupRequest[] = [
  { id: 'gr1', userName: 'John Doe', userAvatar: 'https://i.pravatar.cc/150?u=p1', targetGroupId: 'cmo', currentGroupId: 'cyon', requestDate: '2 hours ago' },
  { id: 'gr2', userName: 'Blessing Udoh', userAvatar: 'https://i.pravatar.cc/150?u=p6', targetGroupId: 'cwo', requestDate: '5 hours ago' },
  { id: 'gr3', userName: 'Chidi Okonkwo', userAvatar: 'https://i.pravatar.cc/150?u=p3', targetGroupId: 'cyon', requestDate: '1 day ago' },
];

export const MOCK_ADMIN_GROUP_POSTS = [
  {
    id: 'agp1',
    groupId: 'cyon',
    author: 'Fr. Michael',
    authorAvatar: 'https://i.pravatar.cc/150?u=admin',
    content: 'All CYON members are reminded of the vocational retreat this Saturday. Please be punctual.',
    timestamp: '3 hours ago',
    seenBy: 145,
    isPinned: true,
  },
  {
    id: 'agp2',
    groupId: 'cwo',
    author: 'Parish Secretary',
    authorAvatar: 'https://i.pravatar.cc/150?u=sec',
    content: 'The CWO monthly dues for Q3 are now being recorded. Please see the financial secretary.',
    timestamp: '1 day ago',
    seenBy: 89,
    isPinned: false,
  },
];

export interface AdminPledge {
  id: string;
  name: string;
  totalPledge: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export const ACTIVE_CAMPAIGN = {
  title: '2026 Harvest of Grace',
  goal: 5000000,
  raised: 3150000,
  deadline: '2026-11-15',
  contributors: 412,
};

export const MOCK_ADMIN_PLEDGES: AdminPledge[] = [
  { id: 'ap1', name: 'John Doe', totalPledge: 100000, paidAmount: 100000, status: 'Paid' },
  { id: 'ap2', name: 'Mary Smith', totalPledge: 250000, paidAmount: 120000, status: 'Pending' },
  { id: 'ap3', name: 'Chidi Okonkwo', totalPledge: 50000, paidAmount: 0, status: 'Overdue' },
  { id: 'ap4', name: 'Grace Adeyemi', totalPledge: 150000, paidAmount: 150000, status: 'Paid' },
  { id: 'ap5', name: 'Samuel Eze', totalPledge: 300000, paidAmount: 50000, status: 'Pending' },
  { id: 'ap6', name: 'Blessing Udoh', totalPledge: 100000, paidAmount: 0, status: 'Pending' },
];

export interface Parishioner {
  id: string;
  fullName: string;
  baptismalName?: string;
  email: string;
  phone: string;
  groupId?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  baptismDate?: string;
  confirmationDate?: string;
  avatar?: string;
}

export const MOCK_PARISHIONERS: Parishioner[] = [
  {
    id: 'p1',
    fullName: 'John Doe',
    baptismalName: 'John',
    email: 'john.doe@example.com',
    phone: '08012345678',
    groupId: 'cmo',
    status: 'Active',
    baptismDate: '1995-05-20',
    avatar: 'https://i.pravatar.cc/150?u=p1',
  },
  {
    id: 'p2',
    fullName: 'Mary Smith',
    baptismalName: 'Maria',
    email: 'mary.smith@example.com',
    phone: '08023456789',
    groupId: 'cwo',
    status: 'Active',
    baptismDate: '1992-10-12',
    confirmationDate: '2010-06-15',
    avatar: 'https://i.pravatar.cc/150?u=p2',
  },
  {
    id: 'p3',
    fullName: 'Chidi Okonkwo',
    baptismalName: 'Michael',
    email: 'chidi.o@example.com',
    phone: '08134567890',
    groupId: 'cyon',
    status: 'Pending',
    avatar: 'https://i.pravatar.cc/150?u=p3',
  },
  {
    id: 'p4',
    fullName: 'Grace Adeyemi',
    baptismalName: 'Anne',
    email: 'grace.a@example.com',
    phone: '09045678901',
    groupId: 'cwo',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/150?u=p4',
  },
  {
    id: 'p5',
    fullName: 'Samuel Eze',
    baptismalName: 'Samuel',
    email: 'samuel.eze@example.com',
    phone: '07056789012',
    groupId: 'cyon',
    status: 'Suspended',
    avatar: 'https://i.pravatar.cc/150?u=p5',
  },
  {
    id: 'p6',
    fullName: 'Blessing Udoh',
    baptismalName: 'Theresa',
    email: 'blessing.u@example.com',
    phone: '08067890123',
    groupId: 'cwo',
    status: 'Pending',
    avatar: 'https://i.pravatar.cc/150?u=p6',
  },
];

export interface AdminActivity {
  id: string;
  type: 'transition' | 'approval' | 'donation';
  user: string;
  details: string;
  timestamp: string;
}

export const ADMIN_STATS = {
  totalParishioners: 1245,
  pendingApprovals: 12,
  weeklyCollection: [
    { day: 'Mon', amount: 12000 },
    { day: 'Tue', amount: 15000 },
    { day: 'Wed', amount: 8000 },
    { day: 'Thu', amount: 22000 },
    { day: 'Fri', amount: 18000 },
    { day: 'Sat', amount: 35000 },
    { day: 'Sun', amount: 145000 },
  ],
};

export const ADMIN_ACTIVITY: AdminActivity[] = [
  { id: 'act1', type: 'transition', user: 'John Doe', details: 'requested transition to CMO', timestamp: '10 mins ago' },
  { id: 'act2', type: 'approval', user: 'Mary Smith', details: 'waiting for parish approval', timestamp: '1 hour ago' },
  { id: 'act3', type: 'donation', user: 'Anonymous', details: 'recorded ₦50,000 cash donation', timestamp: '2 hours ago' },
  { id: 'act4', type: 'transition', user: 'Peter Obi', details: 'requested transition from CYON to CMO', timestamp: '5 hours ago' },
];

export interface ChatMessage {
  id: string;
  groupId: string;
  sender: string;
  senderRole: 'Admin' | 'President' | 'Secretary';
  content: string;
  timestamp: string;
}

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    groupId: 'cyon',
    sender: 'Rev. Fr. Emmanuel',
    senderRole: 'Admin',
    content: 'Good morning my dear youth. Remember to stay steadfast in prayer as we prepare for the upcoming Youth Day.',
    timestamp: '08:30 AM',
  },
  {
    id: 'm2',
    groupId: 'cyon',
    sender: 'Secretary',
    senderRole: 'Secretary',
    content: 'Reminder: All CYON members are to submit their cultural day forms by Friday afternoon.',
    timestamp: '10:15 AM',
  },
  {
    id: 'm3',
    groupId: 'cyon',
    sender: 'President',
    senderRole: 'President',
    content: 'The venue for Saturday rehearsal has been moved to the main hall. Please inform others.',
    timestamp: '12:45 PM',
  },
];

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  type: 'announcement' | 'giving' | 'group' | 'system';
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Donation Confirmed',
    body: 'Your donation of ₦5,000 for Sunday Offering has been received.',
    time: '2 hours ago',
    unread: true,
    type: 'giving',
  },
  {
    id: 'n2',
    title: 'New CYON Update',
    body: 'A new update regarding the Youth Day Celebration has been posted.',
    time: '5 hours ago',
    unread: true,
    type: 'group',
  },
  {
    id: 'n3',
    title: 'Mass Schedule Change',
    body: 'Please note the slight adjustment in the Sunday 8:00 AM Mass time.',
    time: 'Yesterday',
    unread: false,
    type: 'announcement',
  },
  {
    id: 'n4',
    title: 'Parish Approval Pending',
    body: 'Your request to join St. Patrick\'s Parish is currently being reviewed.',
    time: '2 days ago',
    unread: false,
    type: 'system',
  },
];
