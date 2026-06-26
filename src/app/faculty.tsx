import { NotificationBanner } from "@/components/faculty/NotificationBanner";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircle, Check, PlayCircle } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeOutDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  facultyInAttendance,
  fetchSemesters,
  fetchStudents,
  fetchSubjects,
  fetchTime,
  saveAttendance,
  Student,
} from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

import { BottomNav, FacultyTab } from "@/components/faculty/BottomNav";
import { BottomSheetPicker } from "@/components/faculty/BottomSheetPicker";
import { FacultyHeader } from "@/components/faculty/FacultyHeader";
import { ProfileScreen } from "@/components/faculty/ProfileScreen";
import { ReportsScreen } from "@/components/faculty/ReportsScreen";
import { SessionSetup } from "@/components/faculty/SessionSetup";
import { SessionSummary } from "@/components/faculty/SessionSummary";
import { StudentRoster } from "@/components/faculty/StudentRoster";
import { C } from "@/components/faculty/Theme";
import { OptionType } from "@/components/faculty/types";

const isFabric = !!(globalThis as any).nativeFabricUIManager;
if (
  Platform.OS === "android" &&
  !isFabric &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type LoadingKey = "time" | "semesters" | "subjects" | "students";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FacultyDashboard() {
  const router = useRouter();
  const allRecords = useAuthStore((s) => s.allRecords);
  const logout = useAuthStore((s) => s.logout);

  const facultyName = allRecords[0]?.facultyName ?? "Faculty";
  const userId = allRecords[0]?.userId;

  // ── Course options (derived from auth store, never changes) ──────────────
  const courseOptions = useMemo<OptionType[]>(() => {
    const seen = new Set<number>();
    return allRecords.reduce<OptionType[]>((acc, r) => {
      if (r.courseId && r.courseName && !seen.has(r.courseId)) {
        seen.add(r.courseId);
        acc.push({ id: r.courseId, name: r.courseName });
      }
      return acc;
    }, []);
  }, [allRecords]);

  // ── Selections ────────────────────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState<OptionType | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<OptionType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<OptionType | null>(null);
  const [selectedTime, setSelectedTime] = useState<OptionType | null>(null);
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  const showBanner = useCallback((message: string, type: "success" | "error") => {
    setNotification({ visible: true, message, type });
  }, []);

  const hideBanner = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  // ── Option lists ──────────────────────────────────────────────────────────
  const [semesterOptions, setSemesterOptions] = useState<OptionType[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<OptionType[]>([]);
  const [timeOptions, setTimeOptions] = useState<OptionType[]>([]);

  // ── In-memory caches (survive re-renders, cleared on logout) ─────────────
  /** Map courseId → semester options */
  const semesterCache = useRef<Map<number, OptionType[]>>(new Map());
  /** Map `${courseId}:${semesterId}` → subject options */
  const subjectCache = useRef<Map<string, OptionType[]>>(new Map());

  // ── Student roster ───────────────────────────────────────────────────────
  const [students, setStudents] = useState<Student[]>([]);
  const [checkedStudents, setCheckedStudents] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [studentsMessage, setStudentsMessage] = useState<string | null>(null);

  // ── Loading states (grouped) ─────────────────────────────────────────────
  const [loading, setLoading] = useState<Record<LoadingKey, boolean>>({
    time: false,
    semesters: false,
    subjects: false,
    students: false,
  });

  const setLoad = useCallback(
    (key: LoadingKey, val: boolean) =>
      setLoading((prev) => (prev[key] === val ? prev : { ...prev, [key]: val })),
    []
  );

  // ── Submission / saving ───────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // ── Active bottom-nav tab ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<FacultyTab>("dashboard");
  const [prevTab, setPrevTab] = useState<FacultyTab>("dashboard");
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  const tabOrder = useMemo<Record<FacultyTab, number>>(() => ({
    dashboard: 0,
    reports: 1,
    profile: 2,
  }), []);

  const handleTabPress = useCallback((tab: FacultyTab) => {
    const tabKeys: FacultyTab[] = ["dashboard", "reports", "profile"];
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
    const tabKeys: FacultyTab[] = ["dashboard", "reports", "profile"];
    const tab = tabKeys[index];
    if (tab && tab !== activeTab) {
      setPrevTab(activeTab);
      setActiveTab(tab);
    }
  }, [activeTab, SCREEN_WIDTH]);

  // ── Picker state ──────────────────────────────────────────────────────────
  const [picker, setPicker] = useState<{
    visible: boolean;
    label: string;
    options: OptionType[];
    selected: OptionType | null;
    onSelect: ((val: OptionType) => void) | null;
  }>({
    visible: false,
    label: "",
    options: [],
    selected: null,
    onSelect: null,
  });

  const openPicker = useCallback((
    label: string,
    options: OptionType[],
    current: OptionType | null,
    onSelect: (val: OptionType) => void
  ) => {
    setPicker({ visible: true, label, options, selected: current, onSelect });
  }, []);

  const closePicker = useCallback(
    () => setPicker((p) => ({ ...p, visible: false })),
    []
  );

  // ── Toggle filter panel (instant, 200ms animation) ────────────────────────
  // No longer needed — SessionSetup is always visible

  // ─────────────────────────────────────────────────────────────────────────
  // Derived / Memoized values
  // ─────────────────────────────────────────────────────────────────────────
  const allFiltersSet = useMemo(
    () => !!(selectedCourse && selectedSemester && selectedSubject && selectedTime),
    [selectedCourse, selectedSemester, selectedSubject, selectedTime]
  );

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.nameAsPerMarksheet?.toLowerCase().includes(q) ||
        s.enrollmentNo?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const presentCount = useMemo(
    () => Object.values(checkedStudents).filter(Boolean).length,
    [checkedStudents]
  );
  const absentCount = useMemo(
    () => students.length - presentCount,
    [students.length, presentCount]
  );

  const allChecked = useMemo(
    () => filteredStudents.length > 0 && filteredStudents.every((s) => checkedStudents[s.studentRegistrationId]),
    [filteredStudents, checkedStudents]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Effects — Data fetching with caching
  // ─────────────────────────────────────────────────────────────────────────

  // Fetch time slots once (cached implicitly by component lifetime)
  useEffect(() => {
    if (timeOptions.length > 0) return; // already loaded
    setLoad("time", true);
    fetchTime()
      .then((data) => setTimeOptions(data.map((t) => ({ id: t.timeSlotId, name: t.timeSlotName }))))
      .catch((err) => console.error("Error fetching time slots:", err))
      .finally(() => setLoad("time", false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch semesters when course changes — with cache
  useEffect(() => {
    if (!selectedCourse) {
      setSemesterOptions([]);
      setSelectedSemester(null);
      return;
    }
    if (!userId) return;

    const cached = semesterCache.current.get(selectedCourse.id);
    if (cached) {
      setSemesterOptions(cached);
      if (cached.length === 1) setSelectedSemester(cached[0]);
      return;
    }

    setLoad("semesters", true);
    setSemesterOptions([]);
    setSelectedSemester(null);
    setSelectedSubject(null);

    fetchSemesters(userId, selectedCourse.id)
      .then((data) => {
        const mapped = data.map((s) => ({ id: s.semesterId, name: s.semesterName }));
        semesterCache.current.set(selectedCourse.id, mapped);
        setSemesterOptions(mapped);
        if (mapped.length === 1) setSelectedSemester(mapped[0]);
      })
      .catch(() => showBanner("Failed to fetch semesters.", "error"))
      .finally(() => setLoad("semesters", false));
  }, [selectedCourse, userId, setLoad, showBanner]);

  // Fetch subjects when semester changes — with cache
  useEffect(() => {
    if (!selectedSemester || !selectedCourse) {
      setSubjectOptions([]);
      setSelectedSubject(null);
      return;
    }
    if (!userId) return;

    const cacheKey = `${selectedCourse.id}:${selectedSemester.id}`;
    const cached = subjectCache.current.get(cacheKey);
    if (cached) {
      setSubjectOptions(cached);
      if (cached.length === 1) setSelectedSubject(cached[0]);
      return;
    }

    setLoad("subjects", true);
    setSubjectOptions([]);
    setSelectedSubject(null);

    fetchSubjects(userId, selectedCourse.id, selectedSemester.id)
      .then((data) => {
        const mapped = data.map((s) => ({ id: s.subjectId, name: s.subjectName }));
        subjectCache.current.set(cacheKey, mapped);
        setSubjectOptions(mapped);
        if (mapped.length === 1) setSelectedSubject(mapped[0]);
      })
      .catch(() => showBanner("Failed to fetch subjects.", "error"))
      .finally(() => setLoad("subjects", false));
  }, [selectedSemester, selectedCourse, userId, setLoad, showBanner]);

  // Fetch students — abort on unmount/deps change
  const fetchAbortRef = useRef(false);

  useEffect(() => {
    setStudents([]);
    setCheckedStudents({});
    setSearchQuery("");
    setStudentsMessage(null);

    if (!selectedCourse || !selectedSemester || !selectedSubject || !selectedTime || !userId) return;

    fetchAbortRef.current = false;
    setLoad("students", true);

    fetchStudents(userId, selectedCourse.id, selectedSemester.id, selectedSubject.id, selectedTime.id)
      .then((res) => {
        if (fetchAbortRef.current) return;
        if (res.success && Array.isArray(res.students)) {
          setStudents(res.students);
          const init: Record<number, boolean> = {};
          res.students.forEach((s) => { init[s.studentRegistrationId] = true; });
          setCheckedStudents(init);
        } else {
          setStudentsMessage(res.message || "No students found.");
        }
      })
      .catch((err) => {
        if (fetchAbortRef.current) return;
        setStudentsMessage(
          err?.response?.data?.message || err?.message || "Failed to fetch students."
        );
      })
      .finally(() => {
        if (!fetchAbortRef.current) setLoad("students", false);
      });

    return () => { fetchAbortRef.current = true; };
  }, [selectedCourse, selectedSemester, selectedSubject, selectedTime, userId]);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!selectedCourse || !selectedSemester || !selectedSubject || !selectedTime || !userId) {
      showBanner("Please select all 4 filters first.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const result = await facultyInAttendance({
        userId,
        courseId: selectedCourse.id,
        semesterId: selectedSemester.id,
        subjectId: selectedSubject.id,
        timeSlotId: selectedTime.id,
        remarks: "Lecture Started",
      });

      // Trigger Success Notification banner
      showBanner("Class started successfully!", "success");

      setLoad("students", true);
      setStudents([]);
      setStudentsMessage(null);
      const res = await fetchStudents(
        userId, selectedCourse.id, selectedSemester.id, selectedSubject.id, selectedTime.id
      );
      if (res.success && Array.isArray(res.students)) {
        setStudents(res.students);
        const init: Record<number, boolean> = {};
        res.students.forEach((s) => { init[s.studentRegistrationId] = true; });
        setCheckedStudents(init);
      } else {
        setStudentsMessage(res.message || "No students found.");
      }
    } catch (err: any) {
      showBanner(err?.response?.data?.message || err?.message || "Failed to submit attendance.", "error");
    } finally {
      setSubmitting(false);
      setLoad("students", false);
    }
  }, [selectedCourse, selectedSemester, selectedSubject, selectedTime, userId, setLoad, showBanner]);

  const handleSaveAttendance = useCallback(async () => {
    if (!selectedCourse || !selectedSemester || !selectedSubject || !selectedTime || !userId) {
      showBanner("Missing required filters.", "error");
      return;
    }
    setSavingAttendance(true);
    try {
      const res = await saveAttendance({
        userId,
        courseId: selectedCourse.id,
        semesterId: selectedSemester.id,
        subjectId: selectedSubject.id,
        attendanceDate: new Date().toISOString().split("T")[0],
        students: students.map((s) => ({
          StudentRegistrationId: s.studentRegistrationId,
          status: checkedStudents[s.studentRegistrationId] ? ("P" as const) : ("A" as const),
        })),
      });
      if (res.success) {
        showBanner("Attendance saved successfully!", "success");
      } else {
        showBanner(res.message || "Failed to save.", "error");
      }
    } catch (err: any) {
      showBanner(err?.response?.data?.message || err?.message || "Failed to save attendance.", "error");
    } finally {
      setSavingAttendance(false);
    }
  }, [selectedCourse, selectedSemester, selectedSubject, selectedTime, userId, students, checkedStudents, showBanner]);

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // Clear caches on logout
          semesterCache.current.clear();
          subjectCache.current.clear();
          logout();
          router.replace("/login" as any);
        },
      },
    ]);
  }, [logout, router]);

  const handleToggleAll = useCallback(() => {
    const allCheckedNow = filteredStudents.every((s) => checkedStudents[s.studentRegistrationId]);
    const next = { ...checkedStudents };
    filteredStudents.forEach((s) => { next[s.studentRegistrationId] = !allCheckedNow; });
    setCheckedStudents(next);
  }, [filteredStudents, checkedStudents]);

  const handleToggleStudent = useCallback((id: number, current: boolean) => {
    setCheckedStudents((prev) => ({ ...prev, [id]: !current }));
  }, []);

  // ── Picker openers (stable references via useCallback) ───────────────────
  const openCoursePicker = useCallback(() => {
    openPicker("Course", courseOptions, selectedCourse, setSelectedCourse);
  }, [courseOptions, selectedCourse, openPicker]);

  const openSemesterPicker = useCallback(() => {
    if (!selectedCourse) { Alert.alert("Info", "Please select a Course first."); return; }
    openPicker("Semester", semesterOptions, selectedSemester, setSelectedSemester);
  }, [selectedCourse, semesterOptions, selectedSemester, openPicker]);

  const openSubjectPicker = useCallback(() => {
    if (!selectedSemester) { Alert.alert("Info", "Please select a Semester first."); return; }
    openPicker("Subject", subjectOptions, selectedSubject, setSelectedSubject);
  }, [selectedSemester, subjectOptions, selectedSubject, openPicker]);

  const openTimePicker = useCallback(() => {
    openPicker("Time Slot", timeOptions, selectedTime, setSelectedTime);
  }, [timeOptions, selectedTime, openPicker]);

  const handleResetFilters = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedTime(null);
  }, []);

  // ── Shared SessionSetup props ────────────────────────────────────────────
  const sessionSetupProps = useMemo(() => ({
    selectedCourse,
    selectedSemester,
    selectedSubject,
    selectedTime,
    loadingSemesters: loading.semesters,
    loadingSubjects: loading.subjects,
    loadingTime: loading.time,
    onPressCourse: openCoursePicker,
    onPressSemester: openSemesterPicker,
    onPressSubject: openSubjectPicker,
    onPressTime: openTimePicker,
    onResetFilters: handleResetFilters,
    allFiltersSet,
    studentsMessage,
    submitting,
    onSubmit: handleSubmit,
  }), [
    selectedCourse, selectedSemester, selectedSubject, selectedTime,
    loading.semesters, loading.subjects, loading.time,
    openCoursePicker, openSemesterPicker, openSubjectPicker, openTimePicker,
    handleResetFilters, allFiltersSet, studentsMessage, submitting, handleSubmit,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      {/* ── Tab Content ── */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={s.tabContent}
        contentContainerStyle={{ width: SCREEN_WIDTH * 3 }}
      >
        {/* Page 0: Dashboard */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <FacultyHeader facultyName={facultyName} onLogout={handleLogout} />
          {students.length > 0 ? (
            // ── Student Roster view ──
            <StudentRoster
              students={students}
              filteredStudents={filteredStudents}
              checkedStudents={checkedStudents}
              presentCount={presentCount}
              absentCount={absentCount}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onToggleAll={handleToggleAll}
              onToggleStudent={handleToggleStudent}
              allChecked={allChecked}
              ListHeaderComponent={<SessionSetup {...sessionSetupProps} />}
              ListHeaderComponent2={
                <SessionSummary
                  selectedCourse={selectedCourse}
                  selectedSemester={selectedSemester}
                  selectedSubject={selectedSubject}
                  selectedTime={selectedTime}
                />
              }
            />
          ) : (
            // ── Setup view ──
            <ScrollView
              style={s.scroll}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <SessionSetup {...sessionSetupProps} />

              <SessionSummary
                selectedCourse={selectedCourse}
                selectedSemester={selectedSemester}
                selectedSubject={selectedSubject}
                selectedTime={selectedTime}
              />

              {/* Student loading / message states */}
              {loading.students ? (
                <View style={s.loadingCard}>
                  <ActivityIndicator size="large" color={C.primary} />
                  <Text style={s.loadingText}>Loading student roster...</Text>
                </View>
              ) : studentsMessage ? (
                <View style={s.warnCard}>
                  <AlertCircle size={28} color={C.warn} />
                  <Text style={s.warnTitle}>Notice</Text>
                  <Text style={s.warnText}>{studentsMessage}</Text>
                </View>
              ) : null}
            </ScrollView>
          )}
        </View>

        {/* Page 1: Reports */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <ReportsScreen facultyName={facultyName} />
        </View>

        {/* Page 2: Profile */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          {allRecords[0] ? (
            <ProfileScreen record={allRecords[0]} onLogout={handleLogout} />
          ) : null}
        </View>
      </ScrollView>

      {/* ── Floating Action Button (FAB) ── */}
      {activeTab === "dashboard" && (
        ((students.length === 0 && allFiltersSet) || (students.length > 0)) && (
          <Animated.View
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.duration(200)}
            style={s.fab}
          >
            <TouchableOpacity
              onPress={students.length === 0 ? handleSubmit : handleSaveAttendance}
              disabled={students.length === 0 ? submitting : savingAttendance}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[C.success, C.successDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.fabGrad}
              >
                {students.length === 0 ? (
                  submitting ? (
                    <ActivityIndicator size="small" color={C.white} />
                  ) : (
                    <>
                      <PlayCircle size={20} color={C.white} />
                      <Text style={s.fabText}>Start Class</Text>
                    </>
                  )
                ) : (
                  savingAttendance ? (
                    <ActivityIndicator size="small" color={C.white} />
                  ) : (
                    <>
                      <Check size={20} color={C.white} strokeWidth={2.5} />
                      <Text style={s.fabText}>Save Attendance</Text>
                    </>
                  )
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )
      )}

      {/* ── Bottom Sheet Picker ── */}
      <BottomSheetPicker
        visible={picker.visible}
        label={picker.label}
        options={picker.options}
        selected={picker.selected}
        onSelect={picker.onSelect ?? (() => { })}
        onClose={closePicker}
      />

      {/* ── Bottom Navigation ── */}
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />

      {/* ── Notification Banner ── */}
      <NotificationBanner
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onClose={hideBanner}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  tabContent: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
  },

  // Loading / warning cards
  loadingCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  loadingText: {
    color: C.textMuted,
    fontSize: 14,
    marginTop: 12,
    fontWeight: "500",
  },
  warnCard: {
    backgroundColor: C.warnBg,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.warnBorder,
    marginBottom: 14,
    gap: 8,
    elevation: 2,
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  warnTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.warn,
  },
  warnText: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },

  // Floating Action Button
  fab: {
    position: "absolute",
    bottom: 85,
    right: 18,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 8,
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 100,
  },
  fabGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 18,
    gap: 8,
  },
  fabText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
