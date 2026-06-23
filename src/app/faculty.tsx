import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut,
  LogIn,
  BookOpen,
  GraduationCap,
  Layers,
  ChevronDown,
  Check,
  Filter,
  User,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function FacultyDashboard() {
  const router = useRouter();
  const allRecords = useAuthStore((s) => s.allRecords);
  const logout = useAuthStore((s) => s.logout);

  const facultyName = allRecords[0]?.facultyName ?? "Faculty";

  // Unique filter options
  const courseOptions = useMemo(
    () => [...new Set(allRecords.map((r) => r.courseName).filter(Boolean))],
    [allRecords]
  );
  const semesterOptions = useMemo(
    () => [...new Set(allRecords.map((r) => r.semesterName).filter(Boolean))],
    [allRecords]
  );
  const subjectOptions = useMemo(
    () => [...new Set(allRecords.map((r) => r.subjectName).filter(Boolean))],
    [allRecords]
  );

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Bottom sheet modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerLabel, setPickerLabel] = useState("");
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [pickerSelected, setPickerSelected] = useState<string | null>(null);
  const [pickerOnSelect, setPickerOnSelect] = useState<
    ((val: string) => void) | null
  >(null);

  const openPicker = (
    label: string,
    options: string[],
    current: string | null,
    onSelect: (val: string) => void
  ) => {
    setPickerLabel(label);
    setPickerOptions(options);
    setPickerSelected(current);
    setPickerOnSelect(() => onSelect);
    setPickerVisible(true);
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

  const filtersSelected = selectedCourse || selectedSemester || selectedSubject;

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
        {/* ── Action Row: IN / Filter / OUT ── */}
        <View className="flex-row gap-3">
          {/* IN Button */}
          <TouchableOpacity
            className="flex-1 bg-emerald-500 rounded-2xl py-4 items-center justify-center flex-row"
            style={{
              elevation: 3,
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
            }}
            activeOpacity={0.8}
            onPress={() => {
              // TODO: handle IN action
            }}
          >
            <LogIn size={20} color="#fff" />
            <Text className="text-white text-base font-bold ml-2">IN</Text>
          </TouchableOpacity>

          {/* Filter Button */}
          <TouchableOpacity
            className={`flex-1 rounded-2xl py-4 items-center justify-center flex-row border ${
              showFilters
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
              className={`text-base font-bold ml-2 ${
                showFilters ? "text-white" : "text-[#0042BF]"
              }`}
            >
              Filter
            </Text>
          </TouchableOpacity>

          {/* OUT Button */}
          <TouchableOpacity
            className="flex-1 bg-red-500 rounded-2xl py-4 items-center justify-center flex-row"
            style={{
              elevation: 3,
              shadowColor: "#ef4444",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
            }}
            activeOpacity={0.8}
            onPress={() => {
              // TODO: handle OUT action
            }}
          >
            <LogOut size={20} color="#fff" />
            <Text className="text-white text-base font-bold ml-2">OUT</Text>
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
                value={selectedCourse}
                icon={<GraduationCap size={16} color="#0042BF" />}
                onPress={() =>
                  openPicker("Course", courseOptions, selectedCourse, (v) =>
                    setSelectedCourse(v)
                  )
                }
              />
              <FilterPill
                label="Semester"
                value={selectedSemester}
                icon={<Layers size={16} color="#0042BF" />}
                onPress={() =>
                  openPicker("Semester", semesterOptions, selectedSemester, (v) =>
                    setSelectedSemester(v)
                  )
                }
              />
              <FilterPill
                label="Subject"
                value={selectedSubject}
                icon={<BookOpen size={16} color="#0042BF" />}
                onPress={() =>
                  openPicker("Subject", subjectOptions, selectedSubject, (v) =>
                    setSelectedSubject(v)
                  )
                }
              />
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
              <InfoRow label="Course" value={selectedCourse} />
            )}
            {selectedSemester && (
              <InfoRow label="Semester" value={selectedSemester} />
            )}
            {selectedSubject && (
              <InfoRow label="Subject" value={selectedSubject} />
            )}
          </View>
        )}
      </ScrollView>

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
            keyExtractor={(item, i) => `${item}-${i}`}
            contentContainerClassName="px-5 pb-4"
            renderItem={({ item }) => {
              const isActive = pickerSelected === item;
              return (
                <TouchableOpacity
                  onPress={() => {
                    pickerOnSelect?.(item);
                    setPickerVisible(false);
                  }}
                  className={`flex-row items-center justify-between py-3.5 px-4 rounded-xl mb-1.5 ${
                    isActive ? "bg-[#0042BF]" : "bg-neutral-50"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-[15px] font-semibold ${
                      isActive ? "text-white" : "text-neutral-800"
                    }`}
                  >
                    {item}
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
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  onPress: () => void;
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
          className={`text-sm font-semibold ml-2 ${
            value ? "text-neutral-900" : "text-neutral-300"
          }`}
          numberOfLines={1}
        >
          {value ?? "Tap to select"}
        </Text>
      </View>
      <ChevronDown size={16} color="#bbb" />
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
