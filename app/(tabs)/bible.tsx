import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ScriptureText } from '@/components/ui/ScriptureText';
import { DR_BOOKS, type DouayBook } from '@/lib/bible/douayRheims';
import { BibleService, type ChapterVerse } from '@/lib/supabase/services/bible';

// ── Bible data ─────────────────────────────────────────────────────────────────
// Canon + markup parser live in lib/bible/douayRheims. Douay-Rheims (Catholic).
type BibleBook = DouayBook;
const BIBLE_BOOKS = DR_BOOKS;
const bibleService = new BibleService();

type BibleView = 'books' | 'chapters' | 'reader';

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function BibleScreen() {
  const { colors, typography, radius } = useTheme();

  const [view, setView]                       = useState<BibleView>('books');
  const [testament, setTestament]             = useState<'OT' | 'NT'>('NT');
  const [selectedBook, setSelectedBook]       = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses]                   = useState<ChapterVerse[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  const filteredBooks = BIBLE_BOOKS.filter((b) => b.testament === testament);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setView('chapters');
  };

  const fetchChapter = async (book: BibleBook, chapter: number) => {
    setLoading(true);
    setError(null);
    setVerses([]);
    try {
      // Douay-Rheims API: /api/chapter/:slug/:chapter (parsed by BibleService).
      const chapterVerses = await bibleService.getChapter(book.slug, chapter);
      if (chapterVerses && chapterVerses.length > 0) {
        setVerses(chapterVerses);
      } else {
        setError('Could not load this passage. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChapter = (chapter: number) => {
    if (!selectedBook) return;
    setSelectedChapter(chapter);
    setView('reader');
    fetchChapter(selectedBook, chapter);
  };

  const goBack = () => {
    if (view === 'reader') {
      setView('chapters');
      setVerses([]);
    } else if (view === 'chapters') {
      setView('books');
      setSelectedBook(null);
    }
  };

  // ── Dynamic header title ──────────────────────────────────────────────────
  const headerTitle =
    view === 'books'    ? 'Bible' :
    view === 'chapters' ? (selectedBook?.name ?? 'Chapters') :
                          `${selectedBook?.name} ${selectedChapter}`;

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={headerTitle}
        showBack={view !== 'books'}
        onBack={goBack}
      />

      {/* ══ VIEW: Book List ═══════════════════════════════════════════════════ */}
      {view === 'books' && (
        <View style={{ flex: 1 }}>
          {/* OT / NT switcher */}
          <View style={[styles.testamentBar, { borderBottomColor: colors.divider }]}>
            {(['OT', 'NT'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.testamentTab,
                  testament === t && { borderBottomColor: colors.primary },
                ]}
                onPress={() => setTestament(t)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.testamentTabText,
                    {
                      color: testament === t ? colors.primary : colors.textMuted,
                      fontFamily: testament === t
                        ? typography.fontFamily.bold
                        : typography.fontFamily.regular,
                    },
                  ]}
                >
                  {t === 'OT' ? 'Old Testament' : 'New Testament'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Book rows */}
          <ScrollView
            contentContainerStyle={styles.bookList}
            showsVerticalScrollIndicator={false}
          >
            {filteredBooks.map((book, i) => (
              <Animated.View key={book.name} entering={FadeInDown.delay(i * 20).duration(280)}>
                <TouchableOpacity
                  style={[
                    styles.bookRow,
                    { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
                  ]}
                  onPress={() => handleSelectBook(book)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.bookAbbr, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.bookAbbrText, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
                      {book.abbr}
                    </Text>
                  </View>

                  <Text style={[styles.bookName, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                    {book.name}
                  </Text>

                  <Text style={[styles.bookChapters, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                    {book.chapters} {book.chapters === 1 ? 'ch' : 'chs'}
                  </Text>

                  <Ionicons name="chevron-forward" size={15} color={colors.border} />
                </TouchableOpacity>
              </Animated.View>
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      )}

      {/* ══ VIEW: Chapter Grid ════════════════════════════════════════════════ */}
      {view === 'chapters' && selectedBook && (
        <View style={{ flex: 1 }}>
          <Text style={[styles.subHint, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
            Select a chapter to read
          </Text>

          <ScrollView
            contentContainerStyle={styles.chapterGrid}
            showsVerticalScrollIndicator={false}
          >
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
              <Animated.View key={ch} entering={FadeInDown.delay((ch - 1) * 8).duration(220)}>
                <TouchableOpacity
                  style={[styles.chapterCell, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSelectChapter(ch)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chapterNum, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {ch}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
            <View style={{ height: 120, width: '100%' }} />
          </ScrollView>
        </View>
      )}

      {/* ══ VIEW: Verse Reader ════════════════════════════════════════════════ */}
      {view === 'reader' && (
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.stateText, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                Loading chapter...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.border} />
              <Text style={[styles.stateText, { color: colors.textMuted, fontFamily: typography.fontFamily.regular, textAlign: 'center' }]}>
                {error}
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => selectedBook && selectedChapter && fetchChapter(selectedBook, selectedChapter)}
                activeOpacity={0.75}
              >
                <Ionicons name="refresh-outline" size={14} color={colors.primary} />
                <Text style={[styles.retryText, { color: colors.primary, fontFamily: typography.fontFamily.semiBold }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.readerContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Chapter heading */}
              <Text style={[styles.chapterHeading, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
                Chapter {selectedChapter}
              </Text>
              <View style={[styles.headingAccent, { backgroundColor: colors.primary }]} />

              {/* Verse list */}
              {verses.map((v, i) => (
                <Animated.View
                  key={v.verse}
                  entering={FadeInDown.delay(i * 12).duration(260)}
                  style={styles.verseRow}
                >
                  <Text style={[styles.verseNum, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
                    {v.verse}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <ScriptureText
                      rawText={v.rawText}
                      notes={v.notes}
                      color={colors.text}
                      fontSize={16}
                      lineHeight={26}
                      fontFamily={typography.fontFamily.regular}
                      markerColor={colors.primary}
                    />
                  </View>
                </Animated.View>
              ))}

              {/* Chapter nav: prev / next */}
              <View style={styles.chapterNav}>
                {selectedChapter && selectedChapter > 1 && (
                  <TouchableOpacity
                    style={[styles.chapterNavBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={() => handleSelectChapter(selectedChapter - 1)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="chevron-back" size={16} color={colors.primary} />
                    <Text style={[styles.chapterNavText, { color: colors.primary, fontFamily: typography.fontFamily.semiBold }]}>
                      Ch {selectedChapter - 1}
                    </Text>
                  </TouchableOpacity>
                )}
                {selectedBook && selectedChapter && selectedChapter < selectedBook.chapters && (
                  <TouchableOpacity
                    style={[styles.chapterNavBtn, { borderColor: colors.border, backgroundColor: colors.surface, marginLeft: 'auto' }]}
                    onPress={() => handleSelectChapter(selectedChapter + 1)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chapterNavText, { color: colors.primary, fontFamily: typography.fontFamily.semiBold }]}>
                      Ch {selectedChapter + 1}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ height: 120 }} />
            </ScrollView>
          )}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // ── Testament switcher ─────────────────────────────────────────────────────
  testamentBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  testamentTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  testamentTabText: {
    fontSize: 14,
  },

  // ── Book list ──────────────────────────────────────────────────────────────
  bookList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    gap: 12,
  },
  bookAbbr: {
    width: 44,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bookAbbrText: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  bookName: {
    flex: 1,
    fontSize: 15,
  },
  bookChapters: {
    fontSize: 12,
  },

  // ── Chapter grid ───────────────────────────────────────────────────────────
  subHint: {
    fontSize: 13,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  chapterCell: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chapterNum: {
    fontSize: 16,
  },

  // ── Verse reader ───────────────────────────────────────────────────────────
  readerContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  chapterHeading: {
    fontSize: 24,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  headingAccent: {
    height: 3,
    width: 40,
    borderRadius: 2,
    marginBottom: 22,
  },
  verseRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  verseNum: {
    fontSize: 11,
    lineHeight: 24,
    width: 22,
    flexShrink: 0,
    textAlign: 'right',
    paddingTop: 1,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
  },

  // Chapter prev/next navigation
  chapterNav: {
    flexDirection: 'row',
    marginTop: 32,
  },
  chapterNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chapterNavText: {
    fontSize: 14,
  },

  // ── Shared states ──────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 4,
  },
  retryText: {
    fontSize: 14,
  },
});
