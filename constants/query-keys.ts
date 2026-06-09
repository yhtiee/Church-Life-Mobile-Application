export const QUERY_KEYS = {
  announcements: (importantOnly?: boolean) => ['announcements', { importantOnly }] as const,
  announcement: (id: string) => ['announcements', id] as const,
  parishes: () => ['parishes'] as const,
  parish: (id: string) => ['parishes', id] as const,
  groups: () => ['groups'] as const,
  openGroups: () => ['openGroups'] as const,
  donations: (userId: string) => ['donations', userId] as const,
  pledges: (userId: string) => ['pledges', userId] as const,
  massBookings: (userId: string) => ['massBookings', userId] as const,
  userProfile: (userId: string) => ['userProfile', userId] as const,
  allProfiles: () => ['allProfiles'] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
};
