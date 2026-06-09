import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

interface DropdownOption {
  label: string;
  value: string;
  subtitle?: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string, option: DropdownOption) => void;
  searchable?: boolean;
  error?: string;
}

export function Dropdown({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  searchable,
  error,
}: DropdownProps) {
  const { colors, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);
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

  // Cap the sheet height so it never covers the full screen
  const MAX_ITEMS_VISIBLE = 6;
  const ITEM_HEIGHT = 56;
  const HEADER_HEIGHT = 56;
  const SEARCH_HEIGHT = searchable ? 60 : 0;
  const listHeight = Math.min(filtered.length, MAX_ITEMS_VISIBLE) * ITEM_HEIGHT;
  const sheetHeight = HEADER_HEIGHT + SEARCH_HEIGHT + listHeight + insets.bottom + 16;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontFamily: typography.fontFamily.medium,
            color: colors.textSecondary,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <Text
          style={{
            flex: 1,
            color: selected ? colors.text : colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            fontSize: 15,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.icon} />
      </TouchableOpacity>

      {error && (
        <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}

      {/* ── Bottom-sheet modal ── */}
      <Modal visible={open} transparent animationType="fade" statusBarTranslucent>
        {/* Backdrop — tap to dismiss */}
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
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
          {/* Drag handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
            <Text
              style={{
                fontFamily: typography.fontFamily.semiBold,
                fontSize: 16,
                color: colors.text,
              }}
            >
              {label ?? 'Select'}
            </Text>
            <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          {searchable && (
            <View style={[styles.searchBar, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name="search-outline" size={16} color={colors.icon} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
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
            </View>
          )}

          {/* Options list */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value, item);
                    close();
                  }}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: isSelected ? colors.primary : colors.text,
                        fontFamily: isSelected
                          ? typography.fontFamily.semiBold
                          : typography.fontFamily.regular,
                        fontSize: 15,
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle && (
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontSize: 12,
                          fontFamily: typography.fontFamily.regular,
                          marginTop: 2,
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },

  // Trigger button
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
  },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Bottom sheet
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
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
