import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { CheckCircle2, AlertCircle } from "lucide-react-native";
import { C } from "./Theme";

interface NotificationBannerProps {
  visible: boolean;
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export const NotificationBanner = ({
  visible,
  message,
  type,
  onClose,
}: NotificationBannerProps) => {
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Slide down and fade in
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        translateY.value = withTiming(-120, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.value = -120;
      opacity.value = 0;
    }
  }, [visible, message, type]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const isSuccess = type === "success";

  return (
    <Animated.View
      style={[
        styles.container,
        isSuccess ? styles.successBg : styles.errorBg,
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        {isSuccess ? (
          <CheckCircle2 size={20} color={C.success} />
        ) : (
          <AlertCircle size={20} color={C.danger} />
        )}
        <Text style={[styles.text, isSuccess ? styles.successText : styles.errorText]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    zIndex: 99999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  successBg: {
    backgroundColor: C.successBg,
    borderColor: C.successBorder,
  },
  errorBg: {
    backgroundColor: C.dangerBg,
    borderColor: C.dangerBorder,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  successText: {
    color: C.successDark,
  },
  errorText: {
    color: C.dangerDark,
  },
});
