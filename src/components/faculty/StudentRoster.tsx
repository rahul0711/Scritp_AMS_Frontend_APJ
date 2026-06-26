import React, { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckSquare, Search, Square, Users } from "lucide-react-native";
import { C } from "./Theme";
import { Student } from "@/services/auth";
import { StudentItem, STUDENT_ITEM_HEIGHT } from "./StudentItem";

const ROW_MARGIN = 6; // matches StudentItem marginBottom
const ITEM_TOTAL = STUDENT_ITEM_HEIGHT + ROW_MARGIN;

interface StudentRosterProps {
  students: Student[];
  filteredStudents: Student[];
  checkedStudents: Record<number, boolean>;
  presentCount: number;
  absentCount: number;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onToggleAll: () => void;
  onToggleStudent: (id: number, current: boolean) => void;
  allChecked: boolean;
  ListHeaderComponent?: React.ReactNode;
  ListHeaderComponent2?: React.ReactNode;
}

export const StudentRoster = React.memo(({
  students,
  filteredStudents,
  checkedStudents,
  presentCount,
  absentCount,
  searchQuery,
  onSearchQueryChange,
  onToggleAll,
  onToggleStudent,
  allChecked,
  ListHeaderComponent,
  ListHeaderComponent2,
}: StudentRosterProps) => {
  const keyExtractor = useCallback(
    (item: Student) => String(item.studentRegistrationId),
    []
  );

  // ── O(1) layout measurement — unlocks recycling optimizations ──
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_TOTAL,
      offset: ITEM_TOTAL * index,
      index,
    }),
    []
  );

  const renderStudentItem = useCallback(
    ({ item, index }: { item: Student; index: number }) => {
      const isChecked = !!checkedStudents[item.studentRegistrationId];
      return (
        <StudentItem
          student={item}
          index={index}
          isChecked={isChecked}
          onToggle={onToggleStudent}
        />
      );
    },
    [checkedStudents, onToggleStudent]
  );

  const presentPct = students.length > 0
    ? Math.round((presentCount / students.length) * 100)
    : 0;

  return (
    <FlatList
      data={filteredStudents}
      keyExtractor={keyExtractor}
      renderItem={renderStudentItem}
      getItemLayout={getItemLayout}
      removeClippedSubviews
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={30}
      windowSize={7}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      style={styles.list}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          {ListHeaderComponent2}

          {/* ── Roster Stats Bar ── */}
          <LinearGradient
            colors={[C.primary, C.primaryMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statsBar}
          >
            <View style={styles.statsLeft}>
              <Users size={18} color={C.white} />
              <Text style={styles.statsTitle}>Student List</Text>
              <View style={styles.totalPill}>
                <Text style={styles.totalText}>{students.length}</Text>
              </View>
            </View>
            <View style={styles.statsRight}>
              <View style={styles.statChip}>
                <Text style={styles.statChipP}>✓ {presentCount}</Text>
              </View>
              <View style={styles.statChipSep} />
              <View style={styles.statChip}>
                <Text style={styles.statChipA}>✗ {absentCount}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* ── Progress bar ── */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${presentPct}%` as any }]} />
            <Text style={styles.progressLabel}>{presentPct}% Present</Text>
          </View>

          {/* ── Actions row ── */}
          <View style={styles.actionsRow}>
            <Text style={styles.countText}>
              {presentCount} of {students.length} Present
            </Text>
            <TouchableOpacity
              onPress={onToggleAll}
              style={styles.selectAllBtn}
              activeOpacity={0.72}
            >
              {allChecked
                ? <Square size={15} color={C.primaryMid} />
                : <CheckSquare size={15} color={C.primaryMid} />
              }
              <Text style={styles.selectAllText}>
                {allChecked ? "Deselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Search ── */}
          <View style={styles.searchRow}>
            <Search size={16} color={C.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or enrollment no..."
              placeholderTextColor={C.textLight}
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No matching students found.</Text>
        </View>
      }
    />
  );
});

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 96,
  },

  // Stats banner
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.white,
  },
  totalPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  totalText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.white,
  },
  statsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statChipP: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6EE7B7",
  },
  statChipA: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FCA5A5",
  },
  statChipSep: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 2,
  },

  // Progress bar
  progressBg: {
    height: 28,
    backgroundColor: C.dangerBg,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: C.successBg,
  },
  progressLabel: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
  },

  // Actions row
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  countText: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: "600",
  },
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primaryMid,
  },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 15,
    color: C.text,
  },

  // Empty
  empty: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 14,
  },
});
