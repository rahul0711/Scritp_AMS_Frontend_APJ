import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, ChevronRight } from "lucide-react-native";
import { C } from "./Theme";

interface FilterRowProps {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  onPress: () => void;
  isLoading?: boolean;
  selected?: boolean;
}

export const FilterRow = React.memo(({
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
      activeOpacity={0.72}
    >
      {/* Left accent bar */}
      <View style={[fr.accentBar, selected && fr.accentBarActive]} />

      {/* Icon */}
      <View style={[fr.iconBox, selected && fr.iconBoxActive]}>
        {icon}
      </View>

      {/* Text */}
      <View style={fr.textCol}>
        <Text style={fr.rowLabel}>{label}</Text>
        <Text
          style={[fr.rowValue, !value && fr.rowPlaceholder]}
          numberOfLines={1}
        >
          {value ?? "Tap to select"}
        </Text>
      </View>

      {/* Right side */}
      {isLoading ? (
        <ActivityIndicator size="small" color={C.primaryMid} style={fr.trailing} />
      ) : selected ? (
        <View style={fr.checkBadge}>
          <Check size={13} color={C.white} strokeWidth={3} />
        </View>
      ) : (
        <View style={fr.chevronBox}>
          <ChevronRight size={16} color={C.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
});

const fr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    minHeight: 64,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: "hidden",
    elevation: 1,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  rowSelected: {
    borderColor: C.primaryMid,
    backgroundColor: "#F0F5FF",
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: C.border,
    marginRight: 14,
  },
  accentBarActive: {
    backgroundColor: C.success,
  },
  iconBox: {
    width: 42,
    height: 42,
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
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
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
  trailing: {
    marginHorizontal: 14,
  },
  checkBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.success,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
});
