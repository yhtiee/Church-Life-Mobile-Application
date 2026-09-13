import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface ControlsProps<T extends string> {
  search: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder: string;
  filters: FilterOption<T>[];
  activeFilter: T;
  onFilterChange: (value: T) => void;
  /** An optional second row, e.g. the diocese chips on the parish list. */
  secondaryFilters?: FilterOption<string>[];
  activeSecondary?: string | null;
  onSecondaryChange?: (value: string | null) => void;
}

/** Search box and filter chips shared by every platform list. */
export function PlatformListControls<T extends string>({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  activeFilter,
  onFilterChange,
  secondaryFilters,
  activeSecondary,
  onSecondaryChange,
}: ControlsProps<T>) {
  return (
    <View>
      <AdminSearchBar value={search} onChangeText={onSearchChange} placeholder={searchPlaceholder} />

      <ChipRow
        options={filters}
        active={activeFilter}
        onPress={(value) => onFilterChange(value as T)}
      />

      {secondaryFilters && secondaryFilters.length > 0 && onSecondaryChange && (
        <ChipRow
          // "All" clears the secondary filter rather than being a real value.
          options={[{ value: '__all__', label: 'All dioceses' }, ...secondaryFilters]}
          active={activeSecondary ?? '__all__'}
          onPress={(value) => onSecondaryChange(value === '__all__' ? null : value)}
          compact
        />
      )}
    </View>
  );
}

function ChipRow({
  options,
  active,
  onPress,
  compact,
}: {
  options: FilterOption<string>[];
  active: string;
  onPress: (value: string) => void;
  compact?: boolean;
}) {
  const { colors, typography, radius } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.chips, compact && styles.chipsCompact]}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const selected = option.value === active;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onPress(option.value)}
            style={[
              styles.chip,
              compact && styles.chipCompact,
              {
                borderRadius: radius.full,
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={{
                fontSize: compact ? 12 : 13,
                color: selected ? colors.textInverse : colors.text,
                fontFamily: selected ? typography.fontFamily.semiBold : typography.fontFamily.medium,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
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
  chips: { paddingHorizontal: 20, paddingBottom: 10, gap: 8 },
  chipsCompact: { paddingBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  chipCompact: { paddingHorizontal: 12, paddingVertical: 6 },
  footer: { paddingVertical: 18, alignItems: 'center' },
  empty: { paddingTop: 50, paddingHorizontal: 30, alignItems: 'center' },
});
