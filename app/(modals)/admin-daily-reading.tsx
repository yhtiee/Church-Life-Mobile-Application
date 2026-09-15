import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
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
import {
  useParishDailyReadingQuery,
  useRecentParishReadingsQuery,
} from '@/hooks/queries/useParishContent';
import {
  useDeleteDailyReadingMutation,
  useSaveDailyReadingMutation,
} from '@/hooks/mutations/useParishContent';
import { toDateKey } from '@/lib/supabase/services/parishContent';

function shiftDate(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const next = new Date(y, m - 1, d + days);
  return toDateKey(next);
}

function prettyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const FIELDS = [
  { key: 'first_reading', label: 'First Reading', placeholder: 'Isaiah 55:1-3' },
  { key: 'psalm', label: 'Responsorial Psalm', placeholder: 'Psalm 145:8-9' },
  { key: 'second_reading', label: 'Second Reading', placeholder: 'Romans 8:35, 37-39' },
  { key: 'gospel', label: 'Gospel', placeholder: 'Matthew 14:13-21' },
] as const;

type ReadingForm = {
  first_reading: string;
  psalm: string;
  second_reading: string;
  gospel: string;
  reflection: string;
  author: string;
};

/**
 * The editable fields, held in local state.
 *
 * The parent gives this a `key` built from the selected date and the saved
 * row, so switching days remounts it with fresh values. Syncing via an effect
 * instead would write state during an effect pass, which React Compiler
 * rightly flags, and would clobber unsaved edits on any refetch.
 */
function ReadingFields({
  initial,
  saving,
  onSave,
}: {
  initial: ReadingForm;
  saving: boolean;
  onSave: (form: ReadingForm) => void;
}) {
  const { colors, typography } = useTheme();
  const [form, setForm] = useState<ReadingForm>(initial);

  const set = (key: keyof ReadingForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <>
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.block}>
        {FIELDS.map((field) => (
          <View key={field.key} style={styles.field}>
            <Label label={field.label} />
            <Input
              placeholder={field.placeholder}
              value={form[field.key]}
              onChangeText={(v) => set(field.key, v)}
            />
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.block}>
        <Label label="Reflection" helperText="Shown under the readings" />
        <Input
          placeholder="A short reflection for your parish"
          value={form.reflection}
          onChangeText={(v) => set('reflection', v)}
          multiline
          numberOfLines={6}
          style={{ height: 140, textAlignVertical: 'top' }}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.block}>
        <Label label="Attributed to" helperText="Optional" />
        <Input
          placeholder="Fr. Emmanuel"
          value={form.author}
          onChangeText={(v) => set('author', v)}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.block}>
        <Button label="Save reading" onPress={() => onSave(form)} loading={saving} fullWidth />
        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Days you leave empty fall back to the app&apos;s scripture verse.
        </Text>
      </Animated.View>
    </>
  );
}

export default function AdminDailyReadingScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const parishId = user?.parishId ?? undefined;
  const [dateKey, setDateKey] = useState(toDateKey());

  const { data: existing, isLoading } = useParishDailyReadingQuery(parishId, dateKey);
  const { data: recent = [] } = useRecentParishReadingsQuery(parishId);
  const { mutateAsync: save, isPending: saving } = useSaveDailyReadingMutation(parishId);
  const { mutateAsync: remove, isPending: removing } = useDeleteDailyReadingMutation(parishId);

  const initialForm: ReadingForm = {
    first_reading: existing?.first_reading ?? '',
    psalm: existing?.psalm ?? '',
    second_reading: existing?.second_reading ?? '',
    gospel: existing?.gospel ?? '',
    reflection: existing?.reflection ?? '',
    author: existing?.author ?? '',
  };

  const handleSave = async (form: ReadingForm) => {
    if (!parishId) return;

    const hasAnything = Object.values(form).some((v) => v.trim());
    if (!hasAnything) {
      showAlert({
        title: 'Nothing to save',
        message: 'Add at least one reading or a reflection.',
        type: 'error',
      });
      return;
    }

    try {
      await save({
        parish_id: parishId,
        reading_date: dateKey,
        first_reading: form.first_reading.trim() || null,
        psalm: form.psalm.trim() || null,
        second_reading: form.second_reading.trim() || null,
        gospel: form.gospel.trim() || null,
        reflection: form.reflection.trim() || null,
        author: form.author.trim() || null,
        created_by: user?.id,
      });
      showAlert({
        title: 'Saved',
        message: `Your parish will see this on ${prettyDate(dateKey)}.`,
        type: 'success',
      });
    } catch (err: any) {
      showAlert({
        title: 'Could not save',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    showAlert({
      title: 'Remove this entry?',
      message: 'The day will fall back to the app’s scripture verse.',
      type: 'error',
      buttonLabel: 'Remove',
      onPress: async () => {
        try {
          await remove(existing.id);
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

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Daily Reading" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card elevation="sm" style={{ padding: 14, borderRadius: radius.lg }}>
            <View style={styles.dateRow}>
              <TouchableOpacity onPress={() => setDateKey(shiftDate(dateKey, -1))} hitSlop={10}>
                <Ionicons name="chevron-back" size={22} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.dateCopy}>
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                  }}
                >
                  {prettyDate(dateKey)}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: existing ? colors.primary : colors.textMuted,
                    fontFamily: typography.fontFamily.medium,
                    marginTop: 2,
                  }}
                >
                  {isLoading ? 'Loading…' : existing ? 'Posted' : 'Nothing posted yet'}
                </Text>
              </View>

              <TouchableOpacity onPress={() => setDateKey(shiftDate(dateKey, 1))} hitSlop={10}>
                <Ionicons name="chevron-forward" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {dateKey !== toDateKey() && (
              <TouchableOpacity onPress={() => setDateKey(toDateKey())} style={styles.todayBtn}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.primary,
                    fontFamily: typography.fontFamily.semiBold,
                  }}
                >
                  Back to today
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        </Animated.View>

        <ReadingFields
          key={`${dateKey}:${existing?.updated_at ?? 'new'}`}
          initial={initialForm}
          saving={saving}
          onSave={handleSave}
        />

        {existing && (
          <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.block}>
            <Button
              label="Remove entry"
              onPress={handleDelete}
              variant="secondary"
              loading={removing}
              fullWidth
            />
          </Animated.View>
        )}

        {recent.length > 0 && (
          <Animated.View entering={FadeInDown.delay(320).duration(400)} style={styles.block}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
              ]}
            >
              Recently posted
            </Text>
            {recent.slice(0, 8).map((r) => (
              <TouchableOpacity key={r.id} onPress={() => setDateKey(r.reading_date)}>
                <Card
                  elevation="sm"
                  style={{ padding: 12, borderRadius: radius.md, marginTop: 8 }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.text,
                      fontFamily: typography.fontFamily.semiBold,
                    }}
                  >
                    {prettyDate(r.reading_date)}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      color: colors.textMuted,
                      fontFamily: typography.fontFamily.regular,
                      marginTop: 2,
                    }}
                  >
                    {r.gospel || r.first_reading || r.reflection || '—'}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },
  block: { marginTop: 18 },
  field: { marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateCopy: { flex: 1, alignItems: 'center' },
  todayBtn: { alignItems: 'center', marginTop: 10 },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
});
