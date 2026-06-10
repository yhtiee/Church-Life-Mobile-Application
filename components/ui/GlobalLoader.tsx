import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { Image } from 'expo-image';

interface GlobalLoaderProps {
  size?: number;
  backgroundColor?: string;
  visible?: boolean;
}

const ACCENT = "#00B4FF";
const LOGO_SIZE = 52;
const SPINNER_SIZE = 46;

/* ─────────────────────────────
  GlobalLoader
───────────────────────────── */
const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  size = 90,
  backgroundColor,
  visible = true,
}) => {
  const [reduceMotion, setReduceMotion] = useState(false);

  // Shared values — always declared unconditionally
  const vis = useSharedValue(visible ? 1 : 0);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Respect system reduce-motion preference
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((rm) => {
      if (mounted) setReduceMotion(rm);
    });
    const sub = (AccessibilityInfo as any)?.addEventListener?.(
      "reduceMotionChanged",
      (rm: boolean) => {
        if (mounted) setReduceMotion(rm);
      },
    );
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  // Fade in / out
  useEffect(() => {
    vis.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [visible, vis]);

  // Spinner + pulse animations
  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(rotation);
      cancelAnimation(pulse);
      return;
    }

    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(pulse);
    };
  }, [reduceMotion, rotation, pulse]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: vis.value }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  // Decide backdrop behaviour
  const isTransparent = backgroundColor === "transparent";
  const isSmall = size <= 50;

  // Scale logo/spinner with the size prop
  const logoSize = isSmall ? size * 0.7 : LOGO_SIZE;
  const spinnerSize = isSmall ? size * 1.1 : SPINNER_SIZE;
  const overlayTint = isTransparent
    ? "transparent"
    : backgroundColor ?? "rgba(4,10,30,0.62)";

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.container, containerStyle]}
    >
      {/* ── Backdrop (blur + tint) ── */}
      {!isTransparent && (
        <>
          <BlurView
            intensity={Platform.OS === "ios" ? 22 : 10}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: overlayTint },
            ]}
          />
        </>
      )}

      {/* ── Center content ── */}
      <View style={styles.center}>
        {/* Logo — hidden for tiny inline spinners */}
        {!isSmall && (
          <Animated.View style={[logoStyle, styles.logoWrap]}>
            <Image
              source={require('@/assets/images/cross-dove-background.png')}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
            />
          </Animated.View>
        )}

        {/* Spinner arc ring */}
        <Animated.View
          style={[
            styles.spinnerRing,
            spinStyle,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: spinnerSize / 2,
              borderTopColor: ACCENT,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

export default GlobalLoader;

/* ─────────────────────────────
   Styles
───────────────────────────── */
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    marginBottom: 22,
  },
  spinnerRing: {
    borderWidth: 2.5,
    // base ring — all sides faint
    borderColor: "rgba(255,255,255,0.15)",
    // active arc — top side bright (overridden inline per instance)
    borderTopColor: ACCENT,
  },
});
