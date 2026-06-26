import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { C } from "./Theme";

interface SuccessOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export const SuccessOverlay = ({ visible, onComplete }: SuccessOverlayProps) => {
  const bgOpacity = useSharedValue(0);
  const popScale = useSharedValue(0);
  const checkScale = useSharedValue(0);

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

      // 4. Automatically complete and fade out
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
});
