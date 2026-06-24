import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, GraduationCap, Layers } from "lucide-react-native";
import { C } from "./Theme";
import { OptionType } from "./types";

interface SessionSummaryProps {
  selectedCourse: OptionType | null;
  selectedSemester: OptionType | null;
  selectedSubject: OptionType | null;
  selectedTime: OptionType | null;
}

export const SessionSummary = React.memo(({
  selectedCourse,
  selectedSemester,
  selectedSubject,
}: SessionSummaryProps) => {
  const selectedCount = [selectedCourse, selectedSemester, selectedSubject].filter(Boolean).length;

  if (selectedCount === 0) return null;

  return (
    <View style={styles.summaryCard}>
      <LinearGradient
        colors={[C.primary, C.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryHeader}
      >
        <Text style={styles.summaryHeaderText}>Active Session Details</Text>
      </LinearGradient>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCol}>
          <View style={styles.labelContainer}>
            <GraduationCap size={13} color={C.primaryMid} />
            <Text style={styles.summaryLabel}>Programme</Text>
          </View>
          <Text style={styles.summaryValue} numberOfLines={1}>
            {selectedCourse?.name ?? "—"}
          </Text>
        </View>

        <View style={[styles.summaryCol, styles.borderLeft]}>
          <View style={styles.labelContainer}>
            <Layers size={13} color={C.primaryMid} />
            <Text style={styles.summaryLabel}>Semester</Text>
          </View>
          <Text style={styles.summaryValue} numberOfLines={1}>
            {selectedSemester?.name ?? "—"}
          </Text>
        </View>

        <View style={[styles.summaryCol, styles.borderLeft]}>
          <View style={styles.labelContainer}>
            <BookOpen size={13} color={C.primaryMid} />
            <Text style={styles.summaryLabel}>Subject</Text>
          </View>
          <Text style={styles.summaryValue} numberOfLines={2}>
            {selectedSubject?.name ?? "—"}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  summaryHeader: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  summaryHeaderText: {
    fontSize: 14,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 0.3,
  },
  summaryRow: {
    flexDirection: "row",
    backgroundColor: C.white,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  summaryCol: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "flex-start",
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: C.border,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
  },
});
