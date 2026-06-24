import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckSquare, Search, Users } from "lucide-react-native";
import { C } from "./Theme";
import { Student } from "@/services/auth";
import { StudentItem } from "./StudentItem";

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
  const keyExtractor = useCallback((item: Student) => String(item.studentRegistrationId), []);

  const renderStudentItem = useCallback(({ item: student, index: idx }: { item: Student; index: number }) => {
    const isChecked = !!checkedStudents[student.studentRegistrationId];
    return (
      <StudentItem
        student={student}
        isChecked={isChecked}
        onToggle={onToggleStudent}
        showBorder={idx > 0}
        isLast={idx === filteredStudents.length - 1}
      />
    );
  }, [checkedStudents, onToggleStudent, filteredStudents.length]);

  return (
    <FlatList
      data={filteredStudents}
      keyExtractor={keyExtractor}
      renderItem={renderStudentItem}
      removeClippedSubviews
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
      showsVerticalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          {ListHeaderComponent2}
          <View style={styles.rosterHeaderContainer}>
            {/* Roster header */}
            <LinearGradient
              colors={[C.primary, C.primaryMid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rosterHeader}
            >
              <View style={styles.rosterHeaderLeft}>
                <Users size={20} color={C.white} />
                <Text style={styles.rosterTitle}>Student Roster</Text>
              </View>
              <View style={styles.rosterStats}>
                <View style={styles.statPresent}>
                  <Text style={styles.statPresentText}>P  {presentCount}</Text>
                </View>
                <View style={styles.statAbsent}>
                  <Text style={styles.statAbsentText}>A  {absentCount}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.rosterActions}>
              <Text style={styles.rosterCount}>
                {presentCount} of {students.length} marked Present
              </Text>
              <TouchableOpacity onPress={onToggleAll} style={styles.selectAllBtn} activeOpacity={0.7}>
                <CheckSquare size={16} color={C.primaryMid} />
                <Text style={styles.selectAllText}>
                  {allChecked ? "Deselect All" : "Select All"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
              <Search size={17} color={C.textMuted} />
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
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptySearch}>
          <Text style={styles.emptySearchText}>No matching students found.</Text>
        </View>
      }
    />
  );
});

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
  },
  rosterHeaderContainer: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: C.border,
    overflow: "hidden",
  },
  rosterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rosterHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rosterTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.white,
  },
  rosterStats: {
    flexDirection: "row",
    gap: 8,
  },
  statPresent: {
    backgroundColor: "rgba(5,150,105,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statPresentText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#A7F3D0",
  },
  statAbsent: {
    backgroundColor: "rgba(220,38,38,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statAbsentText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FCA5A5",
  },
  rosterActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rosterCount: {
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginVertical: 12,
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: C.text,
  },
  emptySearch: {
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: C.white,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor: C.border,
  },
  emptySearchText: {
    color: C.textMuted,
    fontSize: 14,
  },
});
