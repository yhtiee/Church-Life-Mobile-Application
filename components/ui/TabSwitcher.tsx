import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface TabSwitcherProps {
  tabs: string[];
  activeIndex: number;
  onTabChange: (index: number) => void;
}

export function TabSwitcher({ tabs, activeIndex, onTabChange }: TabSwitcherProps) {
  const { colors, typography, radius } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm }]}>
      {tabs.map((tab, i) => {
        const isActive = i === activeIndex;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(i)}
            style={[
              styles.tab,
              { borderRadius: radius.sm - 2 },
              isActive && { backgroundColor: colors.surface },
            ]}
          >
            <Text style={{ fontSize: 13, fontFamily: isActive ? typography.fontFamily.semiBold : typography.fontFamily.regular, color: isActive ? colors.primary : colors.textMuted }}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 4, marginBottom: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
});
