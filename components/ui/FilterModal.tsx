import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';

export interface FilterSection {
  key: string;
  title: string;
  options: { value: string; label: string }[];
}

/** Ticked option values, keyed by section. */
export type FilterSelection = Record<string, string[]>;

interface Props {
  visible: boolean;
  sections: FilterSection[];
  /** The filters currently applied to the list. */
  applied: FilterSelection;
  onApply: (selection: FilterSelection) => void;
  onClose: () => void;
}

/** Total ticked options across every section, for the badge on the filter icon. */
export function countSelected(selection: FilterSelection): number {
  return Object.values(selection).reduce((sum, values) => sum + values.length, 0);
}

/**
 * Checkbox filters in a bottom sheet.
 *
 * Ticks are held as a draft and only reach the list on Apply, so exploring
 * options does not refetch on every tap, and closing the sheet discards
 * them. Within a section ticked options are alternatives; separate sections
 * narrow the list together.
 */
export function FilterModal({ visible, sections, applied, onApply, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      {/* Mounted only while open, so each opening starts from the applied
          filters rather than from ticks left behind by a cancelled visit. */}
      {visible && <FilterSheet sections={sections} applied={applied} onApply={onApply} onClose={onClose} />}
    </Modal>
  );
}

function FilterSheet({ sections, applied, onApply, onClose }: Omit<Props, 'visible'>) {
  const { colors, typography, radius } = useTheme();
  const [draft, setDraft] = useState<FilterSelection>(applied);

  const toggle = (sectionKey: string, value: string) =>
    setDraft((current) => {
      const ticked = current[sectionKey] ?? [];
      return {
        ...current,
        [sectionKey]: ticked.includes(value)
          ? ticked.filter((v) => v !== value)
          : [...ticked, value],
      };
    });

  const draftCount = countSelected(draft);

  return (
    <View style={styles.backdrop}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
        ]}
      >
        <View style={styles.header}>
          <Text style={{ fontSize: 17, color: colors.text, fontFamily: typography.fontFamily.bold }}>
            Filters
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close filters">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.key} style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.textMuted, fontFamily: typography.fontFamily.semiBold },
                ]}
              >
                {section.title}
              </Text>

              {section.options.map((option) => {
                const checked = (draft[section.key] ?? []).includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => toggle(section.key, option.value)}
                    style={[styles.optionRow, { borderBottomColor: colors.divider }]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        color: colors.text,
                        fontFamily: checked ? typography.fontFamily.semiBold : typography.fontFamily.regular,
                      }}
                    >
                      {option.label}
                    </Text>
                    <Ionicons
                      name={checked ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={checked ? colors.primary : colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={[styles.actions, { borderTopColor: colors.divider }]}>
          <Button
            label="Clear all"
            variant="secondary"
            disabled={draftCount === 0}
            onPress={() => setDraft({})}
            style={{ flex: 1 }}
          />
          <Button
            label={draftCount > 0 ? `Apply (${draftCount})` : 'Apply'}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={{ flex: 1, borderRadius: radius.md }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '80%', paddingTop: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 6,
  },
  body: { paddingHorizontal: 22 },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
});
