import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import hymnsData from '@/constants/new_hymns.json';

interface LyricLine {
  verse?: number;
  content: string;
  type: 'verse' | 'chorus';
}

interface Hymn {
  id: number;
  number: string;
  title: string;
  lyrics: LyricLine[];
  category: string;
}

const PAGE_SIZE = 25;

export default function HymnScreen() {
  const { colors, typography, radius } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeHymn, setActiveHymn] = useState<Hymn | null>(null);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);

  const allHymns = hymnsData.hymns as Hymn[];

  const categories = React.useMemo(() => {
    const unique = new Set(allHymns.map((h) => h.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [allHymns]);

  const filteredHymns = React.useMemo(() => {
    let result = allHymns;

    if (selectedCategory !== 'All') {
      result = result.filter(
        (h) => h.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.number.includes(q) ||
          h.title.toLowerCase().includes(q) ||
          h.category.toLowerCase().includes(q) ||
          h.lyrics.some((l) => l.content.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allHymns, selectedCategory, search]);

  const paginatedHymns = React.useMemo(() => {
    return filteredHymns.slice(0, displayedCount);
  }, [filteredHymns, displayedCount]);

  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [search, selectedCategory]);

  const handleLoadMore = () => {
    if (displayedCount < filteredHymns.length) {
      setDisplayedCount((prev) => prev + PAGE_SIZE);
    }
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader
        title={activeHymn ? `Hymn #${activeHymn.number}` : 'Parish Hymnal'}
        onBack={activeHymn ? () => setActiveHymn(null) : undefined}
      />

      {activeHymn ? (
        <Animated.View entering={FadeIn} style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lyricsScroll}
          >
            <Text
              style={[
                styles.lyricsTitle,
                { color: colors.text, fontFamily: typography.fontFamily.extraBold },
              ]}
            >
              {activeHymn.title}
            </Text>
            
            <View style={[styles.lyricsCategoryContainer, { backgroundColor: colors.primaryLight, borderRadius: radius.full }]}>
              <Text
                style={[
                  styles.lyricsCategory,
                  { color: colors.primary, fontFamily: typography.fontFamily.bold },
                ]}
              >
                {activeHymn.category.toUpperCase()}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.lyricsContainer}>
              {activeHymn.lyrics.map((lyric, idx) => {
                const isChorus = lyric.type === 'chorus';
                return (
                  <View
                    key={idx}
                    style={[
                      styles.lyricSection,
                      isChorus && {
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        padding: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.accent,
                        marginVertical: 12,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.lyricType,
                        {
                          color: isChorus ? colors.accent : colors.textMuted,
                          fontFamily: typography.fontFamily.bold,
                          marginBottom: 4,
                        },
                      ]}
                    >
                      {isChorus ? 'CHORUS' : `VERSE ${lyric.verse || (idx + 1)}`}
                    </Text>
                    <Text
                      style={[
                        styles.lyricContent,
                        {
                          color: colors.textSecondary,
                          fontFamily: isChorus
                            ? typography.fontFamily.semiBold
                            : typography.fontFamily.regular,
                          fontSize: 15,
                          lineHeight: 24,
                          textAlign: isChorus ? 'left' : 'center',
                          fontStyle: isChorus ? 'italic' : 'normal',
                        },
                      ]}
                    >
                      {lyric.content}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      ) : (
        <View style={styles.container}>
          <View style={styles.searchWrapper}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: colors.text, fontFamily: typography.fontFamily.regular },
                ]}
                placeholder="Search hymn number, title, lyrics..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.categoryScrollContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.8}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.full,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          fontFamily: isSelected
                            ? typography.fontFamily.bold
                            : typography.fontFamily.semiBold,
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={paginatedHymns}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 200)).duration(300)}>
                <TouchableOpacity
                  style={[
                    styles.hymnCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                  onPress={() => setActiveHymn(item)}
                >
                  <View style={[styles.numberBox, { backgroundColor: colors.primaryLight }]}>
                    <Text
                      style={[
                        styles.numberText,
                        { color: colors.primary, fontFamily: typography.fontFamily.bold },
                      ]}
                    >
                      {item.number}
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text
                      style={[
                        styles.hymnTitle,
                        { color: colors.text, fontFamily: typography.fontFamily.bold },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.hymnCategory,
                        { color: colors.textMuted, fontFamily: typography.fontFamily.medium },
                      ]}
                      numberOfLines={1}
                    >
                      {item.category}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevron} />
                </TouchableOpacity>
              </Animated.View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={48} color={colors.border} />
                <Text
                  style={[
                    styles.emptyText,
                    { color: colors.textMuted, fontFamily: typography.fontFamily.medium },
                  ]}
                >
                  No hymns found matching your search.
                </Text>
              </View>
            }
          />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    paddingVertical: 0,
  },
  categoryScrollContainer: {
    marginBottom: 12,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  hymnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
  },
  numberBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 14,
  },
  infoBox: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  hymnTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  hymnCategory: {
    fontSize: 11,
  },
  chevron: {
    marginLeft: 8,
  },
  lyricsScroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 80,
    alignItems: 'center',
  },
  lyricsTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  lyricsCategoryContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  lyricsCategory: {
    fontSize: 10,
    letterSpacing: 1,
  },
  divider: {
    width: '40%',
    height: 1,
    marginBottom: 24,
  },
  lyricsContainer: {
    width: '100%',
    gap: 16,
  },
  lyricSection: {
    width: '100%',
    marginBottom: 8,
  },
  lyricType: {
    fontSize: 11,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  lyricContent: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
