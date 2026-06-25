import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check } from "lucide-react-native";
import { C } from "./Theme";
import { Student } from "@/services/auth";

/** Fixed row height — must match STUDENT_ITEM_HEIGHT in StudentRoster */
export const STUDENT_ITEM_HEIGHT = 76;

interface StudentItemProps {
  student: Student;
  index: number;
  isChecked: boolean;
  onToggle: (id: number, current: boolean) => void;
}

export const StudentItem = React.memo(
  ({ student, index, isChecked, onToggle }: StudentItemProps) => {
    return (
      <TouchableOpacity
        onPress={() => onToggle(student.studentRegistrationId, isChecked)}
        style={[styles.row, isChecked ? styles.rowPresent : styles.rowAbsent]}
        activeOpacity={0.72}
      >
        {/* Left colored accent */}
        <View style={[styles.accentBar, isChecked ? styles.barPresent : styles.barAbsent]} />

        {/* Serial number */}
        <View style={styles.serialBox}>
          <Text style={styles.serialText}>{String(index + 1).padStart(2, "0")}</Text>
        </View>

        {/* Checkbox */}
        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
          {isChecked && <Check size={14} color={C.white} strokeWidth={3} />}
        </View>

        {/* Student info */}
        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>
            {student.nameAsPerMarksheet}
          </Text>
          <Text style={styles.enroll}>#{student.enrollmentNo}</Text>
        </View>

        {/* Status badge */}
        <View style={[styles.badge, isChecked ? styles.badgePresent : styles.badgeAbsent]}>
          <Text style={[styles.badgeText, isChecked ? styles.badgeTextPresent : styles.badgeTextAbsent]}>
            {isChecked ? "P" : "A"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.isChecked === next.isChecked &&
    prev.index === next.index &&
    prev.student.studentRegistrationId === next.student.studentRegistrationId &&
    prev.onToggle === next.onToggle
);

const styles = StyleSheet.create({
  row: {
    height: STUDENT_ITEM_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    marginBottom: 6,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 1,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  rowPresent: {
    borderColor: C.successBorder,
    backgroundColor: "#F0FDF8",
  },
  rowAbsent: {
    borderColor: C.dangerBorder,
    backgroundColor: "#FFF8F8",
  },
  accentBar: {
    width: 5,
    alignSelf: "stretch",
  },
  barPresent: {
    backgroundColor: C.success,
  },
  barAbsent: {
    backgroundColor: C.danger,
  },
  serialBox: {
    width: 36,
    alignItems: "center",
  },
  serialText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textLight,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.primaryBorder,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: C.success,
    borderColor: C.success,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
    letterSpacing: 0.2,
  },
  enroll: {
    fontSize: 11.5,
    color: C.textMuted,
    marginTop: 3,
    fontWeight: "500",
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  badgePresent: {
    backgroundColor: C.successBg,
  },
  badgeAbsent: {
    backgroundColor: C.dangerBg,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "900",
  },
  badgeTextPresent: {
    color: C.success,
  },
  badgeTextAbsent: {
    color: C.danger,
  },
});
