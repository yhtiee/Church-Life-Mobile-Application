import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface DividerProps { marginVertical?: number; }

export function Divider({ marginVertical = 12 }: DividerProps) {
  const { colors } = useTheme();
  return <View style={[styles.line, { borderTopColor: colors.divider, marginVertical }]} />;
}

const styles = StyleSheet.create({
  line: { borderTopWidth: StyleSheet.hairlineWidth },
});
