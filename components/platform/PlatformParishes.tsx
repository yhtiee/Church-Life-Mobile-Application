import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/FeedbackContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useParishOverviewQuery } from '@/hooks/queries/usePlatform';
import { usePlatformMutations } from '@/hooks/mutations/usePlatform';
import type { ParishOverviewRow } from '@/lib/supabase/entities/types';

interface Draft {
  id?: string;
  name: string;
  diocese: string;
  state: string;
  country: string;
}

const EMPTY: Draft = { name: '', diocese: '', state: '', country: 'Nigeria' };

/** Create and edit parishes, with the counts that show which ones are stalled. */
export function PlatformParishes() {
  const { colors, typography, radius } = useTheme();
  const { showAlert } = useAlert();

  const [draft, setDraft] = useState<Draft | null>(null);
  const { data: parishes = [], isLoading } = useParishOverviewQuery();
  const { saveParish } = usePlatformMutations();

  const openEdit = (row: ParishOverviewRow) =>
    setDraft({
      id: row.parish_id,
      name: row.parish_name,
      diocese: row.diocese,
      // The overview returns counts, not the full row, so these are filled in
      // by the admin when editing rather than pre-populated with a guess.
      state: '',
      country: '',
    });

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      showAlert({ title: 'Name required', message: 'Give the parish a name.', type: 'error' });
      return;
    }

    try {
      await saveParish.mutateAsync({
        id: draft.id ?? null,
        name: draft.name,
        diocese: draft.diocese,
        state: draft.state,
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

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            lineHeight: 20,
            marginBottom: 14,
          }}
        >
          A new parish starts with the standard mass, confession and devotion schedule, and needs an
          admin appointed under People before anyone can manage it.
        </Text>

        {parishes.map((row, index) => (
          <Animated.View key={row.parish_id} entering={FadeInDown.delay(index * 30).duration(320)}>
            <Card elevation="sm" style={{ padding: 14, borderRadius: radius.lg, marginBottom: 10 }}>
              <View style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.text,
                      fontFamily: typography.fontFamily.bold,
                    }}
                  >
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
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.medium,
                  }}
                >
                  {row.member_count} {row.member_count === 1 ? 'member' : 'members'}
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
                  <Badge
                    label={`${row.unverified_payments} unverified`}
                    variant="warning"
                    size="sm"
                  />
                )}
              </View>
            </Card>
          </Animated.View>
        ))}

        <Button
          label="Add a parish"
          onPress={() => setDraft({ ...EMPTY })}
          variant="secondary"
          fullWidth
          style={{ marginTop: 12 }}
        />
      </ScrollView>

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
                <Label label="State" />
                <Input
                  placeholder="Delta"
                  value={draft?.state ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, state: v } : d))}
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
        </View>
      </Modal>

      <GlobalLoader visible={isLoading} />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 60 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 36 },
  field: { marginTop: 12 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
});
