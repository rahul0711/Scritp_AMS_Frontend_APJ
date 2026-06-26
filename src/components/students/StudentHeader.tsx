import { Bell } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { C } from "../faculty/Theme";

interface StudentHeaderProps {
  greeting: string;
  name: string;
  enrollmentNo: string;
  semesterName: string;
  initials: string;
}

export const StudentHeader = React.memo(({
  greeting,
  name,
  enrollmentNo,
  semesterName,
  initials,
}: StudentHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.studentName} numberOfLines={1}>{name}</Text>
          <Text style={styles.headerSub}>
            {enrollmentNo}  ·  Sem {semesterName}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
        <Bell size={20} color={C.textMuted} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerInfo: {
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.primaryBorder,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: C.primaryMid,
  },
  greeting: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "500",
  },
  studentName: {
    fontSize: 17,
    fontWeight: "800",
    color: C.text,
  },
  headerSub: {
    fontSize: 11,
    color: C.textLight,
    fontWeight: "600",
    marginTop: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
});
