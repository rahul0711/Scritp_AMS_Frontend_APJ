import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
  Layers,
  PlayCircle,
} from "lucide-react-native";
import { C } from "./Theme";
import { FilterRow } from "./FilterRow";
import { OptionType } from "./types";

interface SessionSetupProps {
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
  const [collapsed, setCollapsed] = useState(false);

  const selectedCount = useMemo(
    () => [selectedCourse, selectedSemester, selectedSubject, selectedTime].filter(Boolean).length,
    [selectedCourse, selectedSemester, selectedSubject, selectedTime]
  );

  return (
    <View style={styles.card}>
      {/* ── Card Header ── */}
      <LinearGradient
        colors={[C.primary, C.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardHeader}
      >
        <View style={styles.headerLeft}>
          <PlayCircle size={20} color={C.white} />
          <View>
            <Text style={styles.cardTitle}>Configure Class</Text>
            <Text style={styles.cardSubtitle}>
              {collapsed
                ? `${selectedCount} of 4 selected`
                : selectedCount === 4
                ? "All filters selected — ready to start"
                : `Step ${selectedCount + 1} of 4 — Select ${
                    selectedCount === 0
                      ? "Programme"
                      : selectedCount === 1
                      ? "Semester"
                      : selectedCount === 2
                      ? "Subject"
                      : "Time Slot"
                  }`}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Progress dots — hidden when collapsed */}
          {!collapsed && (
            <View style={styles.dotsRow}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < selectedCount && styles.dotFilled,
                    i === selectedCount && selectedCount < 4 && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Collapse / Expand toggle */}
          <TouchableOpacity
            onPress={() => setCollapsed((c) => !c)}
            style={styles.collapseBtn}
            activeOpacity={0.8}
          >
            {collapsed
              ? <ChevronDown size={16} color={C.white} />
              : <ChevronUp size={16} color={C.white} />
            }
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Filter Rows (hidden when collapsed) ── */}
      {!collapsed && <View style={styles.filtersBody}>
        <FilterRow
          label="Programme / Course"
          icon={<GraduationCap size={18} color={selectedCourse ? C.white : C.primaryMid} />}
          value={selectedCourse?.name ?? null}
          selected={!!selectedCourse}
          onPress={onPressCourse}
        />
        <FilterRow
          label="Semester"
          icon={<Layers size={18} color={selectedSemester ? C.white : C.primaryMid} />}
          value={selectedSemester?.name ?? null}
          selected={!!selectedSemester}
          isLoading={loadingSemesters}
          onPress={onPressSemester}
        />
        <FilterRow
          label="Subject"
          icon={<BookOpen size={18} color={selectedSubject ? C.white : C.primaryMid} />}
          value={selectedSubject?.name ?? null}
          selected={!!selectedSubject}
          isLoading={loadingSubjects}
          onPress={onPressSubject}
        />
        <FilterRow
          label="Time Slot"
          icon={<Clock size={18} color={selectedTime ? C.white : C.primaryMid} />}
          value={selectedTime?.name ?? null}
          selected={!!selectedTime}
          isLoading={loadingTime}
          onPress={onPressTime}
        />

        {/* Reset link */}
        {selectedCount > 0 && (
          <TouchableOpacity onPress={onResetFilters} style={styles.resetRow} activeOpacity={0.7}>
            <Text style={styles.resetText}>✕  Reset all filters</Text>
          </TouchableOpacity>
        )}

        {/* Start Session button — visible only when all set + studentsMessage (attendance not yet started) */}
        {allFiltersSet && !!studentsMessage && (
          <TouchableOpacity
            onPress={onSubmit}
            disabled={submitting}
            style={styles.submitBtn}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[C.success, C.successDark]}
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
      </View>}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 4,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    backgroundColor: C.white,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.white,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.72)",
    marginTop: 2,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  collapseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotFilled: {
    backgroundColor: C.successBg,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: C.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  filtersBody: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },
  resetRow: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 6,
  },
  resetText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.danger,
  },
  submitBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
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
