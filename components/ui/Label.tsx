import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface LabelProps {
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  htmlFor?: string;
  containerStyle?: ViewStyle;
}

export function Label({
  label,
  required = false,
  error = false,
  helperText,
  htmlFor,
  containerStyle,
}: LabelProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          styles.label,
          {
            fontFamily: typography.fontFamily.semiBold,
            color: error ? colors.danger : colors.text,
            fontSize: 14,
          },
        ]}
        nativeID={htmlFor}
      >
        {label}
        {required && (
          <Text style={[{ color: colors.danger, marginLeft: 2 }]}>*</Text>
        )}
      </Text>
      {helperText && (
        <Text
          style={[
            styles.helperText,
            {
              fontFamily: typography.fontFamily.regular,
              color: error ? colors.danger : colors.textMuted,
              fontSize: 12,
            },
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    lineHeight: 20,
  },
  helperText: {
    marginTop: 4,
    lineHeight: 16,
  },
});
