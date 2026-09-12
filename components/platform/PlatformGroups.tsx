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
import { useGroupsQuery } from '@/hooks/queries/useGroups';
import { usePlatformMutations } from '@/hooks/mutations/usePlatform';
import type { Group } from '@/lib/supabase/entities/types';

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

  const [draft, setDraft] = useState<Draft | null>(null);
  const { data: groups = [] } = useGroupsQuery();
  const { saveGlobalGroup } = usePlatformMutations();

  const globalGroups = groups.filter((g: Group) => !g.parish_id);

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
          These groups are available in every parish. Secured groups need a parish admin to approve
          each member who asks to join.
        </Text>

        {globalGroups.map((group: Group, index: number) => (
          <Animated.View key={group.id} entering={FadeInDown.delay(index * 30).duration(320)}>
            <Card elevation="sm" style={{ padding: 14, borderRadius: radius.lg, marginBottom: 10 }}>
              <View style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: colors.text,
                        fontFamily: typography.fontFamily.bold,
                      }}
                    >
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
          </Animated.View>
        ))}

        <Button
          label="Add a group"
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
                    style={{
                      fontSize: 14,
                      color: colors.text,
                      fontFamily: typography.fontFamily.medium,
                    }}
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
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 60 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 36 },
  field: { marginTop: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 18 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
});
