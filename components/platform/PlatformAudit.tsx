import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import {
  PlatformListControls,
  PlatformListEmpty,
  PlatformListFooter,
} from '@/components/platform/PlatformListControls';
import { countSelected, type FilterSection, type FilterSelection } from '@/components/ui/FilterModal';
import { useAuditLogQuery } from '@/hooks/queries/usePlatform';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { AuditCategory } from '@/lib/supabase/services/platform';
import type { DatabaseAuditEntry } from '@/lib/supabase/entities/types';

// Each value is the action's namespace, matched as a prefix in the query.
const FILTER_SECTIONS: FilterSection[] = [
  {
    key: 'category',
    title: 'Action type',
    options: [
      { value: 'parish', label: 'Parishes' },
      { value: 'admin', label: 'Admin changes' },
      { value: 'member', label: 'Member moves' },
      { value: 'superadmin', label: 'Super admin access' },
      { value: 'group', label: 'Groups' },
    ],
  },
];

const ACTION_LABELS: Record<string, string> = {
  'parish.create': 'created a parish',
  'parish.update': 'updated a parish',
  'admin.grant': 'made someone a parish admin',
  'admin.revoke': 'removed parish admin access',
  'member.move': 'moved a member to another parish',
  'superadmin.grant': 'granted super admin access',
  'superadmin.revoke': 'revoked super admin access',
  'group.create': 'created a group',
  'group.update': 'updated a group',
};

const ACTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  parish: 'business-outline',
  profile: 'person-outline',
  group: 'albums-outline',
};

/** A record of who changed what across the platform. Read-only, so no add button. */
export function PlatformAudit() {
  const { colors, typography, radius } = useTheme();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterSelection>({});

  const debouncedSearch = useDebouncedValue(search);
  const auditQuery = useAuditLogQuery({
    search: debouncedSearch,
    categories: (filters.category ?? []) as AuditCategory[],
  });
  const entries = useMemo(() => auditQuery.data?.pages.flat() ?? [], [auditQuery.data]);
  const isFiltered = !!debouncedSearch.trim() || countSelected(filters) > 0;

  const renderEntry = ({ item: entry }: { item: DatabaseAuditEntry }) => (
    <Card elevation="sm" style={{ padding: 14, borderRadius: radius.lg, marginBottom: 8 }}>
      <View style={styles.row}>
        <Ionicons
          name={ACTION_ICONS[entry.target_type ?? ''] ?? 'ellipse-outline'}
          size={18}
          color={colors.primary}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text
            style={{
              fontSize: 14,
              color: colors.text,
              fontFamily: typography.fontFamily.medium,
              lineHeight: 20,
            }}
          >
            <Text style={{ fontFamily: typography.fontFamily.bold }}>
              {entry.actor_name?.trim() || 'Someone'}
            </Text>{' '}
            {ACTION_LABELS[entry.action] ?? entry.action}
            {entry.detail?.name ? ` — ${entry.detail.name}` : ''}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              marginTop: 3,
            }}
          >
            {new Date(entry.created_at).toLocaleString()}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.fill}>
      <PlatformListControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by who acted or what changed"
        filterSections={FILTER_SECTIONS}
        appliedFilters={filters}
        onApplyFilters={setFilters}
      />

      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (auditQuery.hasNextPage && !auditQuery.isFetchingNextPage) auditQuery.fetchNextPage();
        }}
        refreshing={auditQuery.isRefetching && !auditQuery.isFetchingNextPage}
        onRefresh={() => auditQuery.refetch()}
        ListEmptyComponent={
          <PlatformListEmpty
            isLoading={auditQuery.isLoading}
            isFiltered={isFiltered}
            emptyText="Nothing recorded yet."
          />
        }
        ListFooterComponent={
          <PlatformListFooter
            isFetchingNextPage={auditQuery.isFetchingNextPage}
            hasNextPage={!!auditQuery.hasNextPage}
            shownCount={entries.length}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
});
