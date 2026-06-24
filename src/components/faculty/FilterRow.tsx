import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { C } from "./Theme";

interface FilterRowProps {
  step: number;
  label: string;
  value: string | null;
  icon: React.ReactNode;
  onPress: () => void;
  isLoading?: boolean;
  selected?: boolean;
}

export const FilterRow = React.memo(({
  step,
  label,
  value,
  icon,
  onPress,
  isLoading,
  selected,
}: FilterRowProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[fr.row, selected && fr.rowSelected]}
      activeOpacity={0.75}
    >
      {/* Step number / check */}
      <View style={[fr.stepCircle, selected && fr.stepCircleActive]}>
        {selected ? (
          <Check size={14} color={C.white} strokeWidth={3} />
        ) : (
          <Text style={fr.stepNum}>{step}</Text>
        )}
      </View>
      {/* Icon box */}
      <View style={[fr.iconBox, selected && fr.iconBoxActive]}>
        {icon}
      </View>
      {/* Text */}
      <View style={fr.textCol}>
        <Text style={fr.rowLabel}>{label}</Text>
        <Text style={[fr.rowValue, !value && fr.rowPlaceholder]} numberOfLines={1}>
          {value ?? "Tap to choose →"}
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color={C.primaryMid} />
      ) : (
        <View style={[fr.chevronBox, selected && fr.chevronBoxActive]}>
          <ChevronDown size={16} color={selected ? C.white : C.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
});

const fr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  rowSelected: {
    borderColor: C.primaryMid,
    backgroundColor: "#EBF2FF",
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepCircleActive: {
    backgroundColor: C.success,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textMuted,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxActive: {
    backgroundColor: C.primaryMid,
  },
  textCol: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  rowPlaceholder: {
    color: C.textLight,
    fontWeight: "500",
    fontSize: 14,
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronBoxActive: {
    backgroundColor: C.primaryMid,
  },
});
