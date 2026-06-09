import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, LayoutChangeEvent, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { Animation } from '@/constants/theme';

interface TabSwitcherProps {
  tabs: string[];
  activeIndex: number;
  onTabChange: (index: number) => void;
}

export function TabSwitcher({ tabs, activeIndex, onTabChange }: TabSwitcherProps) {
  const { colors, typography } = useTheme();
  const tabWidths = useRef<number[]>([]);
  const tabOffsets = useRef<number[]>([]);
  const pillX = useSharedValue(0);
  const pillW = useSharedValue(0);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillW.value,
  }));

  const movePill = (index: number) => {
    if (tabWidths.current[index] !== undefined) {
      pillX.value = withSpring(tabOffsets.current[index], Animation.springBounce);
      pillW.value = withSpring(tabWidths.current[index], Animation.spring);
    }
  };

  useEffect(() => {
    movePill(activeIndex);
  }, [activeIndex]);

  const handleLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { width, x } = e.nativeEvent.layout;
    tabWidths.current[index] = width;
    tabOffsets.current[index] = x;
    if (index === activeIndex) {
      pillX.value = x;
      pillW.value = width;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
      {/* Animated pill */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: colors.primary },
          animatedPillStyle,
        ]}
      />

      {tabs.map((tab, i) => {
        const isActive = i === activeIndex;
        return (
          <Pressable
            key={tab}
            onLayout={handleLayout(i)}
            onPress={() => onTabChange(i)}
            style={styles.tab}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: isActive
                  ? typography.fontFamily.bold
                  : typography.fontFamily.medium,
                color: isActive ? '#FFFFFF' : colors.textMuted,
                letterSpacing: 0.3,
              }}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 4,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 9999,
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
