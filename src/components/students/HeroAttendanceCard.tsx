import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircularProgress } from "./CircularProgress";
import { C } from "../faculty/Theme";

interface HeroAttendanceCardProps {
  overallPercentage: number;
  presentLectures: number;
  absentLectures: number;
  totalLectures: number;
  isAttendanceSafe: boolean;
}

export const HeroAttendanceCard = React.memo(({
  overallPercentage,
  presentLectures,
  absentLectures,
  totalLectures,
  isAttendanceSafe,
}: HeroAttendanceCardProps) => {
  return (
    <View style={[styles.heroCard, !isAttendanceSafe && styles.heroCardDanger]}>
      <View style={styles.heroRow}>
        <CircularProgress
          percentage={overallPercentage}
          color={isAttendanceSafe ? C.primaryMid : C.danger}
          bgColor={isAttendanceSafe ? C.primaryBg : C.dangerBg}
        />
        <View style={styles.heroStats}>
          <Text style={[styles.heroTitle, !isAttendanceSafe && styles.heroTitleDanger]}>
            Overall Attendance
          </Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Present:</Text>
            <Text style={styles.statVal}>{presentLectures}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Absent:</Text>
            <Text style={styles.statVal}>{absentLectures}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Lectures:</Text>
            <Text style={styles.statVal}>{totalLectures}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.statusBadge, isAttendanceSafe ? styles.statusBadgeSafe : styles.statusBadgeDanger]}>
        <Text style={[styles.statusText, isAttendanceSafe ? styles.statusTextSafe : styles.statusTextDanger]}>
          {isAttendanceSafe
  ? "Requirement Satisfied"
  : "Requirement Not Satisfied"}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  heroCardDanger: {
    borderColor: C.dangerBorder,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  heroStats: {
    flex: 1,
    gap: 5,
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTitleDanger: {
    color: C.dangerDark,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#F3F4F6",
    paddingBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: "500",
  },
  statVal: {
    fontSize: 13,
    color: C.text,
    fontWeight: "700",
  },
  statusBadge: {
    marginTop: 14,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  statusBadgeSafe: {
    backgroundColor: C.successBg,
  },
  statusBadgeDanger: {
    backgroundColor: C.dangerBg,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  statusTextSafe: {
    color: C.successDark,
  },
  statusTextDanger: {
    color: C.dangerDark,
  },
});
