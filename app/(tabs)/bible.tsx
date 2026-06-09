import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

// ── Bible data ─────────────────────────────────────────────────────────────────
interface BibleBook {
  name: string;
  abbr: string;
  bookId: string;    // exact ID for /data/kjv/BOOK_ID/CHAPTER
  chapters: number;
  testament: 'OT' | 'NT';
}

const BIBLE_BOOKS: BibleBook[] = [
  // ─ Old Testament ─
  { name: 'Genesis',         abbr: 'Gen', bookId: 'GEN', chapters: 50,  testament: 'OT' },
  { name: 'Exodus',          abbr: 'Exo', bookId: 'EXO', chapters: 40,  testament: 'OT' },
  { name: 'Leviticus',       abbr: 'Lev', bookId: 'LEV', chapters: 27,  testament: 'OT' },
  { name: 'Numbers',         abbr: 'Num', bookId: 'NUM', chapters: 36,  testament: 'OT' },
  { name: 'Deuteronomy',     abbr: 'Deu', bookId: 'DEU', chapters: 34,  testament: 'OT' },
  { name: 'Joshua',          abbr: 'Jos', bookId: 'JOS', chapters: 24,  testament: 'OT' },
  { name: 'Judges',          abbr: 'Jdg', bookId: 'JDG', chapters: 21,  testament: 'OT' },
  { name: 'Ruth',            abbr: 'Rut', bookId: 'RUT', chapters: 4,   testament: 'OT' },
  { name: '1 Samuel',        abbr: '1Sa', bookId: '1SA', chapters: 31,  testament: 'OT' },
  { name: '2 Samuel',        abbr: '2Sa', bookId: '2SA', chapters: 24,  testament: 'OT' },
  { name: '1 Kings',         abbr: '1Ki', bookId: '1KI', chapters: 22,  testament: 'OT' },
  { name: '2 Kings',         abbr: '2Ki', bookId: '2KI', chapters: 25,  testament: 'OT' },
  { name: '1 Chronicles',    abbr: '1Ch', bookId: '1CH', chapters: 29,  testament: 'OT' },
  { name: '2 Chronicles',    abbr: '2Ch', bookId: '2CH', chapters: 36,  testament: 'OT' },
  { name: 'Ezra',            abbr: 'Ezr', bookId: 'EZR', chapters: 10,  testament: 'OT' },
  { name: 'Nehemiah',        abbr: 'Neh', bookId: 'NEH', chapters: 13,  testament: 'OT' },
  { name: 'Esther',          abbr: 'Est', bookId: 'EST', chapters: 10,  testament: 'OT' },
  { name: 'Job',             abbr: 'Job', bookId: 'JOB', chapters: 42,  testament: 'OT' },
  { name: 'Psalms',          abbr: 'Psa', bookId: 'PSA', chapters: 150, testament: 'OT' },
  { name: 'Proverbs',        abbr: 'Pro', bookId: 'PRO', chapters: 31,  testament: 'OT' },
  { name: 'Ecclesiastes',    abbr: 'Ecc', bookId: 'ECC', chapters: 12,  testament: 'OT' },
  { name: 'Song of Solomon', abbr: 'Sol', bookId: 'SNG', chapters: 8,   testament: 'OT' },
  { name: 'Isaiah',          abbr: 'Isa', bookId: 'ISA', chapters: 66,  testament: 'OT' },
  { name: 'Jeremiah',        abbr: 'Jer', bookId: 'JER', chapters: 52,  testament: 'OT' },
  { name: 'Lamentations',    abbr: 'Lam', bookId: 'LAM', chapters: 5,   testament: 'OT' },
  { name: 'Ezekiel',         abbr: 'Eze', bookId: 'EZK', chapters: 48,  testament: 'OT' },
  { name: 'Daniel',          abbr: 'Dan', bookId: 'DAN', chapters: 12,  testament: 'OT' },
  { name: 'Hosea',           abbr: 'Hos', bookId: 'HOS', chapters: 14,  testament: 'OT' },
  { name: 'Joel',            abbr: 'Joe', bookId: 'JOL', chapters: 3,   testament: 'OT' },
  { name: 'Amos',            abbr: 'Amo', bookId: 'AMO', chapters: 9,   testament: 'OT' },
  { name: 'Obadiah',         abbr: 'Oba', bookId: 'OBA', chapters: 1,   testament: 'OT' },
  { name: 'Jonah',           abbr: 'Jon', bookId: 'JON', chapters: 4,   testament: 'OT' },
  { name: 'Micah',           abbr: 'Mic', bookId: 'MIC', chapters: 7,   testament: 'OT' },
  { name: 'Nahum',           abbr: 'Nah', bookId: 'NAM', chapters: 3,   testament: 'OT' },
  { name: 'Habakkuk',        abbr: 'Hab', bookId: 'HAB', chapters: 3,   testament: 'OT' },
  { name: 'Zephaniah',       abbr: 'Zep', bookId: 'ZEP', chapters: 3,   testament: 'OT' },
  { name: 'Haggai',          abbr: 'Hag', bookId: 'HAG', chapters: 2,   testament: 'OT' },
  { name: 'Zechariah',       abbr: 'Zec', bookId: 'ZEC', chapters: 14,  testament: 'OT' },
  { name: 'Malachi',         abbr: 'Mal', bookId: 'MAL', chapters: 4,   testament: 'OT' },
  // ─ New Testament ─
  { name: 'Matthew',         abbr: 'Mat', bookId: 'MAT', chapters: 28,  testament: 'NT' },
  { name: 'Mark',            abbr: 'Mar', bookId: 'MRK', chapters: 16,  testament: 'NT' },
  { name: 'Luke',            abbr: 'Luk', bookId: 'LUK', chapters: 24,  testament: 'NT' },
  { name: 'John',            abbr: 'Joh', bookId: 'JHN', chapters: 21,  testament: 'NT' },
  { name: 'Acts',            abbr: 'Act', bookId: 'ACT', chapters: 28,  testament: 'NT' },
  { name: 'Romans',          abbr: 'Rom', bookId: 'ROM', chapters: 16,  testament: 'NT' },
  { name: '1 Corinthians',   abbr: '1Co', bookId: '1CO', chapters: 16,  testament: 'NT' },
  { name: '2 Corinthians',   abbr: '2Co', bookId: '2CO', chapters: 13,  testament: 'NT' },
  { name: 'Galatians',       abbr: 'Gal', bookId: 'GAL', chapters: 6,   testament: 'NT' },
  { name: 'Ephesians',       abbr: 'Eph', bookId: 'EPH', chapters: 6,   testament: 'NT' },
  { name: 'Philippians',     abbr: 'Phi', bookId: 'PHP', chapters: 4,   testament: 'NT' },
  { name: 'Colossians',      abbr: 'Col', bookId: 'COL', chapters: 4,   testament: 'NT' },
  { name: '1 Thessalonians', abbr: '1Th', bookId: '1TH', chapters: 5,   testament: 'NT' },
  { name: '2 Thessalonians', abbr: '2Th', bookId: '2TH', chapters: 3,   testament: 'NT' },
  { name: '1 Timothy',       abbr: '1Ti', bookId: '1TI', chapters: 6,   testament: 'NT' },
  { name: '2 Timothy',       abbr: '2Ti', bookId: '2TI', chapters: 4,   testament: 'NT' },
  { name: 'Titus',           abbr: 'Tit', bookId: 'TIT', chapters: 3,   testament: 'NT' },
  { name: 'Philemon',        abbr: 'Phm', bookId: 'PHM', chapters: 1,   testament: 'NT' },
  { name: 'Hebrews',         abbr: 'Heb', bookId: 'HEB', chapters: 13,  testament: 'NT' },
  { name: 'James',           abbr: 'Jam', bookId: 'JAS', chapters: 5,   testament: 'NT' },
  { name: '1 Peter',         abbr: '1Pe', bookId: '1PE', chapters: 5,   testament: 'NT' },
  { name: '2 Peter',         abbr: '2Pe', bookId: '2PE', chapters: 3,   testament: 'NT' },
  { name: '1 John',          abbr: '1Jo', bookId: '1JN', chapters: 5,   testament: 'NT' },
  { name: '2 John',          abbr: '2Jo', bookId: '2JN', chapters: 1,   testament: 'NT' },
  { name: '3 John',          abbr: '3Jo', bookId: '3JN', chapters: 1,   testament: 'NT' },
  { name: 'Jude',            abbr: 'Jud', bookId: 'JUD', chapters: 1,   testament: 'NT' },
  { name: 'Revelation',      abbr: 'Rev', bookId: 'REV', chapters: 22,  testament: 'NT' },
];

interface BibleVerse {
  verse: number;
  text: string;
}

type BibleView = 'books' | 'chapters' | 'reader';

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function BibleScreen() {
  const { colors, typography, radius } = useTheme();

  const [view, setView]                       = useState<BibleView>('books');
  const [testament, setTestament]             = useState<'OT' | 'NT'>('NT');
  const [selectedBook, setSelectedBook]       = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses]                   = useState<BibleVerse[]>([]);
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
      // Parameterized API: /data/TRANSLATION/BOOK_ID/CHAPTER
      const url = `https://bible-api.com/data/kjv/${book.bookId}/${chapter}`;
      const res = await fetch(url);

      const text = await res.text();
      if (!res.ok || text.trim().startsWith('<')) {
        setError('Could not load this passage. Please try again.');
        return;
      }

      const data = JSON.parse(text);

      // /data endpoint returns { verses: [{verse, text}, ...] }
      const verseList: any[] = Array.isArray(data) ? data : (data.verses ?? []);
      if (verseList.length > 0) {
        setVerses(verseList.map((v: any) => ({ verse: v.verse, text: (v.text ?? '').trim() })));
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('No verses found for this passage.');
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
                  <Text style={[styles.verseText, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
                    {v.text}
                  </Text>
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
