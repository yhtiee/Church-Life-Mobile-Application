import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword,
  style,
  ...props
}: InputProps) {
  const { colors, typography, radius } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error ? colors.danger : colors.border;
  const iconColor = colors.icon;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontFamily: typography.fontFamily.medium,
            color: colors.textSecondary,
            marginBottom: 6,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor,
            paddingHorizontal: 14,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={iconColor}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.regular,
              fontSize: 15,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={18} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {(error || helper) && (
        <Text
          style={{
            fontSize: 12,
            fontFamily: typography.fontFamily.regular,
            color: error ? colors.danger : colors.textMuted,
            marginTop: 4,
          }}
        >
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%' },
});
