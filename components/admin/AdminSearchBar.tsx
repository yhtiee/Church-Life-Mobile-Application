import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface AdminSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  /**
   * Shows a filter icon beside the search box. Separate from `onFilterPress`,
   * which some screens already pass for other purposes, so turning the icon
   * on here cannot change those screens.
   */
  onFilterButtonPress?: () => void;
  /** Number of applied filters, shown as a badge on the filter icon. */
  activeFilterCount?: number;
}

export function AdminSearchBar({
  value,
  onChangeText,
  placeholder,
  onFilterButtonPress,
  activeFilterCount = 0,
}: AdminSearchBarProps) {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.searchSection, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.md }]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: colors.text, fontFamily: typography.fontFamily.regular }]}
          placeholder={placeholder || "Search members..."}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      
      {onFilterButtonPress && (
        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: activeFilterCount > 0 ? colors.primary : colors.primaryLight,
              borderRadius: radius.md,
            },
          ]}
          onPress={onFilterButtonPress}
          accessibilityRole="button"
          accessibilityLabel={
            activeFilterCount > 0 ? `Filters, ${activeFilterCount} applied` : 'Filters'
          }
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFilterCount > 0 ? colors.textInverse : colors.primary}
          />
          {activeFilterCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]}>
              <Text style={[styles.badgeText, { fontFamily: typography.fontFamily.bold }]}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  clearBtn: {
    padding: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
});
