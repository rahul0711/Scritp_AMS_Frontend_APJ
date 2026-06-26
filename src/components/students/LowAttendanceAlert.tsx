import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { StudentAttendance } from "@/services/auth";
import { C } from "../faculty/Theme";

interface LowAttendanceAlertProps {
  lowAttendanceSubjects: (StudentAttendance & { consecutiveNeeded: number })[];
}

export const LowAttendanceAlert = React.memo(({ lowAttendanceSubjects }: LowAttendanceAlertProps) => {
  if (lowAttendanceSubjects.length === 0) return null;

  return (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <AlertTriangle size={18} color={C.danger} />
        <Text style={styles.alertTitle}>Attention Required</Text>
      </View>
      {lowAttendanceSubjects.map((item) => (
        <View key={item.subjectId} style={styles.alertRow}>
          <Text style={styles.alertSubject} numberOfLines={1}>{item.subjectName}</Text>
          <Text style={styles.alertPct}>{item.attendancePercentage}%</Text>
          {item.consecutiveNeeded > 0 && (
            <Text style={styles.alertInfo}>
              Need {item.consecutiveNeeded} more consecutive presents to reach safe attendance.
            </Text>
          )}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: C.dangerBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.dangerBorder,
    padding: 16,
    marginTop: 14,
    gap: 8,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.danger,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alertRow: {
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(239, 68, 68, 0.15)",
  },
  alertSubject: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
  },
  alertPct: {
    fontSize: 12,
    fontWeight: "700",
    color: C.danger,
    marginTop: 2,
  },
  alertInfo: {
    fontSize: 12,
    color: C.dangerDark,
    fontWeight: "600",
    marginTop: 2,
  },
});
