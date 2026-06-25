import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart2, LayoutDashboard, UserCircle } from "lucide-react-native";
import { C } from "./Theme";

export type FacultyTab = "dashboard" | "reports" | "profile";

interface BottomNavProps {
  activeTab: FacultyTab;
  onTabPress: (tab: FacultyTab) => void;
}

const TABS: { key: FacultyTab; label: string; Icon: any }[] = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "reports",   label: "Reports",   Icon: BarChart2 },
  { key: "profile",   label: "Profile",   Icon: UserCircle },
];

export const BottomNav = React.memo(({ activeTab, onTabPress }: BottomNavProps) => {
  return (
    <View style={styles.container}>
      {TABS.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            style={styles.tab}
            onPress={() => onTabPress(key)}
            activeOpacity={0.75}
          >
            {/* Active indicator pill */}
            {active && <View style={styles.activePill} />}

            {/* Icon */}
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Icon
                size={22}
                color={active ? C.white : C.textMuted}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </View>

            {/* Label */}
            <Text style={[styles.label, active && styles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingBottom: 6,
    paddingTop: 4,
    elevation: 16,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 4,
    gap: 4,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: 0,
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.primaryMid,
  },
  iconWrap: {
    width: 42,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: C.primaryMid,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textMuted,
  },
  labelActive: {
    color: C.primaryMid,
    fontWeight: "800",
  },
});
