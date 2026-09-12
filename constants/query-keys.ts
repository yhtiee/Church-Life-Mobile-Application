export const QUERY_KEYS = {
  announcements: (importantOnly?: boolean) => ['announcements', { importantOnly }] as const,
  announcement: (id: string) => ['announcements', id] as const,
  parishes: () => ['parishes'] as const,
  parish: (id: string) => ['parishes', id] as const,
  groups: () => ['groups'] as const,
  openGroups: () => ['openGroups'] as const,
  donations: (userId: string) => ['donations', userId] as const,
  pledges: (userId: string) => ['pledges', userId] as const,
  allDonations: () => ['allDonations'] as const,
  allPledges: () => ['allPledges'] as const,
  pendingDonations: () => ['pendingDonations'] as const,
  pendingPledges: () => ['pendingPledges'] as const,
  massBookings: (userId: string) => ['massBookings', userId] as const,
  userProfile: (userId: string) => ['userProfile', userId] as const,
  allProfiles: () => ['allProfiles'] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  groupRequests: () => ['groupRequests'] as const,
  bankAccounts: (parishId: string, activeOnly: boolean) =>
    ['bankAccounts', parishId, activeOnly] as const,
  celebrations: (parishId: string, scope: string) =>
    ['celebrations', parishId, scope] as const,
  celebration: (id: string) => ['celebration', id] as const,
  celebrationWishes: (celebrationId: string) =>
    ['celebrationWishes', celebrationId] as const,
  celebrationSupport: (celebrationId: string) =>
    ['celebrationSupport', celebrationId] as const,
  pendingPayments: (parishId: string) => ['pendingPayments', parishId] as const,
  parishSchedule: (parishId: string, kind?: string) =>
    ['parishSchedule', parishId, kind ?? 'all'] as const,
  parishReading: (parishId: string, dateKey: string) =>
    ['parishReading', parishId, dateKey] as const,
  parishReadings: (parishId: string) => ['parishReadings', parishId] as const,
  parishTransfers: (parishId: string) => ['parishTransfers', parishId] as const,
  myParishTransfers: (userId: string) => ['myParishTransfers', userId] as const,
  allGroupUpdates: () => ['allGroupUpdates'] as const,
  ads: (scope: string) => ['ads', scope] as const,
  ad: (id: string) => ['ads', id] as const,
  ACTIVITIES: 'activities',
  ALL_ACTIVITIES: 'allActivities',
};
