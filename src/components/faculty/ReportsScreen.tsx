import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart2, BookOpen, Clock, TrendingUp } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C } from "./Theme";

interface ReportsScreenProps {
  facultyName: string;
}

export const ReportsScreen = React.memo(({ facultyName }: ReportsScreenProps) => {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header card */}
      <LinearGradient
        colors={[C.primary, C.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <BarChart2 size={28} color={C.white} />
        <View>
          <Text style={styles.headerTitle}>Attendance Reports</Text>
          <Text style={styles.headerSub}>Your session history &amp; analytics</Text>
        </View>
      </LinearGradient>

      {/* Coming-soon stat cards */}
      {[
        { Icon: TrendingUp, label: "Overall Attendance Rate", value: "—", color: C.success },
        { Icon: BookOpen, label: "Total Sessions Taken", value: "—", color: C.primaryMid },
        { Icon: Clock, label: "Last Session", value: "—", color: C.warn },
      ].map(({ Icon, label, value, color }) => (
        <View key={label} style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        </View>
      ))}

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>📊  Detailed reports coming soon</Text>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 36 },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: C.white },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 2,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statText: { flex: 1 },
  statLabel: { fontSize: 12, color: C.textMuted, fontWeight: "600" },
  statValue: { fontSize: 22, fontWeight: "800", color: C.text, marginTop: 2 },
  comingSoon: {
    marginTop: 8,
    backgroundColor: C.primaryBg,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.primaryBorder,
  },
  comingSoonText: { fontSize: 14, color: C.primaryMid, fontWeight: "600" },
});
