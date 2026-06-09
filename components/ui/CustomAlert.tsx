import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
  buttonLabel?: string;
  onPress: () => void;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
}

const { width } = Dimensions.get('window');

export function CustomAlert({
  visible,
  title,
  message,
  type,
  buttonLabel = 'OK',
  onPress,
  secondaryButtonLabel,
  onSecondaryPress,
}: CustomAlertProps) {
  const { colors, typography, radius } = useTheme();

  const getStyleConfig = () => {
    if (type === 'success') {
      return {
        icon: 'checkmark-circle' as const,
        iconColor: colors.success || '#2E7D32',
        iconBg: colors.successBg || '#E8F5E9',
        accentColor: colors.success || '#2E7D32',
      };
    } else {
      return {
        icon: 'alert-circle' as const,
        iconColor: colors.danger || '#C62828',
        iconBg: colors.dangerBg || '#FFEBEE',
        accentColor: colors.danger || '#C62828',
      };
    }
  };

  const config = getStyleConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/* Animated Background Fade */}
        <Animated.View 
          entering={FadeIn.duration(200)} 
          style={[styles.backdropBg, { backgroundColor: 'rgba(0,0,0,0.5)' }]} 
        />

        {/* The Alert Panel */}
        <Animated.View
          // entering={ZoomIn.springify().damping(15)}
          style={[
            styles.alertBox,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Accent icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
            <Ionicons name={config.icon} size={42} color={config.iconColor} />
          </View>

          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.extraBold }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            {message}
          </Text>

          <View style={[styles.actionsRow, secondaryButtonLabel ? styles.actionsRowMulti : null]}>
            {secondaryButtonLabel && (
              <Button
                label={secondaryButtonLabel}
                onPress={onSecondaryPress || (() => {})}
                variant="ghost"
                size="md"
                style={styles.actionBtn}
              />
            )}
            <Button
              label={buttonLabel}
              onPress={onPress}
              variant={type === 'success' ? 'primary' : 'danger'}
              size="md"
              style={styles.actionBtn}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdropBg: {
    ...StyleSheet.absoluteFillObject,
  },
  alertBox: {
    width: Math.min(width - 48, 340),
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionsRowMulti: {
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
  },
});
