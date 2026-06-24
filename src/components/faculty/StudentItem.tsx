import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check } from "lucide-react-native";
import { C } from "./Theme";
import { Student } from "@/services/auth";

interface StudentItemProps {
  student: Student;
  isChecked: boolean;
  onToggle: (id: number, current: boolean) => void;
  showBorder: boolean;
  isLast?: boolean;
}

export const StudentItem = React.memo(({
  student,
  isChecked,
  onToggle,
  showBorder,
  isLast,
}: StudentItemProps) => {
  return (
    <TouchableOpacity
      onPress={() => onToggle(student.studentRegistrationId, isChecked)}
      style={[
        styles.studentRow,
        isChecked && styles.studentRowChecked,
        showBorder && styles.studentRowBorder,
        isLast && styles.studentRowLast,
      ]}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
        {isChecked && <Check size={13} color={C.white} strokeWidth={3} />}
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.nameAsPerMarksheet}</Text>
        <Text style={styles.studentEnroll}>Enrollment: {student.enrollmentNo}</Text>
      </View>
      <View style={[styles.statusBadge, isChecked ? styles.statusPresent : styles.statusAbsent]}>
        <Text style={[styles.statusText, isChecked ? styles.statusPresentText : styles.statusAbsentText]}>
          {isChecked ? "Present" : "Absent"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isChecked === nextProps.isChecked &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.student.studentRegistrationId === nextProps.student.studentRegistrationId &&
    prevProps.student.nameAsPerMarksheet === nextProps.student.nameAsPerMarksheet &&
    prevProps.student.enrollmentNo === nextProps.student.enrollmentNo &&
    prevProps.showBorder === nextProps.showBorder &&
    prevProps.onToggle === nextProps.onToggle
  );
});

const styles = StyleSheet.create({
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: C.border,
  },
  studentRowChecked: {
    backgroundColor: "#F0F5FF",
  },
  studentRowBorder: {
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  studentRowLast: {
    borderBottomWidth: 1.5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 14,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.primaryBorder,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: C.primaryMid,
    borderColor: C.primaryMid,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  studentEnroll: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 3,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPresent: {
    backgroundColor: C.successBg,
  },
  statusAbsent: {
    backgroundColor: C.dangerBg,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  statusPresentText: {
    color: C.success,
  },
  statusAbsentText: {
    color: C.danger,
  },
});
