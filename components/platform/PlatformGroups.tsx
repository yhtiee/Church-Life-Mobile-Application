import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/FeedbackContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import {
  PlatformListControls,
  PlatformListEmpty,
  PlatformListFooter,
  type FilterOption,
} from '@/components/platform/PlatformListControls';
import { useGlobalGroupsQuery } from '@/hooks/queries/usePlatform';
import { usePlatformMutations } from '@/hooks/mutations/usePlatform';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { GroupFilter } from '@/lib/supabase/services/platform';
import type { Group } from '@/lib/supabase/entities/types';

const GROUP_FILTERS: FilterOption<GroupFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'secured', label: 'Secured' },
  { value: 'open', label: 'Open' },
];

interface Draft {
  id?: string;
  name: string;
  description: string;
  isSecure: boolean;
}

const EMPTY: Draft = { name: '', description: '', isSecure: false };

/**
 * Groups shared by every parish, meaning those with no parish_id. A parish's
 * own groups stay with its admin; this is the platform-wide catalogue.
 */
export function PlatformGroups() {
  const { colors, typography, radius } = useTheme();
  const { showAlert } = useAlert();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GroupFilter>('all');
  const [draft, setDraft] = useState<Draft | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const groupsQuery = useGlobalGroupsQuery({ search: debouncedSearch, filter });
  const groups = useMemo(() => groupsQuery.data?.pages.flat() ?? [], [groupsQuery.data]);
  const isFiltered = !!debouncedSearch.trim() || filter !== 'all';

  const { saveGlobalGroup } = usePlatformMutations();

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      showAlert({ title: 'Name required', message: 'Give the group a name.', type: 'error' });
      return;
    }
    try {
      await saveGlobalGroup.mutateAsync({
        id: draft.id ?? null,
        name: draft.name,
        description: draft.description,
        isSecure: draft.isSecure,
      });
      setDraft(null);
    } catch (err: any) {
      showAlert({
        title: 'Could not save',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const renderGroup = ({ item: group }: { item: Group }) => (
    <Card elevation="sm" style={{ padding: 14, borderRadius: radius.lg, marginBottom: 10 }}>
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={{ fontSize: 15, color: colors.text, fontFamily: typography.fontFamily.bold }}>
              {group.name.trim()}
            </Text>
            {group.is_secure && <Badge label="Secured" variant="warning" size="sm" />}
          </View>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              marginTop: 4,
              lineHeight: 18,
            }}
          >
            {group.description}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.medium,
              marginTop: 6,
            }}
          >
            {(group.member_ids || []).length} members
          </Text>
        </View>
        <TouchableOpacity
          hitSlop={8}
          onPress={() =>
            setDraft({
              id: group.id,
              name: group.name.trim(),
              description: group.description,
              isSecure: group.is_secure,
            })
          }
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.fill}>
      <PlatformListControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search groups"
        filters={GROUP_FILTERS}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <FlatList
        data={groups}
        keyExtractor={(group) => group.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (groupsQuery.hasNextPage && !groupsQuery.isFetchingNextPage) groupsQuery.fetchNextPage();
        }}
        refreshing={groupsQuery.isRefetching && !groupsQuery.isFetchingNextPage}
        onRefresh={() => groupsQuery.refetch()}
        ListEmptyComponent={
          <PlatformListEmpty
            isLoading={groupsQuery.isLoading}
            isFiltered={isFiltered}
            emptyText="No shared groups yet. Tap + to add the first one."
          />
        }
        ListFooterComponent={
          <PlatformListFooter
            isFetchingNextPage={groupsQuery.isFetchingNextPage}
            hasNextPage={!!groupsQuery.hasNextPage}
            shownCount={groups.length}
          />
        }
      />

      <FloatingActionButton accessibilityLabel="Add a group" onPress={() => setDraft({ ...EMPTY })} />

      <Modal visible={!!draft} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.backdrop}>
          <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.sheet,
                { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
              ]}
            >
              <Text
                style={{
                  fontSize: 17,
                  color: colors.text,
                  fontFamily: typography.fontFamily.bold,
                  marginBottom: 16,
                }}
              >
                {draft?.id ? 'Edit group' : 'New group'}
              </Text>

              <Label label="Name" />
              <Input
                placeholder="Legion of Mary"
                value={draft?.name ?? ''}
                onChangeText={(v) => setDraft((d) => (d ? { ...d, name: v } : d))}
              />

              <View style={styles.field}>
                <Label label="Description" />
                <Input
                  placeholder="What this group does"
                  value={draft?.description ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, description: v } : d))}
                  multiline
                  numberOfLines={3}
                  style={{ height: 90, textAlignVertical: 'top' }}
                />
              </View>

              <TouchableOpacity
                onPress={() => setDraft((d) => (d ? { ...d, isSecure: !d.isSecure } : d))}
                style={styles.toggleRow}
              >
                <Ionicons
                  name={draft?.isSecure ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={colors.primary}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text
                    style={{ fontSize: 14, color: colors.text, fontFamily: typography.fontFamily.medium }}
                  >
                    Needs approval to join
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textMuted,
                      fontFamily: typography.fontFamily.regular,
                      marginTop: 2,
                    }}
                  >
                    Use this for anything a member should not be able to claim for themselves.
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.sheetActions}>
                <Button
                  label="Cancel"
                  onPress={() => setDraft(null)}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Button
                  label="Save"
                  onPress={handleSave}
                  loading={saveGlobalGroup.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // Bottom padding lets the last card scroll clear of the floating button.
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100, flexGrow: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 36 },
  field: { marginTop: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 18 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
});
