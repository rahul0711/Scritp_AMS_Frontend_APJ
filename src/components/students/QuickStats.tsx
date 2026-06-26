import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, CheckCircle2, Layers, XCircle } from "lucide-react-native";
import { C } from "../faculty/Theme";

interface QuickStatsProps {
  subjectsCount: number;
  presentLectures: number;
  absentLectures: number;
  totalLectures: number;
}

export const QuickStats = React.memo(({
  subjectsCount,
  presentLectures,
  absentLectures,
  totalLectures,
}: QuickStatsProps) => {
  return (
    <View style={styles.statsGrid}>
      {/* Subjects */}
      <View style={styles.gridCard}>
        <View style={[styles.gridIconWrap, { backgroundColor: C.primaryBg }]}>
          <BookOpen size={16} color={C.primaryMid} />
        </View>
        <Text style={styles.gridNumber}>{subjectsCount}</Text>
        <Text style={styles.gridLabel}>Registered Subjects</Text>
      </View>

      {/* Present */}
      <View style={styles.gridCard}>
        <View style={[styles.gridIconWrap, { backgroundColor: C.successBg }]}>
          <CheckCircle2 size={16} color={C.success} />
        </View>
        <Text style={styles.gridNumber}>{presentLectures}</Text>
        <Text style={styles.gridLabel}>Present Lectures</Text>
      </View>

      {/* Absent */}
      <View style={styles.gridCard}>
        <View style={[styles.gridIconWrap, { backgroundColor: C.dangerBg }]}>
          <XCircle size={16} color={C.danger} />
        </View>
        <Text style={styles.gridNumber}>{absentLectures}</Text>
        <Text style={styles.gridLabel}>Absent Lectures</Text>
      </View>

      {/* Total */}
      <View style={styles.gridCard}>
        <View style={[styles.gridIconWrap, { backgroundColor: "#F3F4F6" }]}>
          <Layers size={16} color="#4B5563" />
        </View>
        <Text style={styles.gridNumber}>{totalLectures}</Text>
        <Text style={styles.gridLabel}>Total Lectures</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 10,
  },
  gridCard: {
    width: "48%",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 2,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  gridIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },
  gridLabel: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
});
