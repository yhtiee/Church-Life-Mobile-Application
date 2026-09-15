import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useParishScheduleQuery } from '@/hooks/queries/useParishContent';
import { useScheduleMutations } from '@/hooks/mutations/useParishContent';
import type { DatabaseScheduleItem, ScheduleKind } from '@/lib/supabase/entities/types';

const TABS: { kind: ScheduleKind; title: string; blurb: string }[] = [
  { kind: 'mass', title: 'Mass Times', blurb: 'Days and the times mass is celebrated.' },
  { kind: 'devotion', title: 'Devotions', blurb: 'Adoration, novenas and other devotions.' },
  { kind: 'sacrament', title: 'Sacraments', blurb: 'Confession times and similar notices.' },
];

interface DraftState {
  id?: string;
  label: string;
  times: string;
  details: string;
}

const EMPTY: DraftState = { label: '', times: '', details: '' };

export default function AdminSchedulesScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [activeKind, setActiveKind] = useState<ScheduleKind>('mass');
  const [draft, setDraft] = useState<DraftState | null>(null);

  const parishId = user?.parishId ?? undefined;
  const { data: items = [], isLoading } = useParishScheduleQuery(parishId);
  const { create, update, remove } = useScheduleMutations(parishId);

  const visible = useMemo(
    () => items.filter((i) => i.kind === activeKind),
    [items, activeKind]
  );

  const isMass = activeKind === 'mass';
  const busy = create.isPending || update.isPending || remove.isPending;

  const openNew = () => setDraft({ ...EMPTY });

  const openEdit = (item: DatabaseScheduleItem) =>
    setDraft({
      id: item.id,
      label: item.label,
      times: (item.times || []).join(', '),
      details: item.details ?? '',
    });

  const save = async () => {
    if (!draft || !parishId) return;

    const label = draft.label.trim();
    if (!label) {
      showAlert({ title: 'Name required', message: 'Give this entry a name.', type: 'error' });
      return;
    }

    // Times are typed as a comma separated list, which is far quicker than a
    // row of pickers for something edited rarely.
    const times = isMass
      ? draft.times.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    if (isMass && times.length === 0) {
      showAlert({
        title: 'Times required',
        message: 'Add at least one time, separated by commas.',
        type: 'error',
      });
      return;
    }

    try {
      if (draft.id) {
        await update.mutateAsync({
          id: draft.id,
          updates: { label, times, details: draft.details.trim() || null },
        });
      } else {
        await create.mutateAsync({
          parish_id: parishId,
          kind: activeKind,
          label,
          times,
          details: draft.details.trim() || null,
          sort_order: visible.length,
        });
      }
      setDraft(null);
    } catch (err: any) {
      showAlert({
        title: 'Could not save',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const confirmDelete = (item: DatabaseScheduleItem) => {
    showAlert({
      title: `Remove ${item.label}?`,
      message: 'Members will no longer see this on the mass schedule screen.',
      type: 'error',
      buttonLabel: 'Remove',
      onPress: async () => {
        try {
          await remove.mutateAsync(item.id);
        } catch (err: any) {
          showAlert({
            title: 'Could not remove',
            message: err?.message || 'Please try again.',
            type: 'error',
          });
        }
      },
      secondaryButtonLabel: 'Cancel',
    });
  };

  const activeTab = TABS.find((t) => t.kind === activeKind)!;

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Parish Schedules" />

      <View style={[styles.tabs, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md }]}>
        {TABS.map((tab) => {
          const active = tab.kind === activeKind;
          return (
            <TouchableOpacity
              key={tab.kind}
              onPress={() => setActiveKind(tab.kind)}
              style={[
                styles.tab,
                active && { backgroundColor: colors.surface, borderRadius: radius.sm },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: active ? colors.primary : colors.textMuted,
                  fontFamily: active ? typography.fontFamily.bold : typography.fontFamily.medium,
                }}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            marginBottom: 14,
          }}
        >
          {activeTab.blurb}
        </Text>

        {visible.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(350)}>
            <Card elevation="sm" style={{ padding: 14, borderRadius: radius.lg, marginBottom: 10 }}>
              <View style={styles.itemRow}>
                <View style={styles.itemCopy}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: colors.text,
                      fontFamily: typography.fontFamily.bold,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      marginTop: 4,
                      lineHeight: 19,
                    }}
                  >
                    {item.kind === 'mass'
                      ? (item.times || []).join(' · ')
                      : item.details || 'No description yet'}
                  </Text>
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => openEdit(item)} disabled={busy} hitSlop={8}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item)} disabled={busy} hitSlop={8}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}

        {visible.length === 0 && !isLoading && (
          <Text
            style={{
              fontSize: 14,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              textAlign: 'center',
              marginTop: 30,
            }}
          >
            Nothing here yet. Add the first one.
          </Text>
        )}

        <Button
          label={`Add ${isMass ? 'a mass day' : activeKind}`}
          onPress={openNew}
          variant="secondary"
          fullWidth
          style={{ marginTop: 18 }}
        />
      </ScrollView>

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
                {draft?.id ? 'Edit entry' : 'New entry'}
              </Text>

              <Label label={isMass ? 'Day' : 'Name'} />
              <Input
                placeholder={isMass ? 'Sunday' : 'Eucharistic Adoration'}
                value={draft?.label ?? ''}
                onChangeText={(v) => setDraft((d) => (d ? { ...d, label: v } : d))}
              />

              {isMass ? (
                <>
                  <Label label="Times" helperText="Separate each with a comma" />
                  <Input
                    placeholder="6:00 AM, 8:30 AM, 6:00 PM"
                    value={draft?.times ?? ''}
                    onChangeText={(v) => setDraft((d) => (d ? { ...d, times: v } : d))}
                  />
                </>
              ) : (
                <>
                  <Label label="Details" />
                  <Input
                    placeholder="When it happens and anything members should know"
                    value={draft?.details ?? ''}
                    onChangeText={(v) => setDraft((d) => (d ? { ...d, details: v } : d))}
                    multiline
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top' }}
                  />
                </>
              )}

              <View style={styles.sheetActions}>
                <Button
                  label="Cancel"
                  onPress={() => setDraft(null)}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Button label="Save" onPress={save} loading={busy} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <GlobalLoader visible={isLoading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', marginHorizontal: 20, padding: 4, marginTop: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9 },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 60 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  itemCopy: { flex: 1 },
  itemActions: { flexDirection: 'row', gap: 16, paddingTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 36 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
});
