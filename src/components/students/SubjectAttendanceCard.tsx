import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, ChevronRight } from "lucide-react-native";
import { StudentAttendance } from "@/services/auth";
import { C } from "../faculty/Theme";

interface SubjectAttendanceCardProps {
  item: StudentAttendance;
}

export const SubjectAttendanceCard = React.memo(({ item }: SubjectAttendanceCardProps) => {
  const safe = item.attendancePercentage >= 75 || item.totalLectures === 0;
  return (
    <View style={styles.subjectCard}>
      <View style={styles.subjectCardHeader}>
        <View style={styles.subjectInfoLeft}>
          <View style={[styles.subIconCircle, { backgroundColor: safe ? C.primaryBg : C.dangerBg }]}>
            <BookOpen size={16} color={safe ? C.primaryMid : C.danger} />
          </View>
          <Text style={styles.subjectNameText} numberOfLines={1}>{item.subjectName}</Text>
        </View>
        <View style={styles.subjectInfoRight}>
          <Text style={[styles.subjectPctText, { color: safe ? C.text : C.danger }]}>
            {item.attendancePercentage}%
          </Text>
          <ChevronRight size={16} color={C.textLight} />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${item.attendancePercentage}%`,
              backgroundColor: safe ? C.success : C.danger,
            },
          ]}
        />
      </View>

      {/* Stats Line */}
      <Text style={styles.subjectStatsLine}>
        Present <Text style={styles.boldText}>{item.presentLectures}</Text>  ·  Absent <Text style={styles.boldText}>{item.absentLectures}</Text>  ·  Total <Text style={styles.boldText}>{item.totalLectures}</Text>
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  subjectCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 2,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  subjectCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subjectInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  subIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectNameText: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
    flex: 1,
  },
  subjectInfoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  subjectPctText: {
    fontSize: 15,
    fontWeight: "900",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  subjectStatsLine: {
    fontSize: 11.5,
    color: C.textMuted,
    fontWeight: "500",
  },
  boldText: {
    fontWeight: "800",
    color: C.text,
  },
});
