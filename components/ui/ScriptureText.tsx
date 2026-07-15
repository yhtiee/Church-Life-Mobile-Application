import React, { useMemo, useState } from 'react';
import { Text, View, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { segmentsFromNotes, type Note } from '@/lib/bible/douayRheims';

interface ScriptureTextProps {
  /** Raw verse text with <na>/<cr>/<i> markup. */
  rawText: string;
  /** Resolved notes/cross-refs for the verse (as produced by BibleService). */
  notes?: Note[];
  /** Base text style. */
  color: string;
  fontSize: number;
  lineHeight: number;
  fontFamily?: string;
  italic?: boolean;
  /** Colour for the tappable footnote markers. */
  markerColor?: string;
}

/**
 * Renders Douay-Rheims verse text with tappable footnote / cross-reference
 * markers. Tapping a marker opens the Challoner annotation in a modal.
 *
 * Markup is parsed here, so callers pass the ORIGINAL text (with tags), not the
 * stripped preview text.
 */
export function ScriptureText({
  rawText,
  notes,
  color,
  fontSize,
  lineHeight,
  fontFamily,
  italic,
  markerColor = '#D4AF37',
}: ScriptureTextProps) {
  const { colors, typography, radius } = useTheme();
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const segments = useMemo(
    () => segmentsFromNotes(rawText, notes ?? []),
    [rawText, notes],
  );

  const baseStyle = { color, fontSize, lineHeight, fontFamily, fontStyle: italic ? 'italic' : 'normal' } as const;

  return (
    <>
      <Text style={baseStyle}>
        {segments.map((seg, i) => {
          if (seg.type === 'text') return <Text key={i} style={baseStyle}>{seg.text}</Text>;
          if (seg.type === 'italic') {
            return (
              <Text key={i} style={[baseStyle, { fontStyle: 'italic' }]}>
                {seg.text}
              </Text>
            );
          }
          // marker — tappable superscript
          return (
            <Text
              key={i}
              onPress={() => setActiveNote(seg.note)}
              style={{
                color: markerColor,
                fontSize: fontSize * 0.7,
                fontFamily: fontFamily ?? typography.fontFamily.bold,
                lineHeight,
              }}
              accessibilityRole="button"
              accessibilityLabel={
                seg.note.kind === 'crossref' ? 'Cross reference' : `Footnote ${seg.label}`
              }
            >
              {' '}
              {seg.note.kind === 'crossref' ? '✝' : `[${seg.label}]`}
            </Text>
          );
        })}
      </Text>

      <Modal
        visible={!!activeNote}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveNote(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setActiveNote(null)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Ionicons
                name={activeNote?.kind === 'crossref' ? 'git-compare-outline' : 'bookmark-outline'}
                size={18}
                color={markerColor}
              />
              <Text style={[styles.sheetTitle, { color: markerColor, fontFamily: typography.fontFamily.semiBold }]}>
                {activeNote?.kind === 'crossref' ? 'Cross Reference' : `Note ${activeNote?.label ?? ''}`}
              </Text>
              <Pressable onPress={() => setActiveNote(null)} hitSlop={10} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <Text style={{ color: colors.text, fontSize: 15, lineHeight: 24, fontFamily: typography.fontFamily.regular }}>
                {activeNote?.text || 'No commentary available for this note.'}
              </Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    padding: 20,
    borderWidth: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
