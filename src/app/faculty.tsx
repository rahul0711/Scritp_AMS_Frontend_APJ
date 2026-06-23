import { fetchSemesters, fetchStudents, fetchSubjects, fetchTime, Student, TimeSlotOption, facultyInAttendance, saveAttendance, GetStudentsResponse } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Check,
  ChevronDown,
  Filter,
  GraduationCap,
  Layers,
  LogIn,
  LogOut,
  User,
  Clock,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OptionType = { id: number; name: string };

export default function FacultyDashboard() {
  const router = useRouter();
  const allRecords = useAuthStore((s) => s.allRecords);
  const logout = useAuthStore((s) => s.logout);

  const facultyName = allRecords[0]?.facultyName ?? "Faculty";
  const userId = allRecords[0]?.userId;

  // Unique course options from user records
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

  // Selected filter states (as OptionType objects)
  const [selectedCourse, setSelectedCourse] = useState<OptionType | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<OptionType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<OptionType | null>(null);
  const [selectedTime, setSelectedTime] = useState<OptionType | null>(null);

  // Options loaded dynamically from API
  const [semesterOptions, setSemesterOptions] = useState<OptionType[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<OptionType[]>([]);
  const [timeOptions, setTimeOptions] = useState<OptionType[]>([]);

  // Student list states
  const [students, setStudents] = useState<Student[]>([]);
  const [checkedStudents, setCheckedStudents] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Loading and submission states
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTime, setLoadingTime] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  // Bottom sheet modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerLabel, setPickerLabel] = useState("");
  const [pickerOptions, setPickerOptions] = useState<OptionType[]>([]);
  const [pickerSelected, setPickerSelected] = useState<OptionType | null>(null);
  const [pickerOnSelect, setPickerOnSelect] = useState<
    ((val: OptionType) => void) | null
  >(null);

  const openPicker = (
    label: string,
    options: OptionType[],
    current: OptionType | null,
    onSelect: (val: OptionType) => void
  ) => {
    setPickerLabel(label);
    setPickerOptions(options);
    setPickerSelected(current);
    setPickerOnSelect(() => onSelect);
    setPickerVisible(true);
  };

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) =>
        (s.nameAsPerMarksheet && s.nameAsPerMarksheet.toLowerCase().includes(query)) ||
        (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(query))
    );
  }, [students, searchQuery]);

  // Fetch Time Slots on mount
  useEffect(() => {
    setLoadingTime(true);
    fetchTime()
      .then((data) => {
        const mapped = data.map((t) => ({ id: t.timeSlotId, name: t.timeSlotName }));
        setTimeOptions(mapped);
      })
      .catch((err) => {
        console.error("Error fetching time slots:", err);
      })
      .finally(() => {
        setLoadingTime(false);
      });
  }, []);

  // Fetch Semesters when course changes
  useEffect(() => {
    if (!selectedCourse) {
      setSemesterOptions([]);
      setSelectedSemester(null);
      return;
    }

    if (!userId) return;

    setLoadingSemesters(true);
    setSemesterOptions([]);
    setSelectedSemester(null);
    setSelectedSubject(null);

    fetchSemesters(userId, selectedCourse.id)
      .then((data) => {
        const mapped = data.map((s) => ({ id: s.semesterId, name: s.semesterName }));
        setSemesterOptions(mapped);
        
        // Auto-select if there is exactly 1 semester
        if (mapped.length === 1) {
          setSelectedSemester(mapped[0]);
        }
      })
      .catch((err) => {
        console.error("Error fetching semesters:", err);
        Alert.alert("Error", "Failed to fetch semesters.");
      })
      .finally(() => {
        setLoadingSemesters(false);
      });
  }, [selectedCourse, userId]);

  // Fetch Subjects when semester changes
  useEffect(() => {
    if (!selectedSemester || !selectedCourse) {
      setSubjectOptions([]);
      setSelectedSubject(null);
      return;
    }

    if (!userId) return;

    setLoadingSubjects(true);
    setSubjectOptions([]);
    setSelectedSubject(null);

    fetchSubjects(userId, selectedCourse.id, selectedSemester.id)
      .then((data) => {
        const mapped = data.map((s) => ({ id: s.subjectId, name: s.subjectName }));
        setSubjectOptions(mapped);
        
        // Auto-select if there is exactly 1 subject
        if (mapped.length === 1) {
          setSelectedSubject(mapped[0]);
        }
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
        Alert.alert("Error", "Failed to fetch subjects.");
      })
      .finally(() => {
        setLoadingSubjects(false);
      });
  }, [selectedSemester, selectedCourse, userId]);

  // Reset submission state and student list when any filter changes
  useEffect(() => {
    setStudents([]);
    setCheckedStudents({});
    setIsSubmitted(false);
    setSearchQuery("");
  }, [selectedCourse, selectedSemester, selectedSubject, selectedTime]);

  const handleSubmit = async () => {
    if (!selectedCourse || !selectedSemester || !selectedSubject || !selectedTime) {
      Alert.alert("Error", "Please select all 4 filters first.");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "User details not found. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Post FacultyInAttendance
      const result = await facultyInAttendance({
        userId,
        courseId: selectedCourse.id,
        semesterId: selectedSemester.id,
        subjectId: selectedSubject.id,
        timeSlotId: selectedTime.id,
        remarks: "Lecture Started",
      });

      Alert.alert("Success", result.message || "Attendance started successfully!");
      setIsSubmitted(true);

      // 2. Fetch student list
      setLoadingStudents(true);
      const getStudentsRes = await fetchStudents(
        userId,
        selectedCourse.id,
        selectedSemester.id,
        selectedSubject.id,
        selectedTime.id
      );

      if (getStudentsRes.success && Array.isArray(getStudentsRes.students)) {
        setStudents(getStudentsRes.students);
        // Default all checkboxes to checked
        const initialChecked: Record<number, boolean> = {};
        getStudentsRes.students.forEach((s) => {
          initialChecked[s.studentRegistrationId] = true;
        });
        setCheckedStudents(initialChecked);
      } else {
        Alert.alert("Info", getStudentsRes.message || "Please mark Faculty IN attendance first.");
        setStudents([]);
        setIsSubmitted(false);
      }

    } catch (err: any) {
      console.error("Error submitting attendance:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || err?.message || "Failed to submit attendance."
      );
    } finally {
      setSubmitting(false);
      setLoadingStudents(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse || !selectedSemester || !selectedSubject || !selectedTime) {
      Alert.alert("Error", "Missing required filters.");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "User details not found. Please log in again.");
      return;
    }

    setSavingAttendance(true);
    try {
      const attendanceDate = new Date().toISOString().split("T")[0];
      const payload = {
        userId,
        courseId: selectedCourse.id,
        semesterId: selectedSemester.id,
        subjectId: selectedSubject.id,
        attendanceDate,
        students: students.map((s) => ({
          StudentRegistrationId: s.studentRegistrationId,
          status: checkedStudents[s.studentRegistrationId] ? ("P" as const) : ("A" as const),
        })),
      };

      const res = await saveAttendance(payload);
      if (res.success) {
        Alert.alert("Success", res.message || "Attendance Saved Successfully");
      } else {
        Alert.alert("Error", res.message || "Failed to save attendance.");
      }
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || err?.message || "Failed to save attendance."
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login" as any);
        },
      },
    ]);
  };

  const filtersSelected = !!(selectedCourse || selectedSemester || selectedSubject || selectedTime);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* ── Header ── */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-neutral-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-[#0042BF] items-center justify-center mr-3">
            <User size={20} color="#fff" />
          </View>
          <View>
            <Text className="text-lg font-bold text-neutral-900">
              {facultyName}
            </Text>
            <Text className="text-xs text-neutral-400">Faculty Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center bg-red-50 px-3 py-2 rounded-full"
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#ef4444" />
          <Text className="text-red-500 text-sm font-semibold ml-1.5">Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Action Row: Filter Toggle ── */}
        <View className="flex-row">
          <TouchableOpacity
            className={`flex-1 rounded-2xl py-4 items-center justify-center flex-row border ${showFilters
              ? "bg-[#0042BF] border-[#0042BF]"
              : "bg-white border-neutral-200"
              }`}
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
            }}
            activeOpacity={0.8}
            onPress={() => setShowFilters((prev) => !prev)}
          >
            <Filter size={20} color={showFilters ? "#fff" : "#0042BF"} />
            <Text
              className={`text-base font-bold ml-2 ${showFilters ? "text-white" : "text-[#0042BF]"
                }`}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Collapsible Filter Panel ── */}
        {showFilters && (
          <View
            className="mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
            }}
          >
            {/* Filter header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
              <Text className="text-sm font-bold text-neutral-900">
                Select Filters
              </Text>
              {filtersSelected && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCourse(null);
                    setSelectedSemester(null);
                    setSelectedSubject(null);
                    setSelectedTime(null);
                  }}
                >
                  <Text className="text-xs font-semibold text-red-500">
                    Clear all
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Filter pills */}
            <View className="px-4 pb-4 pt-1">
              <FilterPill
                label="Course"
                value={selectedCourse ? selectedCourse.name : null}
                icon={<GraduationCap size={16} color="#0042BF" />}
                onPress={() =>
                  openPicker("Course", courseOptions, selectedCourse, (v) =>
                    setSelectedCourse(v)
                  )
                }
              />
              <FilterPill
                label="Semester"
                value={selectedSemester ? selectedSemester.name : null}
                icon={<Layers size={16} color="#0042BF" />}
                isLoading={loadingSemesters}
                onPress={() => {
                  if (!selectedCourse) {
                    Alert.alert("Info", "Please select a Course first.");
                    return;
                  }
                  openPicker("Semester", semesterOptions, selectedSemester, (v) =>
                    setSelectedSemester(v)
                  )
                }}
              />
              <FilterPill
                label="Subject"
                value={selectedSubject ? selectedSubject.name : null}
                icon={<BookOpen size={16} color="#0042BF" />}
                isLoading={loadingSubjects}
                onPress={() => {
                  if (!selectedSemester) {
                    Alert.alert("Info", "Please select a Semester first.");
                    return;
                  }
                  openPicker("Subject", subjectOptions, selectedSubject, (v) =>
                    setSelectedSubject(v)
                  )
                }}
              />
              <FilterPill
                label="Time Slot"
                value={selectedTime ? selectedTime.name : null}
                icon={<Clock size={16} color="#0042BF" />}
                isLoading={loadingTime}
                onPress={() =>
                  openPicker("Time Slot", timeOptions, selectedTime, (v) =>
                    setSelectedTime(v)
                  )
                }
              />

              {/* Submit Button */}
              {selectedCourse && selectedSemester && selectedSubject && selectedTime && (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={submitting}
                  className="mt-4 bg-[#0042BF] rounded-xl py-3.5 items-center justify-center flex-row"
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Check size={18} color="#fff" strokeWidth={2.5} stroke="#fff" />
                      <Text className="text-white text-base font-bold ml-2">Submit & Get In</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── Active Selection Summary ── */}
        {filtersSelected && (
          <View className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <Text className="text-sm font-bold text-[#0042BF] mb-2">
              Active Selection
            </Text>
            {selectedCourse && (
              <InfoRow label="Course" value={selectedCourse.name} />
            )}
            {selectedSemester && (
              <InfoRow label="Semester" value={selectedSemester.name} />
            )}
            {selectedSubject && (
              <InfoRow label="Subject" value={selectedSubject.name} />
            )}
            {selectedTime && (
              <InfoRow label="Time Slot" value={selectedTime.name} />
            )}
          </View>
        )}

        {/* ── Student List Card ── */}
        {loadingStudents ? (
          <View className="mt-5 bg-white rounded-2xl p-6 border border-neutral-100 items-center justify-center">
            <ActivityIndicator size="large" color="#0042BF" />
            <Text className="text-neutral-400 text-sm mt-3">Loading student roster...</Text>
          </View>
        ) : isSubmitted && students.length > 0 ? (
          <View
            className="mt-5 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
            }}
          >
            {/* Roster Header */}
            <View className="flex-row justify-between items-center px-4 py-4 bg-neutral-50 border-b border-neutral-100">
              <View className="flex-1">
                <Text className="text-base font-bold text-neutral-900">
                  Student List
                </Text>
                <Text className="text-xs text-neutral-400 mt-0.5">
                  {Object.values(checkedStudents).filter(Boolean).length} of {students.length} Selected
                </Text>
              </View>

              {/* Select All / Unselect All Toggle */}
              <TouchableOpacity
                onPress={() => {
                  const allChecked = filteredStudents.every((s) => checkedStudents[s.studentRegistrationId]);
                  const nextChecked = { ...checkedStudents };
                  filteredStudents.forEach((s) => {
                    nextChecked[s.studentRegistrationId] = !allChecked;
                  });
                  setCheckedStudents(nextChecked);
                }}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-semibold text-[#0042BF]">
                  {filteredStudents.every((s) => checkedStudents[s.studentRegistrationId])
                    ? "Deselect All"
                    : "Select All"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar Input */}
            <View className="px-4 py-2 bg-neutral-50 border-b border-neutral-100">
              <TextInput
                className="h-10 border border-neutral-200 rounded-xl px-3.5 text-[14px] text-neutral-800 bg-white"
                placeholder="Search student name or enrollment..."
                placeholderTextColor="#b0b0b0"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Students List */}
            <View className="divide-y divide-neutral-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isChecked = !!checkedStudents[student.studentRegistrationId];
                  return (
                    <TouchableOpacity
                      key={student.studentRegistrationId}
                      onPress={() => {
                        setCheckedStudents((prev) => ({
                          ...prev,
                          [student.studentRegistrationId]: !isChecked,
                        }));
                      }}
                      className="flex-row items-center px-4 py-3.5"
                      activeOpacity={0.7}
                    >
                      {/* Checkbox */}
                      <View className="mr-3.5">
                        {isChecked ? (
                          <View className="w-5 h-5 rounded bg-[#0042BF] items-center justify-center">
                            <Check size={12} color="#fff" strokeWidth={3} />
                          </View>
                        ) : (
                          <View className="w-5 h-5 rounded border border-neutral-300 bg-white" />
                        )}
                      </View>

                      {/* Student Info */}
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-neutral-800 uppercase">
                          {student.nameAsPerMarksheet}
                        </Text>
                        <Text className="text-xs text-neutral-400 mt-0.5">
                          Enrollment: {student.enrollmentNo}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="py-8 items-center justify-center">
                  <Text className="text-neutral-400 text-sm">No matching students found.</Text>
                </View>
              )}
            </View>
          </View>
        ) : isSubmitted ? (
          <View className="mt-5 bg-white rounded-2xl p-6 border border-neutral-100 items-center justify-center">
            <Text className="text-neutral-400 text-sm">No students found for this selection.</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky Bottom Save Button */}
      {isSubmitted && students.length > 0 && (
        <View className="px-5 py-4 bg-white border-t border-neutral-200 shadow-lg">
          <TouchableOpacity
            onPress={handleSaveAttendance}
            disabled={savingAttendance}
            className="bg-emerald-500 rounded-xl py-3.5 items-center justify-center flex-row"
            activeOpacity={0.8}
          >
            {savingAttendance ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check size={18} color="#fff" strokeWidth={2.5} stroke="#fff" />
                <Text className="text-white text-base font-bold ml-2">Attendance Done</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bottom Sheet Picker Modal ── */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setPickerVisible(false)}
        />
        <View className="bg-white rounded-t-3xl pb-8">
          {/* Handle bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-neutral-300" />
          </View>

          {/* Title */}
          <Text className="text-lg font-bold text-neutral-900 px-5 mb-3">
            Select {pickerLabel}
          </Text>

          {/* Options */}
          <FlatList
            data={pickerOptions}
            keyExtractor={(item) => String(item.id)}
            contentContainerClassName="px-5 pb-4"
            renderItem={({ item }) => {
              const isActive = pickerSelected?.id === item.id;
              return (
                <TouchableOpacity
                  onPress={() => {
                    pickerOnSelect?.(item);
                    setPickerVisible(false);
                  }}
                  className={`flex-row items-center justify-between py-3.5 px-4 rounded-xl mb-1.5 ${isActive ? "bg-[#0042BF]" : "bg-neutral-50"
                    }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-[15px] font-semibold ${isActive ? "text-white" : "text-neutral-800"
                      }`}
                  >
                    {item.name}
                  </Text>
                  {isActive && <Check size={18} color="#fff" />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── Filter Pill ─────────────────────────────────────────── */

function FilterPill({
  label,
  value,
  icon,
  onPress,
  isLoading,
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  onPress: () => void;
  isLoading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 mb-2.5 border border-neutral-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        {icon}
        <Text className="text-xs text-neutral-400 ml-2.5">{label}</Text>
        <Text
          className={`text-sm font-semibold ml-2 ${value ? "text-neutral-900" : "text-neutral-300"
            }`}
          numberOfLines={1}
        >
          {value ?? "Tap to select"}
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color="#0042BF" className="scale-75" />
      ) : (
        <ChevronDown size={16} color="#bbb" />
      )}
    </TouchableOpacity>
  );
}

/* ─── Info Row ────────────────────────────────────────────── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center mb-1.5">
      <View className="w-1.5 h-1.5 rounded-full bg-[#0042BF] mr-2.5" />
      <Text className="text-sm text-neutral-500">
        {label}:{" "}
        <Text className="font-semibold text-neutral-800">{value}</Text>
      </Text>
    </View>
  );
}
