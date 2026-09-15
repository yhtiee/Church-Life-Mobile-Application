import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
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
} from '@/components/platform/PlatformListControls';
import { countSelected, type FilterSection, type FilterSelection } from '@/components/ui/FilterModal';
import { useDiocesesQuery, useParishOverviewQuery } from '@/hooks/queries/usePlatform';
import { useParishesQuery } from '@/hooks/queries/useParishes';
import { usePlatformMutations } from '@/hooks/mutations/usePlatform';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { ParishStatus } from '@/lib/supabase/services/platform';
import type { ParishOverviewRow } from '@/lib/supabase/entities/types';

const STATUS_OPTIONS = [
  { value: 'no_admin', label: 'No admin' },
  { value: 'unverified', label: 'Unverified payments' },
];

interface Draft {
  id?: string;
  name: string;
  diocese: string;
  city: string;
  state: string;
  address: string;
  country: string;
}

const EMPTY: Draft = {
  name: '',
  diocese: '',
  city: '',
  state: '',
  address: '',
  country: 'Nigeria',
};

/** Create and edit parishes, with the counts that show which ones are stalled. */
export function PlatformParishes() {
  const { colors, typography, radius } = useTheme();
  const { showAlert } = useAlert();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterSelection>({});
  const [draft, setDraft] = useState<Draft | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const overview = useParishOverviewQuery({
    search: debouncedSearch,
    statuses: (filters.status ?? []) as ParishStatus[],
    dioceses: filters.diocese ?? [],
  });
  const rows = useMemo(() => overview.data?.pages.flat() ?? [], [overview.data]);

  const { data: dioceses = [] } = useDiocesesQuery();
  // The overview carries counts, not the full row. Editing needs the real
  // state and country, or saving would overwrite them with blanks.
  const { data: allParishes = [] } = useParishesQuery();
  const { saveParish } = usePlatformMutations();

  const isFiltered = !!debouncedSearch.trim() || countSelected(filters) > 0;

  const filterSections: FilterSection[] = [
    { key: 'status', title: 'Status', options: STATUS_OPTIONS },
    ...(dioceses.length
      ? [{ key: 'diocese', title: 'Diocese', options: dioceses.map((d) => ({ value: d, label: d })) }]
      : []),
  ];

  const openEdit = (row: ParishOverviewRow) => {
    const full = allParishes.find((p) => p.id === row.parish_id);
    setDraft({
      id: row.parish_id,
      name: full?.name ?? row.parish_name,
      diocese: full?.diocese ?? row.diocese,
      city: full?.city ?? '',
      state: full?.state ?? '',
      address: full?.address ?? '',
      country: full?.country ?? '',
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    const missing = (['name', 'diocese', 'state', 'country'] as const).find(
      (key) => !draft[key].trim()
    );
    if (missing) {
      showAlert({
        title: 'Missing detail',
        message: `Please fill in the parish ${missing}.`,
        type: 'error',
      });
      return;
    }

    try {
      await saveParish.mutateAsync({
        id: draft.id ?? null,
        name: draft.name,
        diocese: draft.diocese,
        city: draft.city,
        state: draft.state,
        address: draft.address,
        country: draft.country,
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

  const renderRow = ({ item: row }: { item: ParishOverviewRow }) => (
    <Card elevation="sm" style={{ padding: 14, borderRadius: radius.lg, marginBottom: 10 }}>
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, color: colors.text, fontFamily: typography.fontFamily.bold }}>
            {row.parish_name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              marginTop: 2,
            }}
          >
            {row.diocese}
          </Text>
        </View>
        <TouchableOpacity onPress={() => openEdit(row)} hitSlop={8}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statRow}>
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, fontFamily: typography.fontFamily.medium }}
        >
          {row.member_count} {Number(row.member_count) === 1 ? 'member' : 'members'}
        </Text>
        {Number(row.admin_count) === 0 ? (
          <Badge label="No admin" variant="warning" size="sm" />
        ) : (
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.medium,
            }}
          >
            {row.admin_count} {Number(row.admin_count) === 1 ? 'admin' : 'admins'}
          </Text>
        )}
        {Number(row.unverified_payments) > 0 && (
          <Badge label={`${row.unverified_payments} unverified`} variant="warning" size="sm" />
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.fill}>
      <PlatformListControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search parishes or dioceses"
        filterSections={filterSections}
        appliedFilters={filters}
        onApplyFilters={setFilters}
      />

      <FlatList
        data={rows}
        keyExtractor={(row) => row.parish_id}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (overview.hasNextPage && !overview.isFetchingNextPage) overview.fetchNextPage();
        }}
        refreshing={overview.isRefetching && !overview.isFetchingNextPage}
        onRefresh={() => overview.refetch()}
        ListEmptyComponent={
          <PlatformListEmpty
            isLoading={overview.isLoading}
            isFiltered={isFiltered}
            emptyText="No parishes yet. Tap + to add the first one."
          />
        }
        ListFooterComponent={
          <PlatformListFooter
            isFetchingNextPage={overview.isFetchingNextPage}
            hasNextPage={!!overview.hasNextPage}
            shownCount={rows.length}
          />
        }
      />

      <FloatingActionButton
        accessibilityLabel="Add a parish"
        onPress={() => setDraft({ ...EMPTY })}
      />

      <Modal visible={!!draft} transparent animationType="fade" statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.backdrop}
        >
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
                {draft?.id ? 'Edit parish' : 'New parish'}
              </Text>

              <Label label="Name" />
              <Input
                placeholder="Sacred Heart Catholic Cathedral, Warri"
                value={draft?.name ?? ''}
                onChangeText={(v) => setDraft((d) => (d ? { ...d, name: v } : d))}
              />

              <View style={styles.field}>
                <Label label="Diocese" />
                <Input
                  placeholder="Warri"
                  value={draft?.diocese ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, diocese: v } : d))}
                />
              </View>

              <View style={styles.field}>
                <Label label="City" helperText="Optional" />
                <Input
                  placeholder="Effurun"
                  value={draft?.city ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, city: v } : d))}
                />
              </View>

              <View style={styles.field}>
                <Label label="State" />
                <Input
                  placeholder="Delta"
                  value={draft?.state ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, state: v } : d))}
                />
              </View>

              <View style={styles.field}>
                <Label label="Address" helperText="Optional. Street address parishioners can navigate to" />
                <Input
                  placeholder="1 Mission Road"
                  value={draft?.address ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, address: v } : d))}
                />
              </View>

              <View style={styles.field}>
                <Label label="Country" />
                <Input
                  placeholder="Nigeria"
                  value={draft?.country ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, country: v } : d))}
                />
              </View>

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
                  loading={saveParish.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // Bottom padding lets the last card scroll clear of the floating button.
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100, flexGrow: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 36 },
  field: { marginTop: 12 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
});
