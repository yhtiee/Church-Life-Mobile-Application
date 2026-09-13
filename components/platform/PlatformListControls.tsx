import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import {
  FilterModal,
  countSelected,
  type FilterSection,
  type FilterSelection,
} from '@/components/ui/FilterModal';

interface ControlsProps {
  search: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder: string;
  filterSections: FilterSection[];
  appliedFilters: FilterSelection;
  onApplyFilters: (selection: FilterSelection) => void;
}

/**
 * Search box with a filter icon beside it. The icon opens a checkbox sheet,
 * and carries a badge with the number of filters applied so a narrowed list
 * never looks like a complete one.
 */
export function PlatformListControls({
  search,
  onSearchChange,
  searchPlaceholder,
  filterSections,
  appliedFilters,
  onApplyFilters,
}: ControlsProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <View>
      <AdminSearchBar
        value={search}
        onChangeText={onSearchChange}
        placeholder={searchPlaceholder}
        onFilterButtonPress={() => setFiltersOpen(true)}
        activeFilterCount={countSelected(appliedFilters)}
      />

      <FilterModal
        visible={filtersOpen}
        sections={filterSections}
        applied={appliedFilters}
        onApply={onApplyFilters}
        onClose={() => setFiltersOpen(false)}
      />
    </View>
  );
}

interface FooterProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  shownCount: number;
}

/** Spinner while the next page loads, and a quiet end marker once it cannot. */
export function PlatformListFooter({ isFetchingNextPage, hasNextPage, shownCount }: FooterProps) {
  const { colors, typography } = useTheme();

  if (isFetchingNextPage) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!hasNextPage && shownCount > 0) {
    return (
      <View style={styles.footer}>
        <Text
          style={{ fontSize: 12, color: colors.textMuted, fontFamily: typography.fontFamily.regular }}
        >
          {shownCount} {shownCount === 1 ? 'result' : 'results'}
        </Text>
      </View>
    );
  }

  return null;
}

interface EmptyProps {
  isLoading: boolean;
  isFiltered: boolean;
  emptyText: string;
}

/**
 * Distinguishes "nothing matches" from "nothing exists", since the fix for
 * each is different: loosen the filter, or add the first item.
 */
export function PlatformListEmpty({ isLoading, isFiltered, emptyText }: EmptyProps) {
  const { colors, typography } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.empty}>
      <Text
        style={{
          fontSize: 14,
          color: colors.textMuted,
          fontFamily: typography.fontFamily.regular,
          textAlign: 'center',
          lineHeight: 21,
        }}
      >
        {isFiltered ? 'Nothing matches your search or filter.' : emptyText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingVertical: 18, alignItems: 'center' },
  empty: { paddingTop: 50, paddingHorizontal: 30, alignItems: 'center' },
});
