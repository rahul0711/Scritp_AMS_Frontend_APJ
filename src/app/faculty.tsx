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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
  Layers,
  LogOut,
  Search,
  SlidersHorizontal,
  User,
  Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OptionType = { id: number; name: string };

// ── Colour tokens — darker navy/blue palette ──────────────────
const C = {
  primary: "#0D3B8E",   // deep navy blue
  primaryMid: "#1451B8",   // mid royal blue
  primaryLight: "#1E6FE8",   // bright blue
  primaryBg: "#E8EFFE",
  primaryBorder: "#C3D4F7",
  success: "#059669",
  successBg: "#D1FAE5",
  warn: "#D97706",
  warnBg: "#FEF3C7",
  warnBorder: "#FDE68A",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  text: "#0A1832",
  textMuted: "#5A6A8A",
  textLight: "#9BACC8",
  bg: "#EBF0FC",
  white: "#FFFFFF",
  border: "#D6E0F7",
  card: "#FFFFFF",
};

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

  // ── Single grouped loading object → 1 setState = 1 re-render ─
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

  // ── Single picker state object → 1 setState = 1 re-render ────
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
    // Single setState call → single re-render (was 5 separate setters)
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

  // Fetch students — reset + fetch in ONE effect (eliminates a double render cycle)
  const fetchAbortRef = useRef(false);

  useEffect(() => {
    // Always reset student state when any filter changes
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
  const selectedCount = useMemo(
    () => [selectedCourse, selectedSemester, selectedSubject, selectedTime].filter(Boolean).length,
    [selectedCourse, selectedSemester, selectedSubject, selectedTime]
  );

  // Memoized toggle-all handler — avoids re-creating on every render
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

  // FlatList renderItem — stable reference so FlatList doesn't re-render all rows
  const renderStudentItem = useCallback(({ item: student, index: idx }: { item: Student; index: number }) => {
    const isChecked = !!checkedStudents[student.studentRegistrationId];
    return (
      <TouchableOpacity
        onPress={() => handleToggleStudent(student.studentRegistrationId, isChecked)}
        style={[s.studentRow, isChecked && s.studentRowChecked, idx > 0 && s.studentRowBorder]}
        activeOpacity={0.7}
      >
        <View style={[s.checkbox, isChecked && s.checkboxChecked]}>
          {isChecked && <Check size={13} color={C.white} strokeWidth={3} />}
        </View>
        <View style={s.studentInfo}>
          <Text style={s.studentName}>{student.nameAsPerMarksheet}</Text>
          <Text style={s.studentEnroll}>Enrollment: {student.enrollmentNo}</Text>
        </View>
        <View style={[s.statusBadge, isChecked ? s.statusPresent : s.statusAbsent]}>
          <Text style={[s.statusText, isChecked ? s.statusPresentText : s.statusAbsentText]}>
            {isChecked ? "Present" : "Absent"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [checkedStudents, handleToggleStudent]);

  const keyExtractor = useCallback((item: Student) => String(item.studentRegistrationId), []);

  return (
    <SafeAreaView style={s.root}>
      {/* ── Gradient Header ── */}
      <LinearGradient colors={[C.primary, C.primaryMid, C.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.avatarCircle}>
            <User size={24} color={C.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerName} numberOfLines={1}>{facultyName}</Text>
            <Text style={s.headerRole}>Faculty Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn} activeOpacity={0.8}>
          <LogOut size={17} color={C.white} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Session Setup Toggle ── */}
        <TouchableOpacity
          style={[s.filterToggle, showFilters && s.filterToggleOpen]}
          activeOpacity={0.85}
          onPress={() => setShowFilters((p) => !p)}
        >
          <View style={s.filterToggleLeft}>
            <View style={[s.filterToggleIconBox, showFilters && s.filterToggleIconBoxOpen]}>
              <SlidersHorizontal size={20} color={showFilters ? C.white : C.primary} />
            </View>
            <View>
              <Text style={[s.filterToggleTitle, showFilters && { color: C.white }]}>Session Setup</Text>
              <Text style={[s.filterToggleSub, showFilters && { color: "rgba(255,255,255,0.75)" }]}>
                {selectedCount === 0 ? "Select course, semester, subject & time" : `${selectedCount} of 4 selected`}
              </Text>
            </View>
          </View>
          <View style={[s.filterChevron, showFilters && s.filterChevronOpen]}>
            {showFilters ? <ChevronUp size={18} color={C.white} /> : <ChevronDown size={18} color={C.primary} />}
          </View>
        </TouchableOpacity>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <View style={s.filterPanel}>
            <View style={s.filterPanelHeader}>
              <Text style={s.filterPanelTitle}>Choose Your Session</Text>
              {selectedCount > 0 && (
                <TouchableOpacity onPress={() => { setSelectedCourse(null); setSelectedSemester(null); setSelectedSubject(null); setSelectedTime(null); }}>
                  <Text style={s.clearAll}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            <FilterRow
              step={1} label="Programme / Course"
              icon={<GraduationCap size={18} color={selectedCourse ? C.white : C.primaryMid} />}
              value={selectedCourse?.name ?? null}
              selected={!!selectedCourse}
              onPress={() => openPicker("Course", courseOptions, selectedCourse, setSelectedCourse)}
            />
            <FilterRow
              step={2} label="Semester"
              icon={<Layers size={18} color={selectedSemester ? C.white : C.primaryMid} />}
              value={selectedSemester?.name ?? null}
              selected={!!selectedSemester}
              isLoading={loading.semesters}
              onPress={() => { if (!selectedCourse) { Alert.alert("Info", "Please select a Course first."); return; } openPicker("Semester", semesterOptions, selectedSemester, setSelectedSemester); }}
            />
            <FilterRow
              step={3} label="Subject"
              icon={<BookOpen size={18} color={selectedSubject ? C.white : C.primaryMid} />}
              value={selectedSubject?.name ?? null}
              selected={!!selectedSubject}
              isLoading={loading.subjects}
              onPress={() => { if (!selectedSemester) { Alert.alert("Info", "Please select a Semester first."); return; } openPicker("Subject", subjectOptions, selectedSubject, setSelectedSubject); }}
            />
            <FilterRow
              step={4} label="Time Slot"
              icon={<Clock size={18} color={selectedTime ? C.white : C.primaryMid} />}
              value={selectedTime?.name ?? null}
              selected={!!selectedTime}
              isLoading={loading.time}
              onPress={() => openPicker("Time Slot", timeOptions, selectedTime, setSelectedTime)}
            />

            {/* Show only when all filters are set AND students API returned success:false */}
            {allFiltersSet && !!studentsMessage && (
              <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={s.submitBtn} activeOpacity={0.85}>
                <LinearGradient colors={[C.primary, C.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitGrad}>
                  {submitting
                    ? <ActivityIndicator size="small" color={C.white} />
                    : <>
                      <Check size={20} color={C.white} strokeWidth={2.5} />
                      <Text style={s.submitText}>Mark IN &amp; Start Session</Text>
                    </>
                  }
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Active Selection Summary ── */}
        {selectedCount > 0 && (
          <View style={s.summaryCard}>
            <LinearGradient colors={[C.primary, C.primaryMid]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.summaryHeader}>
              <Text style={s.summaryHeaderText}>Active Session Details</Text>
            </LinearGradient>
            <View style={s.summaryBody}>
              {selectedCourse && (
                <View style={s.summaryRow}>
                  <View style={s.summaryIconBox}><GraduationCap size={16} color={C.primaryMid} /></View>
                  <View style={s.summaryTextCol}>
                    <Text style={s.summaryLabel}>Programme</Text>
                    <Text style={s.summaryValue}>{selectedCourse.name}</Text>
                  </View>
                </View>
              )}
              {selectedSemester && (
                <View style={s.summaryRow}>
                  <View style={s.summaryIconBox}><Layers size={16} color={C.primaryMid} /></View>
                  <View style={s.summaryTextCol}>
                    <Text style={s.summaryLabel}>Semester</Text>
                    <Text style={s.summaryValue}>{selectedSemester.name}</Text>
                  </View>
                </View>
              )}
              {selectedSubject && (
                <View style={s.summaryRow}>
                  <View style={s.summaryIconBox}><BookOpen size={16} color={C.primaryMid} /></View>
                  <View style={s.summaryTextCol}>
                    <Text style={s.summaryLabel}>Subject</Text>
                    <Text style={s.summaryValue}>{selectedSubject.name}</Text>
                  </View>
                </View>
              )}
              {selectedTime && (
                <View style={[s.summaryRow, { borderBottomWidth: 0 }]}>
                  <View style={s.summaryIconBox}><Clock size={16} color={C.primaryMid} /></View>
                  <View style={s.summaryTextCol}>
                    <Text style={s.summaryLabel}>Time Slot</Text>
                    <Text style={s.summaryValue}>{selectedTime.name}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

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
        ) : students.length > 0 ? (
          <View style={s.rosterCard}>
            {/* Roster header */}
            <LinearGradient colors={[C.primary, C.primaryMid]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.rosterHeader}>
              <View style={s.rosterHeaderLeft}>
                <Users size={20} color={C.white} />
                <Text style={s.rosterTitle}>Student Roster</Text>
              </View>
              <View style={s.rosterStats}>
                <View style={s.statPresent}>
                  <Text style={s.statPresentText}>P  {presentCount}</Text>
                </View>
                <View style={s.statAbsent}>
                  <Text style={s.statAbsentText}>A  {absentCount}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={s.rosterActions}>
              <Text style={s.rosterCount}>{presentCount} of {students.length} marked Present</Text>
              <TouchableOpacity onPress={handleToggleAll} style={s.selectAllBtn} activeOpacity={0.7}>
                <CheckSquare size={16} color={C.primaryMid} />
                <Text style={s.selectAllText}>
                  {filteredStudents.every((s) => checkedStudents[s.studentRegistrationId]) ? "Deselect All" : "Select All"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={s.searchRow}>
              <Search size={17} color={C.textMuted} />
              <TextInput
                style={s.searchInput}
                placeholder="Search by name or enrollment no..."
                placeholderTextColor={C.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            {/* FlatList — virtualized, only renders visible rows */}
            <FlatList
              data={filteredStudents}
              keyExtractor={keyExtractor}
              renderItem={renderStudentItem}
              scrollEnabled={false}
              removeClippedSubviews
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              ListEmptyComponent={
                <View style={s.emptySearch}>
                  <Text style={s.emptySearchText}>No matching students found.</Text>
                </View>
              }
            />
          </View>
        ) : null}
      </ScrollView>

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
      <Modal visible={picker.visible} transparent animationType="slide" onRequestClose={closePicker}>
        <Pressable style={s.modalOverlay} onPress={closePicker} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <LinearGradient colors={[C.primary, C.primaryMid]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sheetTitleBar}>
            <Text style={s.sheetTitle}>Select {picker.label}</Text>
          </LinearGradient>
          <FlatList
            data={picker.options}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={s.sheetList}
            renderItem={({ item }) => {
              const active = picker.selected?.id === item.id;
              return (
                <TouchableOpacity
                  onPress={() => { picker.onSelect?.(item); closePicker(); }}
                  style={[s.sheetItem, active && s.sheetItemActive]}
                  activeOpacity={0.75}
                >
                  <Text style={[s.sheetItemText, active && s.sheetItemTextActive]}>{item.name}</Text>
                  {active && <Check size={18} color={C.white} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── Filter Row ────────────────────────────────────────────── */
const FilterRow = React.memo(function FilterRow({ step, label, value, icon, onPress, isLoading, selected }: {
  step: number; label: string; value: string | null;
  icon: React.ReactNode; onPress: () => void; isLoading?: boolean; selected?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[fr.row, selected && fr.rowSelected]} activeOpacity={0.75}>
      {/* Step number / check */}
      <View style={[fr.stepCircle, selected && fr.stepCircleActive]}>
        {selected
          ? <Check size={14} color={C.white} strokeWidth={3} />
          : <Text style={fr.stepNum}>{step}</Text>
        }
      </View>
      {/* Icon box */}
      <View style={[fr.iconBox, selected && fr.iconBoxActive]}>
        {icon}
      </View>
      {/* Text */}
      <View style={fr.textCol}>
        <Text style={fr.rowLabel}>{label}</Text>
        <Text style={[fr.rowValue, !value && fr.rowPlaceholder]} numberOfLines={1}>
          {value ?? "Tap to choose →"}
        </Text>
      </View>
      {isLoading
        ? <ActivityIndicator size="small" color={C.primaryMid} />
        : <View style={[fr.chevronBox, selected && fr.chevronBoxActive]}>
          <ChevronDown size={16} color={selected ? C.white : C.textMuted} />
        </View>
      }
    </TouchableOpacity>
  );
});

/* ─── Styles ────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", marginRight: 14, borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" },
  headerName: { fontSize: 18, fontWeight: "800", color: C.white, maxWidth: 200 },
  headerRole: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 24, gap: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  logoutText: { color: C.white, fontSize: 14, fontWeight: "700" },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 36 },

  // Filter toggle button
  filterToggle: { backgroundColor: C.white, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12, borderWidth: 1.5, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
  filterToggleOpen: { backgroundColor: C.primaryMid, borderColor: C.primaryMid },
  filterToggleLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 14 },
  filterToggleIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryBg, alignItems: "center", justifyContent: "center" },
  filterToggleIconBoxOpen: { backgroundColor: "rgba(255,255,255,0.2)" },
  filterToggleTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 2 },
  filterToggleSub: { fontSize: 12, color: C.textMuted, fontWeight: "500" },
  filterChevron: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.primaryBg, alignItems: "center", justifyContent: "center" },
  filterChevronOpen: { backgroundColor: "rgba(255,255,255,0.2)" },

  // Filter panel
  filterPanel: { backgroundColor: C.white, borderRadius: 20, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16, marginBottom: 14, borderWidth: 1.5, borderColor: C.border, elevation: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 14 },
  filterPanelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  filterPanelTitle: { fontSize: 15, fontWeight: "800", color: C.text },
  clearAll: { fontSize: 13, fontWeight: "700", color: C.danger },

  // Submit
  submitBtn: { marginTop: 16, borderRadius: 16, overflow: "hidden" },
  submitGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 10 },
  submitText: { color: C.white, fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },

  // Summary card
  summaryCard: { borderRadius: 18, marginBottom: 14, overflow: "hidden", borderWidth: 1.5, borderColor: C.border, elevation: 3, shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
  summaryHeader: { paddingHorizontal: 18, paddingVertical: 12 },
  summaryHeaderText: { fontSize: 14, fontWeight: "800", color: C.white, letterSpacing: 0.3 },
  summaryBody: { backgroundColor: C.white, paddingHorizontal: 4 },
  summaryRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.primaryBg, alignItems: "center", justifyContent: "center", marginRight: 14 },
  summaryTextCol: { flex: 1 },
  summaryLabel: { fontSize: 11, fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  summaryValue: { fontSize: 15, fontWeight: "700", color: C.text },

  // Loading / warn
  loadingCard: { backgroundColor: C.white, borderRadius: 20, padding: 36, alignItems: "center", marginBottom: 14, borderWidth: 1, borderColor: C.border },
  loadingText: { color: C.textMuted, fontSize: 14, marginTop: 12 },
  warnCard: { backgroundColor: C.warnBg, borderRadius: 18, padding: 24, alignItems: "center", borderWidth: 1.5, borderColor: C.warnBorder, marginBottom: 14, gap: 8 },
  warnTitle: { fontSize: 16, fontWeight: "800", color: C.warn },
  warnText: { color: "#92400E", fontSize: 14, fontWeight: "500", textAlign: "center", lineHeight: 22 },

  // Roster
  rosterCard: { backgroundColor: C.white, borderRadius: 20, overflow: "hidden", marginBottom: 14, borderWidth: 1.5, borderColor: C.border, elevation: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 14 },
  rosterHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 16 },
  rosterHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  rosterTitle: { fontSize: 16, fontWeight: "800", color: C.white },
  rosterStats: { flexDirection: "row", gap: 8 },
  statPresent: { backgroundColor: "rgba(5,150,105,0.25)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statPresent2: {},
  statPresentText: { fontSize: 13, fontWeight: "800", color: "#A7F3D0" },
  statAbsent: { backgroundColor: "rgba(220,38,38,0.25)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statAbsentText: { fontSize: 13, fontWeight: "800", color: "#FCA5A5" },

  rosterActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  rosterCount: { fontSize: 13, color: C.textMuted, fontWeight: "600" },
  selectAllBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.primaryBg, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  selectAllText: { fontSize: 13, fontWeight: "700", color: C.primaryMid },

  searchRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 14, marginVertical: 12, backgroundColor: C.bg, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, height: 46, fontSize: 15, color: C.text },

  studentRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  studentRowChecked: { backgroundColor: "#F0F5FF" },
  studentRowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: C.primaryBorder, backgroundColor: C.white, alignItems: "center", justifyContent: "center", marginRight: 14 },
  checkboxChecked: { backgroundColor: C.primaryMid, borderColor: C.primaryMid },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "800", color: C.text, textTransform: "uppercase", letterSpacing: 0.3 },
  studentEnroll: { fontSize: 12, color: C.textMuted, marginTop: 3, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusPresent: { backgroundColor: C.successBg },
  statusAbsent: { backgroundColor: C.dangerBg },
  statusText: { fontSize: 12, fontWeight: "800" },
  statusPresentText: { color: C.success },
  statusAbsentText: { color: C.danger },
  emptySearch: { paddingVertical: 32, alignItems: "center" },
  emptySearchText: { color: C.textMuted, fontSize: 14 },

  // Sticky save
  stickyBottom: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn: { borderRadius: 18, overflow: "hidden" },
  saveGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 17, gap: 10 },
  saveText: { color: C.white, fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { backgroundColor: C.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 36 },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: C.border, alignSelf: "center", marginTop: 14, marginBottom: 0 },
  sheetTitleBar: { paddingHorizontal: 22, paddingVertical: 16, marginTop: 8 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: C.white },
  sheetList: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  sheetItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15, paddingHorizontal: 18, borderRadius: 16, marginBottom: 8, backgroundColor: C.bg },
  sheetItemActive: { backgroundColor: C.primaryMid },
  sheetItemText: { fontSize: 16, fontWeight: "600", color: C.text, flex: 1 },
  sheetItemTextActive: { color: C.white, fontWeight: "700" },
});

/* ─── FilterRow styles ──────────────────────────────────────── */
const fr = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: C.bg, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10, borderWidth: 1.5, borderColor: C.border },
  rowSelected: { borderColor: C.primaryMid, backgroundColor: "#EBF2FF" },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.border, alignItems: "center", justifyContent: "center", marginRight: 12 },
  stepCircleActive: { backgroundColor: C.success },
  stepNum: { fontSize: 13, fontWeight: "800", color: C.textMuted },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.primaryBg, alignItems: "center", justifyContent: "center", marginRight: 12 },
  iconBoxActive: { backgroundColor: C.primaryMid },
  textCol: { flex: 1 },
  rowLabel: { fontSize: 11, fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  rowValue: { fontSize: 15, fontWeight: "700", color: C.text },
  rowPlaceholder: { color: C.textLight, fontWeight: "500", fontSize: 14 },
  chevronBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.border, alignItems: "center", justifyContent: "center" },
  chevronBoxActive: { backgroundColor: C.primaryMid },
});
