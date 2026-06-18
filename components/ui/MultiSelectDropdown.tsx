import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

interface MultiSelectOption {
  label: string;
  value: string;
  subtitle?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

interface MultiSelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[], selectedOptions: MultiSelectOption[]) => void;
  searchable?: boolean;
  error?: string;
  maxHeight?: number;
}

export function MultiSelectDropdown({
  label,
  placeholder = 'Select options',
  options,
  selectedValues,
  onChange,
  searchable = true,
  error,
  maxHeight = 600,
}: MultiSelectDropdownProps) {
  const { colors, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOptions = options.filter(o => selectedValues.includes(o.value));
  const filtered = searchable
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          (o.subtitle ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : options;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const handleToggle = (value: string, option: MultiSelectOption) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    const newOptions = options.filter(o => newValues.includes(o.value));
    onChange(newValues, newOptions);
  };

  const MAX_ITEMS_VISIBLE = 10;
  const ITEM_HEIGHT = 56;
  const HEADER_HEIGHT = 56;
  const SEARCH_HEIGHT = searchable ? 60 : 0;
  const listHeight = Math.min(filtered.length, MAX_ITEMS_VISIBLE) * ITEM_HEIGHT;
  const sheetHeight = Math.min(
    HEADER_HEIGHT + SEARCH_HEIGHT + listHeight + insets.bottom + 16,
    maxHeight
  );

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontFamily: typography.fontFamily.medium,
            color: colors.textSecondary,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}

      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderColor: error ? colors.danger : colors.border,
            minHeight: selectedValues.length > 0 ? 56 : 50,
            paddingVertical: 8,
          },
        ]}
      >
        {selectedValues.length === 0 ? (
          <Text
            style={{
              flex: 1,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              fontSize: 15,
            }}
          >
            {placeholder}
          </Text>
        ) : (
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {selectedOptions.slice(0, 3).map(opt => (
                <View
                  key={opt.value}
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: colors.primaryLight, borderRadius: radius.full }
                  ]}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: 12,
                    }}
                  >
                    {opt.label}
                  </Text>
                </View>
              ))}
              {selectedValues.length > 3 && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: colors.primaryLight, borderRadius: radius.full }
                  ]}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: 12,
                    }}
                  >
                    +{selectedValues.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        <Ionicons name="chevron-down" size={18} color={colors.icon} />
      </TouchableOpacity>

      {error && (
        <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}

      {/* Bottom Sheet Modal */}
      <Modal visible={open} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              height: sheetHeight,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
            <View>
              <Text
                style={{
                  fontFamily: typography.fontFamily.semiBold,
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                {label ?? 'Select'}
              </Text>
              <Text
                style={{
                  fontFamily: typography.fontFamily.regular,
                  fontSize: 12,
                  color: colors.textMuted,
                  marginTop: 2,
                }}
              >
                {selectedValues.length} selected
              </Text>
            </View>
            <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          {searchable && (
            <View style={[styles.searchBar, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name="search-outline" size={16} color={colors.icon} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search groups..."
                placeholderTextColor={colors.textMuted}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  color: colors.text,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: 15,
                }}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Options List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            renderItem={({ item }) => {
              const isSelected = selectedValues.includes(item.value);
              return (
                <TouchableOpacity
                  onPress={() => handleToggle(item.value, item)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {item.icon && (
                        <Ionicons
                          name={item.icon as any}
                          size={16}
                          color={isSelected ? colors.primary : colors.textSecondary}
                        />
                      )}
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.text,
                          fontFamily: isSelected
                            ? typography.fontFamily.semiBold
                            : typography.fontFamily.regular,
                          fontSize: 15,
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {item.subtitle && (
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontSize: 12,
                          fontFamily: typography.fontFamily.regular,
                          marginTop: 4,
                          marginLeft: item.icon ? 24 : 0,
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Empty State */}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={40} color={colors.textMuted} />
              <Text
                style={{
                  color: colors.textMuted,
                  fontFamily: typography.fontFamily.regular,
                  fontSize: 14,
                  marginTop: 8,
                }}
              >
                No groups found
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },

  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
  },

  selectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
});
