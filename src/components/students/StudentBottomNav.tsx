import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layers, User } from "lucide-react-native";
import { C } from "../faculty/Theme";

type StudentTab = "dashboard" | "profile";

interface StudentBottomNavProps {
  activeTab: StudentTab;
  onTabPress: (tab: StudentTab) => void;
}

export const StudentBottomNav = React.memo(({ activeTab, onTabPress }: StudentBottomNavProps) => {
  return (
    <View style={styles.tabBar}>
      {/* Dashboard Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabPress("dashboard")}
        activeOpacity={0.8}
      >
        {activeTab === "dashboard" && <View style={styles.activeTabPill} />}
        <View style={[styles.tabIconWrap, activeTab === "dashboard" && styles.tabIconWrapActive]}>
          <Layers size={20} color={activeTab === "dashboard" ? C.white : C.textMuted} />
        </View>
        <Text style={[styles.tabLabel, activeTab === "dashboard" && styles.tabLabelActive]}>
          Dashboard
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabPress("profile")}
        activeOpacity={0.8}
      >
        {activeTab === "profile" && <View style={styles.activeTabPill} />}
        <View style={[styles.tabIconWrap, activeTab === "profile" && styles.tabIconWrapActive]}>
          <User size={20} color={activeTab === "profile" ? C.white : C.textMuted} />
        </View>
        <Text style={[styles.tabLabel, activeTab === "profile" && styles.tabLabelActive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingBottom: 6,
    paddingTop: 4,
    elevation: 16,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 4,
    gap: 4,
    position: "relative",
  },
  activeTabPill: {
    position: "absolute",
    top: 0,
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.primaryMid,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: C.primaryMid,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textMuted,
  },
  tabLabelActive: {
    color: C.primaryMid,
    fontWeight: "800",
  },
});
