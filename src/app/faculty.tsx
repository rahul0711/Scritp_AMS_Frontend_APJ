import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, Check } from "lucide-react-native";
import { useRouter } from "expo-router";

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

// Split faculty components
import { C } from "@/components/faculty/Theme";
import { OptionType } from "@/components/faculty/types";
import { FacultyHeader } from "@/components/faculty/FacultyHeader";
import { SessionSetup } from "@/components/faculty/SessionSetup";
import { SessionSummary } from "@/components/faculty/SessionSummary";
import { StudentRoster } from "@/components/faculty/StudentRoster";
import { BottomSheetPicker } from "@/components/faculty/BottomSheetPicker";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FacultyDashboard() {
  const router = useRouter();
  const allRecords = useAuthStore((s) => s.allRecords);
  const logout = useAuthStore((s) => s.logout);

  const facultyName = allRecords[0]?.facultyName ?? "Faculty";
  const userId = allRecords[0]?.userId;

  const courseOptions = useMemo(() => {
    const seen = new Set<number>();
    const options: OptionType[] = [];
    allRecords.forEach((r) => {
      if (r.courseId && r.courseName && !seen.has(r.courseId)) {
        seen.add(r.courseId);
        options.push({ id: r.courseId, name: r.courseName });
      }
    });
    return options;
  }, [allRecords]);

  const [selectedCourse, setSelectedCourse] = useState<OptionType | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<OptionType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<OptionType | null>(null);
  const [selectedTime, setSelectedTime] = useState<OptionType | null>(null);

  const [semesterOptions, setSemesterOptions] = useState<OptionType[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<OptionType[]>([]);
  const [timeOptions, setTimeOptions] = useState<OptionType[]>([]);

  const [students, setStudents] = useState<Student[]>([]);
  const [checkedStudents, setCheckedStudents] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [studentsMessage, setStudentsMessage] = useState<string | null>(null);

  // Grouped loading object
  const [loading, setLoading] = useState({
    time: false,
    semesters: false,
    subjects: false,
    students: false,
  });

  const setLoad = useCallback(
    (key: keyof typeof loading, val: boolean) =>
      setLoading((prev) => (prev[key] === val ? prev : { ...prev, [key]: val })),
    []
  );

  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Picker state
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

  const closePicker = useCallback(() =>
    setPicker((p) => ({ ...p, visible: false })), []);

  // Smooth layout animation when critical filter or roster states change
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [
    showFilters,
    selectedCourse,
    selectedSemester,
    selectedSubject,
    selectedTime,
    loading.students,
    students.length,
    studentsMessage,
  ]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.nameAsPerMarksheet?.toLowerCase().includes(q)) ||
        (s.enrollmentNo?.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  // Fetch time slots once on mount
  useEffect(() => {
    setLoad("time", true);
    fetchTime()
      .then((data) => setTimeOptions(data.map((t) => ({ id: t.timeSlotId, name: t.timeSlotName }))))
      .catch((err) => console.error("Error fetching time slots:", err))
      .finally(() => setLoad("time", false));
  }, [setLoad]);

  // Fetch semesters when course changes
  useEffect(() => {
    if (!selectedCourse) { setSemesterOptions([]); setSelectedSemester(null); return; }
    if (!userId) return;
    setLoad("semesters", true);
    setSemesterOptions([]);
    setSelectedSemester(null);
    setSelectedSubject(null);
    fetchSemesters(userId, selectedCourse.id)
      .then((data) => {
        const mapped = data.map((s) => ({ id: s.semesterId, name: s.semesterName }));
        setSemesterOptions(mapped);
        if (mapped.length === 1) setSelectedSemester(mapped[0]);
      })
      .catch(() => Alert.alert("Error", "Failed to fetch semesters."))
      .finally(() => setLoad("semesters", false));
  }, [selectedCourse, userId, setLoad]);

  // Fetch subjects when semester changes
  useEffect(() => {
    if (!selectedSemester || !selectedCourse) { setSubjectOptions([]); setSelectedSubject(null); return; }
    if (!userId) return;
    setLoad("subjects", true);
    setSubjectOptions([]);
    setSelectedSubject(null);
    fetchSubjects(userId, selectedCourse.id, selectedSemester.id)
      .then((data) => {
        const mapped = data.map((s) => ({ id: s.subjectId, name: s.subjectName }));
        setSubjectOptions(mapped);
        if (mapped.length === 1) setSelectedSubject(mapped[0]);
      })
      .catch(() => Alert.alert("Error", "Failed to fetch subjects."))
      .finally(() => setLoad("subjects", false));
  }, [selectedSemester, selectedCourse, userId, setLoad]);

  // Fetch students — reset + fetch in ONE effect
  const fetchAbortRef = useRef(false);

  useEffect(() => {
    setStudents([]);
    setCheckedStudents({});
    setIsSubmitted(false);
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
        setStudentsMessage(err?.response?.data?.message || err?.message || "Failed to fetch students.");
      })
      .finally(() => {
        if (!fetchAbortRef.current) setLoad("students", false);
      });

    return () => { fetchAbortRef.current = true; };
  }, [selectedCourse, selectedSemester, selectedSubject, selectedTime, userId]);

  const handleSubmit = useCallback(async () => {
    if (!selectedCourse || !selectedSemester || !selectedSubject || !selectedTime || !userId) {
      Alert.alert("Error", "Please select all 4 filters first."); return;
    }
    setSubmitting(true);
    try {
      const result = await facultyInAttendance({
        userId, courseId: selectedCourse.id, semesterId: selectedSemester.id,
        subjectId: selectedSubject.id, timeSlotId: selectedTime.id, remarks: "Lecture Started",
      });
      Alert.alert("Success", result.message || "Attendance started successfully!");
      setIsSubmitted(true);
      setLoad("students", true); setStudents([]); setStudentsMessage(null);
      const res = await fetchStudents(userId, selectedCourse.id, selectedSemester.id, selectedSubject.id, selectedTime.id);
      if (res.success && Array.isArray(res.students)) {
        setStudents(res.students);
        const init: Record<number, boolean> = {};
        res.students.forEach((s) => { init[s.studentRegistrationId] = true; });
        setCheckedStudents(init);
      } else {
        setStudentsMessage(res.message || "No students found."); setIsSubmitted(false);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to submit attendance.");
    } finally {
      setSubmitting(false); setLoad("students", false);
    }
  }, [selectedCourse, selectedSemester, selectedSubject, selectedTime, userId, setLoad]);

  const handleSaveAttendance = useCallback(async () => {
    if (!selectedCourse || !selectedSemester || !selectedSubject || !selectedTime || !userId) {
      Alert.alert("Error", "Missing required filters."); return;
    }
    setSavingAttendance(true);
    try {
      const res = await saveAttendance({
        userId, courseId: selectedCourse.id, semesterId: selectedSemester.id,
        subjectId: selectedSubject.id, attendanceDate: new Date().toISOString().split("T")[0],
        students: students.map((s) => ({
          StudentRegistrationId: s.studentRegistrationId,
          status: checkedStudents[s.studentRegistrationId] ? ("P" as const) : ("A" as const),
        })),
      });
      Alert.alert(res.success ? "Success" : "Error", res.message || (res.success ? "Saved!" : "Failed."));
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to save attendance.");
    } finally {
      setSavingAttendance(false);
    }
  }, [selectedCourse, selectedSemester, selectedSubject, selectedTime, userId, students, checkedStudents]);

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => { logout(); router.replace("/login" as any); } },
    ]);
  }, [logout, router]);

  const allFiltersSet = !!(selectedCourse && selectedSemester && selectedSubject && selectedTime);
  const presentCount = useMemo(() => Object.values(checkedStudents).filter(Boolean).length, [checkedStudents]);
  const absentCount = students.length - presentCount;

  // Memoized toggle-all handler
  const handleToggleAll = useCallback(() => {
    const allChecked = filteredStudents.every((s) => checkedStudents[s.studentRegistrationId]);
    const next = { ...checkedStudents };
    filteredStudents.forEach((s) => { next[s.studentRegistrationId] = !allChecked; });
    setCheckedStudents(next);
  }, [filteredStudents, checkedStudents]);

  // Memoized per-student toggle
  const handleToggleStudent = useCallback((id: number, current: boolean) => {
    setCheckedStudents((prev) => ({ ...prev, [id]: !current }));
  }, []);

  const allChecked = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => checkedStudents[s.studentRegistrationId]);
  }, [filteredStudents, checkedStudents]);

  return (
    <SafeAreaView style={s.root}>
      {/* ── Header ── */}
      <FacultyHeader facultyName={facultyName} onLogout={handleLogout} />

      {students.length > 0 ? (
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
          ListHeaderComponent={
            <SessionSetup
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((p) => !p)}
              selectedCourse={selectedCourse}
              selectedSemester={selectedSemester}
              selectedSubject={selectedSubject}
              selectedTime={selectedTime}
              loadingSemesters={loading.semesters}
              loadingSubjects={loading.subjects}
              loadingTime={loading.time}
              onPressCourse={() => openPicker("Course", courseOptions, selectedCourse, setSelectedCourse)}
              onPressSemester={() => {
                if (!selectedCourse) {
                  Alert.alert("Info", "Please select a Course first.");
                  return;
                }
                openPicker("Semester", semesterOptions, selectedSemester, setSelectedSemester);
              }}
              onPressSubject={() => {
                if (!selectedSemester) {
                  Alert.alert("Info", "Please select a Semester first.");
                  return;
                }
                openPicker("Subject", subjectOptions, selectedSubject, setSelectedSubject);
              }}
              onPressTime={() => openPicker("Time Slot", timeOptions, selectedTime, setSelectedTime)}
              onResetFilters={() => {
                setSelectedCourse(null);
                setSelectedSemester(null);
                setSelectedSubject(null);
                setSelectedTime(null);
              }}
              allFiltersSet={allFiltersSet}
              studentsMessage={studentsMessage}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          }
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
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ── Session Setup ── */}
          <SessionSetup
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((p) => !p)}
            selectedCourse={selectedCourse}
            selectedSemester={selectedSemester}
            selectedSubject={selectedSubject}
            selectedTime={selectedTime}
            loadingSemesters={loading.semesters}
            loadingSubjects={loading.subjects}
            loadingTime={loading.time}
            onPressCourse={() => openPicker("Course", courseOptions, selectedCourse, setSelectedCourse)}
            onPressSemester={() => {
              if (!selectedCourse) {
                Alert.alert("Info", "Please select a Course first.");
                return;
              }
              openPicker("Semester", semesterOptions, selectedSemester, setSelectedSemester);
            }}
            onPressSubject={() => {
              if (!selectedSemester) {
                Alert.alert("Info", "Please select a Semester first.");
                return;
              }
              openPicker("Subject", subjectOptions, selectedSubject, setSelectedSubject);
            }}
            onPressTime={() => openPicker("Time Slot", timeOptions, selectedTime, setSelectedTime)}
            onResetFilters={() => {
              setSelectedCourse(null);
              setSelectedSemester(null);
              setSelectedSubject(null);
              setSelectedTime(null);
            }}
            allFiltersSet={allFiltersSet}
            studentsMessage={studentsMessage}
            submitting={submitting}
            onSubmit={handleSubmit}
          />

          {/* ── Active Selection Summary ── */}
          <SessionSummary
            selectedCourse={selectedCourse}
            selectedSemester={selectedSemester}
            selectedSubject={selectedSubject}
            selectedTime={selectedTime}
          />

          {/* ── Student Section ── */}
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

      {/* ── Sticky Save Button ── */}
      {students.length > 0 && (
        <View style={s.stickyBottom}>
          <TouchableOpacity onPress={handleSaveAttendance} disabled={savingAttendance} activeOpacity={0.85} style={s.saveBtn}>
            <LinearGradient colors={[C.success, "#047857"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveGrad}>
              {savingAttendance
                ? <ActivityIndicator size="small" color={C.white} />
                : <>
                  <Check size={20} color={C.white} strokeWidth={2.5} />
                  <Text style={s.saveText}>Save Attendance</Text>
                </>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bottom Sheet Picker ── */}
      <BottomSheetPicker
        visible={picker.visible}
        label={picker.label}
        options={picker.options}
        selected={picker.selected}
        onSelect={picker.onSelect ?? (() => {})}
        onClose={closePicker}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 36 },
  loadingCard: { backgroundColor: C.white, borderRadius: 20, padding: 36, alignItems: "center", marginBottom: 14, borderWidth: 1, borderColor: C.border },
  loadingText: { color: C.textMuted, fontSize: 14, marginTop: 12 },
  warnCard: { backgroundColor: C.warnBg, borderRadius: 18, padding: 24, alignItems: "center", borderWidth: 1.5, borderColor: C.warnBorder, marginBottom: 14, gap: 8 },
  warnTitle: { fontSize: 16, fontWeight: "800", color: C.warn },
  warnText: { color: "#92400E", fontSize: 14, fontWeight: "500", textAlign: "center", lineHeight: 22 },
  stickyBottom: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn: { borderRadius: 18, overflow: "hidden" },
  saveGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 17, gap: 10 },
  saveText: { color: C.white, fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
});
