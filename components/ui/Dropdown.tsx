import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
            borderRadius: radius.sm,
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

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text
              style={{
                fontFamily: typography.fontFamily.semiBold,
                fontSize: 17,
                color: colors.text,
              }}
            >
              {label ?? 'Select'}
            </Text>
            <TouchableOpacity onPress={() => { setOpen(false); setQuery(''); }}>
              <Ionicons name="close" size={24} color={colors.icon} />
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

          {/* Options */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value, item);
                    setOpen(false);
                    setQuery('');
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
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
