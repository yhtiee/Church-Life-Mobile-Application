import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, FlatList } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { usePlatformProfilesQuery } from '@/hooks/queries/usePlatform';
import { useParishesQuery } from '@/hooks/queries/useParishes';
import { usePlatformMutations } from '@/hooks/mutations/usePlatform';
import {
  PlatformListControls,
  PlatformListEmpty,
  PlatformListFooter,
  type FilterOption,
} from '@/components/platform/PlatformListControls';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { PeopleFilter } from '@/lib/supabase/services/platform';
import type { AuthUser } from '@/context/AuthContext';

const PEOPLE_FILTERS: FilterOption<PeopleFilter>[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'parish_admin', label: 'Parish admins' },
  { value: 'member', label: 'Members' },
  { value: 'super_admin', label: 'Super admins' },
  { value: 'no_parish', label: 'No parish' },
];

/**
 * Platform-wide member administration: appoint parish admins in any parish,
 * move someone to another parish, and grant or revoke platform access.
 */
export function PlatformPeople() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PeopleFilter>('all');
  const [selected, setSelected] = useState<AuthUser | null>(null);
  const [moveTo, setMoveTo] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const peopleQuery = usePlatformProfilesQuery({ search: debouncedSearch, filter });
  const people = useMemo(() => peopleQuery.data?.pages.flat() ?? [], [peopleQuery.data]);
  const isFiltered = !!debouncedSearch.trim() || filter !== 'all';
  const { data: parishes = [] } = useParishesQuery();
  const { setParishAdmin, setMemberParish, setSuperAdmin } = usePlatformMutations();

  const busy = setParishAdmin.isPending || setMemberParish.isPending || setSuperAdmin.isPending;

  const run = async (fn: () => Promise<any>, successMessage: string) => {
    try {
      const updated = await fn();
      setSelected(updated ?? null);
      showAlert({ title: 'Done', message: successMessage, type: 'success' });
    } catch (err: any) {
      showAlert({
        title: 'Could not update',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const close = () => {
    setSelected(null);
    setMoveTo(null);
  };

  const renderPerson = ({ item: person }: { item: AuthUser }) => (
    <Card
      elevation="sm"
      style={{ padding: 14, borderRadius: radius.lg, marginBottom: 10 }}
      pressable
      onPress={() => setSelected(person)}
    >
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, color: colors.text, fontFamily: typography.fontFamily.bold }}>
            {person.fullName}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              marginTop: 2,
            }}
          >
            {person.parishName || 'No parish'}
          </Text>
        </View>
        <View style={styles.badges}>
          {person.is_super_admin && <Badge label="Super admin" variant="primary" size="sm" />}
          {person.role === 'parish_admin' && <Badge label="Admin" variant="success" size="sm" />}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.fill}>
      <PlatformListControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email"
        filters={PEOPLE_FILTERS}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* People register themselves, so this list has no add button. */}
      <FlatList
        data={people}
        keyExtractor={(person) => person.id}
        renderItem={renderPerson}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (peopleQuery.hasNextPage && !peopleQuery.isFetchingNextPage) peopleQuery.fetchNextPage();
        }}
        refreshing={peopleQuery.isRefetching && !peopleQuery.isFetchingNextPage}
        onRefresh={() => peopleQuery.refetch()}
        ListEmptyComponent={
          <PlatformListEmpty
            isLoading={peopleQuery.isLoading}
            isFiltered={isFiltered}
            emptyText="No one has registered yet."
          />
        }
        ListFooterComponent={
          <PlatformListFooter
            isFetchingNextPage={peopleQuery.isFetchingNextPage}
            hasNextPage={!!peopleQuery.hasNextPage}
            shownCount={people.length}
          />
        }
      />

      <Modal visible={!!selected} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.backdrop}>
          <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.sheet,
                { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
              ]}
            >
              <Text
                style={{ fontSize: 18, color: colors.text, fontFamily: typography.fontFamily.bold }}
              >
                {selected?.fullName}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  fontFamily: typography.fontFamily.regular,
                  marginTop: 2,
                }}
              >
                {selected?.email} · {selected?.parishName || 'No parish'}
              </Text>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.semiBold,
                  marginBottom: 10,
                }}
              >
                Parish admin
              </Text>
              <Button
                label={selected?.role === 'parish_admin' ? 'Remove admin access' : 'Make parish admin'}
                variant={selected?.role === 'parish_admin' ? 'secondary' : 'primary'}
                loading={setParishAdmin.isPending}
                disabled={busy}
                fullWidth
                onPress={() =>
                  selected &&
                  run(
                    () =>
                      setParishAdmin.mutateAsync({
                        targetUserId: selected.id,
                        makeAdmin: selected.role !== 'parish_admin',
                      }),
                    selected.role === 'parish_admin'
                      ? `${selected.fullName} is no longer a parish admin.`
                      : `${selected.fullName} now administers ${selected.parishName}.`
                  )
                }
              />

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.semiBold,
                  marginBottom: 10,
                }}
              >
                Move to another parish
              </Text>
              <Dropdown
                placeholder="Choose a parish"
                options={parishes.map((p) => ({ label: `${p.name} · ${p.diocese}`, value: p.id }))}
                value={moveTo}
                onChange={setMoveTo}
                searchable
              />
              <Button
                label="Move member"
                variant="secondary"
                disabled={!moveTo || busy}
                loading={setMemberParish.isPending}
                fullWidth
                style={{ marginTop: 10 }}
                onPress={() =>
                  selected &&
                  moveTo &&
                  run(
                    () =>
                      setMemberParish.mutateAsync({ targetUserId: selected.id, parishId: moveTo }),
                    `${selected.fullName} has been moved. Their groups and duty title were cleared.`
                  )
                }
              />

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.semiBold,
                  marginBottom: 4,
                }}
              >
                Platform access
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  fontFamily: typography.fontFamily.regular,
                  marginBottom: 10,
                  lineHeight: 18,
                }}
              >
                Lets this person manage every parish on the platform.
              </Text>
              <Button
                label={selected?.is_super_admin ? 'Revoke platform access' : 'Grant platform access'}
                variant="secondary"
                loading={setSuperAdmin.isPending}
                disabled={busy || selected?.id === user?.id}
                fullWidth
                onPress={() =>
                  selected &&
                  run(
                    () =>
                      setSuperAdmin.mutateAsync({
                        targetUserId: selected.id,
                        grantAccess: !selected.is_super_admin,
                      }),
                    selected.is_super_admin
                      ? `${selected.fullName} no longer has platform access.`
                      : `${selected.fullName} now has platform access.`
                  )
                }
              />
              {selected?.id === user?.id && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                    marginTop: 8,
                    textAlign: 'center',
                  }}
                >
                  You cannot change your own platform access.
                </Text>
              )}

              <Button
                label="Close"
                onPress={close}
                variant="ghost"
                fullWidth
                style={{ marginTop: 18 }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40, flexGrow: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badges: { flexDirection: 'row', gap: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 36 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 18 },
});
