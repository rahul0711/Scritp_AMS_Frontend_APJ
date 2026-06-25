import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { C } from "./Theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PARTICLE_COUNT = 45;

// Vibrant colors for confetti particles
const CONFETTI_COLORS = [
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#EAB308", // Yellow/Gold
  "#EC4899", // Pink
  "#A855F7", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
];

interface SuccessOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export const SuccessOverlay = ({ visible, onComplete }: SuccessOverlayProps) => {
  const bgOpacity = useSharedValue(0);
  const popScale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const confettiProgress = useSharedValue(0);

  // Generate confetti configuration once
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 160;
      const gravity = 150 + Math.random() * 200;
      const wind = (Math.random() - 0.5) * 100;
      const rotation = (Math.random() - 0.5) * 1080; // multiple full rotations
      const size = 6 + Math.random() * 8;
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const isCircle = Math.random() > 0.5;

      return { angle, distance, gravity, wind, rotation, size, color, isCircle };
    });
  }, []);

  useEffect(() => {
    if (visible) {
      // 1. Fade in backdrop
      bgOpacity.value = withTiming(1, { duration: 300 });

      // 2. Scale-pop central circle
      popScale.value = withSpring(1, { damping: 12, stiffness: 100 });

      // 3. Scale checkmark slightly delayed
      checkScale.value = withDelay(
        150,
        withSpring(1, { damping: 10, stiffness: 120 })
      );

      // 4. Burst confetti
      confettiProgress.value = withDelay(
        200,
        withTiming(1, {
          duration: 1800,
          easing: Easing.out(Easing.quad),
        })
      );

      // 5. Automatically complete and fade out
      const timer = setTimeout(() => {
        bgOpacity.value = withTiming(0, { duration: 300 });
        popScale.value = withTiming(0, { duration: 250 });
        checkScale.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        });
      }, 2100);

      return () => clearTimeout(timer);
    } else {
      // Reset values when not visible
      bgOpacity.value = 0;
      popScale.value = 0;
      checkScale.value = 0;
      confettiProgress.value = 0;
    }
  }, [visible, onComplete]);

  // Animated Styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.backdrop, backdropStyle]}>
      {/* Confetti Particles */}
      {particles.map((p, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const particleStyle = useAnimatedStyle(() => {
          const t = confettiProgress.value;
          if (t === 0) return { opacity: 0 };

          const tx = Math.cos(p.angle) * p.distance * t + p.wind * t;
          const ty = Math.sin(p.angle) * p.distance * t + p.gravity * t * t - (1 - t) * 15;
          const rot = t * p.rotation;
          const opacity = t < 0.15 ? t / 0.15 : t > 0.7 ? (1 - t) / 0.3 : 1;

          return {
            transform: [
              { translateX: tx },
              { translateY: ty },
              { rotate: `${rot}deg` },
            ],
            opacity,
          };
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              particleStyle,
              {
                width: p.size,
                height: p.isCircle ? p.size : p.size * 0.6,
                borderRadius: p.isCircle ? p.size / 2 : 1,
                backgroundColor: p.color,
              },
            ]}
          />
        );
      })}

      {/* Pop Card */}
      <Animated.View style={[styles.circle, popStyle]}>
        <Animated.View style={checkStyle}>
          <Check size={48} color={C.white} strokeWidth={4} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(11, 19, 53, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.success,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  particle: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    left: "50%",
  },
});
