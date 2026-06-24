import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Layers,
  Clock,
  SlidersHorizontal,
} from "lucide-react-native";
import { C } from "./Theme";
import { FilterRow } from "./FilterRow";
import { OptionType } from "./types";

interface SessionSetupProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedCourse: OptionType | null;
  selectedSemester: OptionType | null;
  selectedSubject: OptionType | null;
  selectedTime: OptionType | null;
  loadingSemesters: boolean;
  loadingSubjects: boolean;
  loadingTime: boolean;
  onPressCourse: () => void;
  onPressSemester: () => void;
  onPressSubject: () => void;
  onPressTime: () => void;
  onResetFilters: () => void;
  allFiltersSet: boolean;
  studentsMessage: string | null;
  submitting: boolean;
  onSubmit: () => void;
}

export const SessionSetup = React.memo(({
  showFilters,
  onToggleFilters,
  selectedCourse,
  selectedSemester,
  selectedSubject,
  selectedTime,
  loadingSemesters,
  loadingSubjects,
  loadingTime,
  onPressCourse,
  onPressSemester,
  onPressSubject,
  onPressTime,
  onResetFilters,
  allFiltersSet,
  studentsMessage,
  submitting,
  onSubmit,
}: SessionSetupProps) => {
  const selectedCount = useMemo(() => {
    return [selectedCourse, selectedSemester, selectedSubject, selectedTime].filter(Boolean).length;
  }, [selectedCourse, selectedSemester, selectedSubject, selectedTime]);

  return (
    <>
      {/* ── Session Setup Toggle ── */}
      <TouchableOpacity
        style={[styles.filterToggle, showFilters && styles.filterToggleOpen]}
        activeOpacity={0.85}
        onPress={onToggleFilters}
      >
        <View style={styles.filterToggleLeft}>
          <View style={[styles.filterToggleIconBox, showFilters && styles.filterToggleIconBoxOpen]}>
            <SlidersHorizontal size={20} color={showFilters ? C.white : C.primary} />
          </View>
          <View>
            <Text style={[styles.filterToggleTitle, showFilters && { color: C.white }]}>
              Session Setup
            </Text>
            <Text style={[styles.filterToggleSub, showFilters && { color: "rgba(255,255,255,0.75)" }]}>
              {selectedCount === 0
                ? "Select course, semester, subject & time"
                : `${selectedCount} of 4 selected`}
            </Text>
          </View>
        </View>
        <View style={[styles.filterChevron, showFilters && styles.filterChevronOpen]}>
          {showFilters ? (
            <ChevronUp size={18} color={C.white} />
          ) : (
            <ChevronDown size={18} color={C.primary} />
          )}
        </View>
      </TouchableOpacity>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterPanelHeader}>
            <Text style={styles.filterPanelTitle}>Choose Your Session</Text>
            {selectedCount > 0 && (
              <TouchableOpacity onPress={onResetFilters}>
                <Text style={styles.clearAll}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          <FilterRow
            step={1}
            label="Programme / Course"
            icon={<GraduationCap size={18} color={selectedCourse ? C.white : C.primaryMid} />}
            value={selectedCourse?.name ?? null}
            selected={!!selectedCourse}
            onPress={onPressCourse}
          />
          <FilterRow
            step={2}
            label="Semester"
            icon={<Layers size={18} color={selectedSemester ? C.white : C.primaryMid} />}
            value={selectedSemester?.name ?? null}
            selected={!!selectedSemester}
            isLoading={loadingSemesters}
            onPress={onPressSemester}
          />
          <FilterRow
            step={3}
            label="Subject"
            icon={<BookOpen size={18} color={selectedSubject ? C.white : C.primaryMid} />}
            value={selectedSubject?.name ?? null}
            selected={!!selectedSubject}
            isLoading={loadingSubjects}
            onPress={onPressSubject}
          />
          <FilterRow
            step={4}
            label="Time Slot"
            icon={<Clock size={18} color={selectedTime ? C.white : C.primaryMid} />}
            value={selectedTime?.name ?? null}
            selected={!!selectedTime}
            isLoading={loadingTime}
            onPress={onPressTime}
          />

          {/* Show only when all filters are set AND students API returned success:false */}
          {allFiltersSet && !!studentsMessage && (
            <TouchableOpacity
              onPress={onSubmit}
              disabled={submitting}
              style={styles.submitBtn}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[C.primary, C.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGrad}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <>
                    <Check size={20} color={C.white} strokeWidth={2.5} />
                    <Text style={styles.submitText}>Mark IN &amp; Start Session</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  filterToggle: {
    backgroundColor: C.white,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  filterToggleOpen: {
    backgroundColor: C.primaryMid,
    borderColor: C.primaryMid,
  },
  filterToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  filterToggleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  filterToggleIconBoxOpen: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  filterToggleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
    marginBottom: 2,
  },
  filterToggleSub: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "500",
  },
  filterChevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChevronOpen: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  filterPanel: {
    backgroundColor: C.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  filterPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterPanelTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.text,
  },
  clearAll: {
    fontSize: 13,
    fontWeight: "700",
    color: C.danger,
  },
  submitBtn: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  submitGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  submitText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
