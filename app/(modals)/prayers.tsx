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
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import prayersData from '@/constants/prayers.json';
import orderOfMassData from '@/constants/order_of_mass.json';

interface PrayerSection {
  title?: string;
  content: string;
  type?: 'verse' | 'chorus' | 'refrain' | 'stanza' | 'prayer';
}

export interface Prayer {
  id: number;
  number?: string;
  title: string;
  category: string;
  content?: string;
  sections?: PrayerSection[];
  tags?: string[];
}

export interface MassPart {
  id: string;
  title: string;
  rubric?: string;
  english: {
    priest?: string;
    people?: string;
    text?: string;
  };
  latin: {
    priest?: string;
    people?: string;
    text?: string;
  };
}

export interface MassSection {
  id: string;
  sectionTitle: string;
  parts: MassPart[];
}

type MainTab = 'prayers' | 'rosary' | 'mass';
type LanguageMode = 'english' | 'latin';

const PAGE_SIZE = 25;

export default function PrayersScreen() {
  const { colors, typography, radius, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<MainTab>('prayers');
  const [massLanguage, setMassLanguage] = useState<LanguageMode>('english');

  // Prayer state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePrayer, setActivePrayer] = useState<Prayer | null>(null);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);

  const allPrayers = (prayersData?.prayers || []) as Prayer[];
  const massSections = (orderOfMassData?.sections || []) as MassSection[];

  const categories = React.useMemo(() => {
    const unique = new Set(allPrayers.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [allPrayers]);

  const filteredPrayers = React.useMemo(() => {
    let result = allPrayers;

    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.number && p.number.includes(q)) ||
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.content && p.content.toLowerCase().includes(q)) ||
          (p.sections && p.sections.some((s) => s.content.toLowerCase().includes(q))) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [allPrayers, selectedCategory, search]);

  const paginatedPrayers = React.useMemo(() => {
    return filteredPrayers.slice(0, displayedCount);
  }, [filteredPrayers, displayedCount]);

  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [search, selectedCategory]);

  const handleLoadMore = () => {
    if (displayedCount < filteredPrayers.length) {
      setDisplayedCount((prev) => prev + PAGE_SIZE);
    }
  };

  const renderTabHeader = () => (
    <View style={[styles.mainTabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.mainTabBtn, activeTab === 'prayers' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
        onPress={() => { setActiveTab('prayers'); setActivePrayer(null); }}
        activeOpacity={0.7}
      >
        <Ionicons name="heart-outline" size={18} color={activeTab === 'prayers' ? colors.primary : colors.textMuted} />
        <Text style={[styles.mainTabText, { color: activeTab === 'prayers' ? colors.primary : colors.textMuted, fontFamily: activeTab === 'prayers' ? typography.fontFamily.bold : typography.fontFamily.medium }]}>
          Prayers
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mainTabBtn, activeTab === 'rosary' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
        onPress={() => { setActiveTab('rosary'); setActivePrayer(null); }}
        activeOpacity={0.7}
      >
        <Ionicons name="rose-outline" size={18} color={activeTab === 'rosary' ? colors.primary : colors.textMuted} />
        <Text style={[styles.mainTabText, { color: activeTab === 'rosary' ? colors.primary : colors.textMuted, fontFamily: activeTab === 'rosary' ? typography.fontFamily.bold : typography.fontFamily.medium }]}>
          How to Pray Rosary
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mainTabBtn, activeTab === 'mass' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
        onPress={() => { setActiveTab('mass'); setActivePrayer(null); }}
        activeOpacity={0.7}
      >
        <Ionicons name="book-outline" size={18} color={activeTab === 'mass' ? colors.primary : colors.textMuted} />
        <Text style={[styles.mainTabText, { color: activeTab === 'mass' ? colors.primary : colors.textMuted, fontFamily: activeTab === 'mass' ? typography.fontFamily.bold : typography.fontFamily.medium }]}>
          Order of Mass
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader
        title={
          activePrayer
            ? activePrayer.number
              ? `Prayer #${activePrayer.number}`
              : 'Prayer Details'
            : activeTab === 'rosary'
            ? 'How to Pray the Rosary'
            : activeTab === 'mass'
            ? 'Order of Mass'
            : 'Catholic Prayers'
        }
        onBack={activePrayer ? () => setActivePrayer(null) : undefined}
      />

      {!activePrayer && renderTabHeader()}

      {/* ── ACTIVE PRAYER READING VIEW ── */}
      {activePrayer ? (
        <Animated.View entering={FadeIn} style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailsScroll}
          >
            <Text
              style={[
                styles.detailsTitle,
                { color: colors.text, fontFamily: typography.fontFamily.extraBold },
              ]}
            >
              {activePrayer.title}
            </Text>

            <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight, borderRadius: radius.full }]}>
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: colors.primary, fontFamily: typography.fontFamily.bold },
                ]}
              >
                {activePrayer.category.toUpperCase()}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View style={styles.prayerBody}>
              {activePrayer.sections && activePrayer.sections.length > 0 ? (
                activePrayer.sections.map((section, idx) => (
                  <View key={idx} style={styles.sectionBlock}>
                    {section.title && (
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: colors.accent, fontFamily: typography.fontFamily.bold },
                        ]}
                      >
                        {section.title}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.prayerText,
                        { color: colors.textSecondary, fontFamily: typography.fontFamily.regular },
                      ]}
                    >
                      {section.content}
                    </Text>
                  </View>
                ))
              ) : (
                <Text
                  style={[
                    styles.prayerText,
                    { color: colors.textSecondary, fontFamily: typography.fontFamily.regular },
                  ]}
                >
                  {activePrayer.content}
                </Text>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      ) : activeTab === 'prayers' ? (
        /* ── TAB 1: PRAYERS LIST ── */
        <View style={styles.container}>
          {allPrayers.length > 0 ? (
            <>
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
                    placeholder="Search prayer title, number, text..."
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

              {categories.length > 1 && (
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
              )}

              <FlatList
                data={paginatedPrayers}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.4}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.prayerCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.lg,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setActivePrayer(item)}
                  >
                    <View style={styles.prayerHeader}>
                      <View
                        style={[
                          styles.numberBadge,
                          {
                            backgroundColor: colors.primaryLight,
                            borderRadius: radius.md,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.numberText,
                            { color: colors.primary, fontFamily: typography.fontFamily.bold },
                          ]}
                        >
                          {item.number ? `#${item.number}` : '🙏'}
                        </Text>
                      </View>
                      <View style={styles.titleWrapper}>
                        <Text
                          style={[
                            styles.prayerTitle,
                            { color: colors.text, fontFamily: typography.fontFamily.bold },
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.categoryText,
                            { color: colors.textMuted, fontFamily: typography.fontFamily.regular },
                          ]}
                        >
                          {item.category}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </View>

                    <Text
                      style={[
                        styles.snippetText,
                        { color: colors.textSecondary, fontFamily: typography.fontFamily.regular },
                      ]}
                      numberOfLines={2}
                    >
                      {item.content || (item.sections && item.sections[0]?.content) || ''}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                    <Text
                      style={[
                        styles.emptyText,
                        { color: colors.textMuted, fontFamily: typography.fontFamily.medium },
                      ]}
                    >
                      No prayers found matching "{search}"
                    </Text>
                  </View>
                }
              />
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="heart-outline" size={40} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.emptyStateTitle,
                  { color: colors.text, fontFamily: typography.fontFamily.bold },
                ]}
              >
                Parish Prayer Collection
              </Text>
              <Text
                style={[
                  styles.emptyStateSub,
                  { color: colors.textMuted, fontFamily: typography.fontFamily.regular },
                ]}
              >
                No prayers have been added yet. Paste your prayers to populate this collection!
              </Text>
            </View>
          )}
        </View>
      ) : activeTab === 'rosary' ? (
        /* ── TAB 2: HOW TO PRAY ROSARY ── */
        <ScrollView contentContainerStyle={styles.tabContentScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight, borderRadius: radius.lg }]}>
            <Ionicons name="rose" size={26} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoBannerTitle, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
                How to Pray the Holy Rosary
              </Text>
              <Text style={[styles.infoBannerSub, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                Step-by-step guide with mysteries schedule for daily meditation.
              </Text>
            </View>
          </View>

          {/* START ON CRUCIFIX */}
          <View style={[styles.guideStepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.stepNum, { color: colors.accent, fontFamily: typography.fontFamily.extraBold }]}>
              START ON THE CRUCIFIX
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              1. Sign of the Cross & Apostles' Creed
            </Text>
            <Text style={[styles.stepBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              • Make the Sign of the Cross: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen."{'\n'}
              • Recite the Apostles' Creed holding the Crucifix.
            </Text>
          </View>

          {/* FIRST LARGE BEAD */}
          <View style={[styles.guideStepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.stepNum, { color: colors.accent, fontFamily: typography.fontFamily.extraBold }]}>
              FIRST LARGE BEAD
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              2. Our Father
            </Text>
            <Text style={[styles.stepBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              Pray one Our Father for the intentions of the Holy Father.
            </Text>
          </View>

          {/* NEXT 3 SMALL BEADS */}
          <View style={[styles.guideStepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.stepNum, { color: colors.accent, fontFamily: typography.fontFamily.extraBold }]}>
              NEXT 3 SMALL BEADS
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              3. Three Hail Marys (Faith, Hope & Charity)
            </Text>
            <Text style={[styles.stepBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              Pray 3 Hail Marys for an increase in the virtues of Faith, Hope, and Charity.
            </Text>
          </View>

          {/* NEXT LARGE BEAD */}
          <View style={[styles.guideStepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.stepNum, { color: colors.accent, fontFamily: typography.fontFamily.extraBold }]}>
              NEXT LARGE BEAD
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              4. Glory Be & First Mystery
            </Text>
            <Text style={[styles.stepBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              • Pray one Glory Be.{'\n'}
              • Announce the 1st Mystery of the day and offer your intentions.{'\n'}
              • Pray one Our Father.
            </Text>
          </View>

          {/* THE 5 DECADES */}
          <View style={[styles.guideStepCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
            <Text style={[styles.stepNum, { color: colors.primary, fontFamily: typography.fontFamily.extraBold }]}>
              FOR EACH MYSTERY (5 DECADES TOTAL)
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              5. Structure for Each Decade
            </Text>
            <Text style={[styles.stepBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              Repeat this 5 times, moving around the circle of beads:{'\n\n'}
              1. Announce the Mystery.{'\n'}
              2. Pray 1 Our Father on the large bead.{'\n'}
              3. Pray 10 Hail Marys — one on each of the 10 small beads.{'\n'}
              4. Pray 1 Glory Be.{'\n'}
              5. Pray the Fatima Prayer: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those in most need of Thy mercy."
            </Text>
          </View>

          {/* MYSTERIES SCHEDULE BY DAY */}
          <View style={[styles.guideStepCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Text style={[styles.stepNum, { color: colors.primary, fontFamily: typography.fontFamily.extraBold }]}>
              DAILY MYSTERIES ROTATION
            </Text>
            <Text style={[styles.stepTitle, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
              Mysteries Schedule by Day
            </Text>
            <Text style={[styles.stepBody, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              • Monday & Saturday: Joyful Mysteries{'\n'}
              • Tuesday & Friday: Sorrowful Mysteries{'\n'}
              • Wednesday & Sunday: Glorious Mysteries{'\n'}
              • Thursday: Luminous Mysteries (Light)
            </Text>
          </View>

          {/* CONCLUDING ON MEDAL */}
          <View style={[styles.guideStepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.stepNum, { color: colors.accent, fontFamily: typography.fontFamily.extraBold }]}>
              AFTER THE 5TH MYSTERY
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              6. Concluding Prayers (On the Medal)
            </Text>
            <Text style={[styles.stepBody, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              1. Pray the Hail, Holy Queen.{'\n'}
              2. Pray the Rosary Closing Prayer ("O God, whose only begotten Son...").{'\n'}
              3. Finish with the Sign of the Cross.
            </Text>
          </View>
        </ScrollView>
      ) : (
        /* ── TAB 3: ORDER OF MASS (WITH ENGLISH / LATIN SWITCH) ── */
        <View style={styles.container}>
          {/* Language Toggle Switch Bar */}
          <View style={styles.languageSwitchWrapper}>
            <View style={[styles.switchContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.full }]}>
              <TouchableOpacity
                style={[
                  styles.switchBtn,
                  massLanguage === 'english' && { backgroundColor: colors.primary, borderRadius: radius.full },
                ]}
                onPress={() => setMassLanguage('english')}
                activeOpacity={0.8}
              >
                <Ionicons name="language-outline" size={16} color={massLanguage === 'english' ? '#FFFFFF' : colors.textMuted} />
                <Text
                  style={[
                    styles.switchBtnText,
                    {
                      color: massLanguage === 'english' ? '#FFFFFF' : colors.textSecondary,
                      fontFamily: massLanguage === 'english' ? typography.fontFamily.bold : typography.fontFamily.semiBold,
                    },
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchBtn,
                  massLanguage === 'latin' && { backgroundColor: colors.primary, borderRadius: radius.full },
                ]}
                onPress={() => setMassLanguage('latin')}
                activeOpacity={0.8}
              >
                <Ionicons name="earth-outline" size={16} color={massLanguage === 'latin' ? '#FFFFFF' : colors.textMuted} />
                <Text
                  style={[
                    styles.switchBtnText,
                    {
                      color: massLanguage === 'latin' ? '#FFFFFF' : colors.textSecondary,
                      fontFamily: massLanguage === 'latin' ? typography.fontFamily.bold : typography.fontFamily.semiBold,
                    },
                  ]}
                >
                  Latin (Ordo Missae)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.tabContentScroll} showsVerticalScrollIndicator={false}>
            {massSections.length > 0 ? (
              massSections.map((section) => (
                <View key={section.id} style={styles.massSectionBlock}>
                  <Text style={[styles.massSectionHeader, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
                    {section.sectionTitle}
                  </Text>
                  {section.parts.map((part) => {
                    const langData = massLanguage === 'latin' ? part.latin : part.english;
                    return (
                      <View
                        key={part.id}
                        style={[
                          styles.massPartCard,
                          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
                        ]}
                      >
                        <Text style={[styles.massPartTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                          {part.title}
                        </Text>

                        {part.rubric && (
                          <Text style={[styles.massRubric, { color: colors.accent, fontFamily: typography.fontFamily.semiBold }]}>
                            {part.rubric}
                          </Text>
                        )}

                        {langData.priest && (
                          <View style={styles.dialogRow}>
                            <Text style={[styles.speakerLabel, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
                              Priest:
                            </Text>
                            <Text style={[styles.dialogText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                              {langData.priest}
                            </Text>
                          </View>
                        )}

                        {langData.people && (
                          <View style={styles.dialogRow}>
                            <Text style={[styles.speakerLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                              People:
                            </Text>
                            <Text style={[styles.dialogText, { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold }]}>
                              {langData.people}
                            </Text>
                          </View>
                        )}

                        {langData.text && (
                          <Text style={[styles.dialogText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular, marginTop: 4 }]}>
                            {langData.text}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="book-outline" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.emptyStateTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                  Order of Mass ({massLanguage === 'latin' ? 'Latin' : 'English'})
                </Text>
                <Text style={[styles.emptyStateSub, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                  Ready to receive Order of Mass data! Paste the text and I will populate both English and Latin responses.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  mainTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  mainTabText: {
    fontSize: 13,
  },
  languageSwitchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    padding: 3,
    borderWidth: 1,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  switchBtnText: {
    fontSize: 13,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  categoryScrollContainer: {
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  prayerCard: {
    padding: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  numberBadge: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 13,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 8,
  },
  prayerTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
  },
  snippetText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  detailsTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  categoryBadge: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 24,
  },
  prayerBody: {
    gap: 16,
  },
  sectionBlock: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'left',
  },
  tabContentScroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  infoBannerTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  infoBannerSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  guideStepCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    gap: 4,
  },
  stepNum: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  stepTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  massSectionBlock: {
    gap: 10,
    marginBottom: 12,
  },
  massSectionHeader: {
    fontSize: 17,
    letterSpacing: 0.2,
  },
  massPartCard: {
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  massPartTitle: {
    fontSize: 15,
  },
  massRubric: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  dialogRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  speakerLabel: {
    width: 60,
    fontSize: 14,
  },
  dialogText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
