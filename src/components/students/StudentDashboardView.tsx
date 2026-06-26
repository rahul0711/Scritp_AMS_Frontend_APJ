import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { C } from "@/components/faculty/Theme";
import { fetchStudentAttendance, StudentAttendance, OverallAttendance } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

// ── Sub-components ──
import { HeroAttendanceCard } from "./HeroAttendanceCard";
import { LowAttendanceAlert } from "./LowAttendanceAlert";
import { QuickStats } from "./QuickStats";
import { StudentBottomNav } from "./StudentBottomNav";
import { StudentHeader } from "./StudentHeader";
import { StudentProfileScreen } from "./StudentProfileScreen";
import { SubjectAttendanceCard } from "./SubjectAttendanceCard";

type StudentTab = "dashboard" | "profile";

export const StudentDashboardView = () => {
  const router = useRouter();
  const studentData = useAuthStore((s) => s.studentData);
  const logout = useAuthStore((s) => s.logout);

  const [activeTab, setActiveTab] = useState<StudentTab>("dashboard");
  const [prevTab, setPrevTab] = useState<StudentTab>("dashboard");
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [overallAttendance, setOverallAttendance] = useState<OverallAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  // ── Redirect if not authenticated ──────────────────────────────────────────
  useEffect(() => {
    if (!studentData) {
      router.replace("/login");
    }
  }, [studentData]);

  const studentName = studentData?.name ?? "Student";
  const initials = useMemo(() => {
    return studentName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }, [studentName]);

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // ── Fetch Attendance Data ──────────────────────────────────────────────────
  const loadAttendanceData = useCallback(async (isRefresh = false) => {
    console.log("[DEBUG] studentData:", studentData);
    const regId = studentData
      ? (studentData.studentRegistrationId ||
         (studentData as any).StudentRegistrationId ||
         (studentData as any).studentRegistrationID ||
         (studentData as any).StudentRegistrationID ||
         (studentData as any).studentregistrationid)
      : undefined;

    if (!regId) {
      console.log("[DEBUG] No studentRegistrationId found in studentData");
      setLoading(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log("[DEBUG] Fetching attendance for ID:", regId);
      const data = await fetchStudentAttendance(regId);
      console.log("[DEBUG] Received attendance data:", JSON.stringify(data, null, 2));

      const rawAttendance = data.subjectAttendance || (data as any).SubjectAttendance || [];
      const mappedSubjects = rawAttendance.map((item: any) => ({
        subjectId: item.subjectId ?? item.SubjectId ?? 0,
        subjectName: item.subjectName ?? item.SubjectName ?? "",
        totalLectures: item.totalLectures ?? item.TotalLectures ?? 0,
        presentLectures: item.presentLectures ?? item.PresentLectures ?? 0,
        absentLectures: item.absentLectures ?? item.AbsentLectures ?? 0,
        attendancePercentage: item.attendancePercentage ?? item.AttendancePercentage ?? 0,
      }));

      const rawOverall = (data.overallAttendance || (data as any).OverallAttendance || null) as any;
      const mappedOverall = rawOverall ? {
        totalLectures: rawOverall.totalLectures ?? rawOverall.TotalLectures ?? 0,
        presentLectures: rawOverall.presentLectures ?? rawOverall.PresentLectures ?? 0,
        absentLectures: rawOverall.absentLectures ?? rawOverall.AbsentLectures ?? 0,
        attendancePercentage: rawOverall.attendancePercentage ?? rawOverall.AttendancePercentage ?? 0,
      } : null;

      setAttendance(mappedSubjects);
      setOverallAttendance(mappedOverall);
    } catch (err) {
      console.error("[DEBUG] Failed to load student attendance:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentData]);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  const onRefresh = useCallback(() => {
    loadAttendanceData(true);
  }, [loadAttendanceData]);

  // ── Tab Paging Sync ───────────────────────────────────────────────────────
  const tabOrder = useMemo<Record<StudentTab, number>>(() => ({
    dashboard: 0,
    profile: 1,
  }), []);

  const handleTabPress = useCallback((tab: StudentTab) => {
    const tabKeys: StudentTab[] = ["dashboard", "profile"];
    const index = tabKeys.indexOf(tab);
    if (index !== -1) {
      scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
      setPrevTab(activeTab);
      setActiveTab(tab);
    }
  }, [activeTab, SCREEN_WIDTH]);

  const onScrollEnd = useCallback((e: any) => {
    const xOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SCREEN_WIDTH);
    const tabKeys: StudentTab[] = ["dashboard", "profile"];
    const tab = tabKeys[index];
    if (tab && tab !== activeTab) {
      setPrevTab(activeTab);
      setActiveTab(tab);
    }
  }, [activeTab, SCREEN_WIDTH]);

  // ── Stats Calculations ─────────────────────────────────────────────────────
  const { totalLectures, presentLectures, absentLectures, overallPercentage } = useMemo(() => {
    if (overallAttendance) {
      return {
        totalLectures: overallAttendance.totalLectures,
        presentLectures: overallAttendance.presentLectures,
        absentLectures: overallAttendance.absentLectures,
        overallPercentage: overallAttendance.attendancePercentage,
      };
    }
    let total = 0;
    let present = 0;
    let absent = 0;
    attendance.forEach((item) => {
      total += item.totalLectures;
      present += item.presentLectures;
      absent += item.absentLectures;
    });
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { totalLectures: total, presentLectures: present, absentLectures: absent, overallPercentage: percentage };
  }, [attendance, overallAttendance]);

  const isAttendanceSafe = overallPercentage >= 75;

  // ── Scan for Low Attendance Warning ───────────────────────────────────────
  const lowAttendanceSubjects = useMemo(() => {
    return attendance
      .filter((item) => item.totalLectures > 0 && item.attendancePercentage < 75)
      .map((item) => {
        const currentP = item.presentLectures;
        const currentT = item.totalLectures;
        const needed = Math.max(0, 3 * currentT - 4 * currentP);
        return {
          ...item,
          consecutiveNeeded: needed,
        };
      });
  }, [attendance]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  }, [logout]);

  if (!studentData) return null;

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Tab Content ── */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.tabContent}
        contentContainerStyle={{ width: SCREEN_WIDTH * 2 }}
      >
        {/* Page 0: Dashboard */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          {/* Header */}
          <StudentHeader
            greeting={greeting}
            name={studentData.name}
            enrollmentNo={studentData.enrollmentNo}
            semesterName={studentData.semesterName}
            initials={initials}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={C.primaryMid} />
              <Text style={styles.loadingText}>Fetching attendance reports...</Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primaryMid]} />
              }
            >
              {/* Hero Attendance Card */}
              <HeroAttendanceCard
                overallPercentage={overallPercentage}
                presentLectures={presentLectures}
                absentLectures={absentLectures}
                totalLectures={totalLectures}
                isAttendanceSafe={isAttendanceSafe}
              />

              {/* Low Attendance Alert Warning */}
              <LowAttendanceAlert lowAttendanceSubjects={lowAttendanceSubjects} />

              {/* Quick Statistics (2x2 Grid) */}
              <QuickStats
                subjectsCount={attendance.length}
                presentLectures={presentLectures}
                absentLectures={absentLectures}
                totalLectures={totalLectures}
              />

              {/* Subject Attendance Section */}
              <Text style={styles.sectionHeading}>Subject Attendance</Text>
              {attendance.map((item) => (
                <SubjectAttendanceCard key={item.subjectId} item={item} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Page 1: Profile */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <StudentProfileScreen
            studentData={studentData}
            initials={initials}
            onLogout={handleLogout}
          />
        </View>
      </ScrollView>

      {/* ── Bottom Navigation Tab Bar (2 Tabs) ── */}
      <StudentBottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: C.textMuted,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: C.text,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 22,
    marginBottom: 10,
  },
});
