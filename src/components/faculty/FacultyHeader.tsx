import { LinearGradient } from "expo-linear-gradient";
import { LogOut, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { C } from "./Theme";

interface FacultyHeaderProps {
  facultyName: string;
  onLogout: () => void;
}

export const FacultyHeader = React.memo(({ facultyName, onLogout }: FacultyHeaderProps) => {
  return (
    <LinearGradient
      colors={[C.primary, C.primaryMid, C.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerLeft}>
        <View style={styles.avatarCircle}>
          <User size={24} color={C.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName} numberOfLines={1}>
            {facultyName}
          </Text>
          <Text style={styles.headerRole}>Faculty Dashboard</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onLogout}
        style={styles.logoutBtn}
        activeOpacity={0.8}
      >
        <LogOut size={17} color={C.white} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "800",
    color: C.white,
    maxWidth: 200,
  },
  headerRole: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(3, 38, 133, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  logoutText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
