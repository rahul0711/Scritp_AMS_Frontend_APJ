import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, GraduationCap, LogOut, Mail, Phone, Shield, UserCircle } from "lucide-react-native";
import { C } from "./Theme";
import { UserData } from "@/services/auth";

interface ProfileScreenProps {
  record: UserData;
  onLogout: () => void;
}

export const ProfileScreen = React.memo(({ record, onLogout }: ProfileScreenProps) => {
  const initials = record.facultyName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const infoRows = [
    { Icon: Mail, label: "Email", value: record.emailId ?? "Not provided" },
    { Icon: Phone, label: "Contact", value: record.contactNo ?? "Not provided" },
    { Icon: Shield, label: "User Type", value: record.userType === "2" ? "Faculty" : record.userType },
    { Icon: GraduationCap, label: "Programme", value: record.courseName },
    { Icon: BookOpen, label: "Subject", value: record.subjectName },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Avatar + Name banner */}
      <LinearGradient
        colors={[C.primary, C.primaryMid, C.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{record.facultyName}</Text>
        <Text style={styles.username}>@{record.userName}</Text>
        <View style={styles.rolePill}>
          <UserCircle size={13} color={C.primaryMid} />
          <Text style={styles.roleText}>Faculty</Text>
        </View>
      </LinearGradient>

      {/* Info card */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        {infoRows.map(({ Icon, label, value }) => (
          <View key={label} style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon size={16} color={C.primaryMid} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.85}>
        <LogOut size={18} color={C.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 40 },

  // Banner
  banner: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: { fontSize: 30, fontWeight: "800", color: C.white },
  name: { fontSize: 20, fontWeight: "800", color: C.white, marginBottom: 4 },
  username: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { fontSize: 13, fontWeight: "700", color: C.primaryMid },

  // Info card
  infoCard: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 14,
    elevation: 3,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 10.5, fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: "700", color: C.text },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: C.dangerBg,
    borderWidth: 1.5,
    borderColor: C.dangerBorder,
  },
  logoutText: { fontSize: 16, fontWeight: "800", color: C.danger },
});
