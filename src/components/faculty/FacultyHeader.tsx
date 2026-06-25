import { LinearGradient } from "expo-linear-gradient";
import { LogOut } from "lucide-react-native";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { C } from "./Theme";

interface FacultyHeaderProps {
  facultyName: string;
  onLogout: () => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const FacultyHeader = React.memo(({ facultyName, onLogout }: FacultyHeaderProps) => {
  const { initials, dateStr, dayStr } = useMemo(() => {
    const words = facultyName.trim().split(/\s+/);
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : words[0].slice(0, 2).toUpperCase();
    const now = new Date();
    const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const dayStr = DAYS[now.getDay()];
    return { initials, dateStr, dayStr };
  }, [facultyName]);

  return (
    <LinearGradient
      colors={C.headerGrad}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      {/* Decorative dot grid */}
      <View style={styles.dotGrid} pointerEvents="none">
        {[...Array(3)].map((_, r) => (
          <View key={r} style={{ flexDirection: "row", gap: 6, marginBottom: 6 }}>
            {[...Array(5)].map((_, c) => (
              <View
                key={c}
                style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)" }}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.left}>
        {/* Initials avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>{facultyName}</Text>
          <Text style={styles.role}>Faculty  ·  Attendance</Text>
        </View>
      </View>

      <View style={styles.right}>
        {/* Date pill */}
        <View style={styles.datePill}>
          <Text style={styles.dayText}>{dayStr}</Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        {/* Logout */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.8}>
          <LogOut size={16} color={C.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
    overflow: "hidden",
  },
  dotGrid: {
    position: "absolute",
    top: 8,
    right: 120,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 0.5,
  },
  nameBlock: { flex: 1 },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: C.white,
  },
  role: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
    fontWeight: "500",
  },
  right: {
    alignItems: "flex-end",
    gap: 8,
  },
  datePill: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  dayText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: C.white,
    fontWeight: "700",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220,38,38,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.35)",
  },
  logoutText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
