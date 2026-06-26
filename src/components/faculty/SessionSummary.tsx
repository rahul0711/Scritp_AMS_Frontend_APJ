import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BookOpen, Clock, GraduationCap, Layers } from "lucide-react-native";
import { C } from "./Theme";
import { OptionType } from "./types";

interface SessionSummaryProps {
  selectedCourse: OptionType | null;
  selectedSemester: OptionType | null;
  selectedSubject: OptionType | null;
  selectedTime: OptionType | null;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

interface ChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const Chip = React.memo(({ icon, label, value }: ChipProps) => (
  <View style={chip.container}>
    <View style={chip.iconWrap}>{icon}</View>
    <View>
      <Text style={chip.label}>{label}</Text>
      <Text style={chip.value} numberOfLines={1}>{value}</Text>
    </View>
  </View>
));

export const SessionSummary = React.memo(({
  selectedCourse,
  selectedSemester,
  selectedSubject,
  selectedTime,
  onTouchStart,
  onTouchEnd,
}: SessionSummaryProps) => {
  const hasAny = !!(selectedCourse || selectedSemester || selectedSubject || selectedTime);
  if (!hasAny) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Active Session</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onScrollEndDrag={onTouchEnd}
        nestedScrollEnabled={true}
      >
        {selectedCourse && (
          <Chip
            icon={<GraduationCap size={14} color={C.primaryMid} />}
            label="Programme"
            value={selectedCourse.name}
          />
        )}
        {selectedSemester && (
          <Chip
            icon={<Layers size={14} color={C.primaryMid} />}
            label="Semester"
            value={selectedSemester.name}
          />
        )}
        {selectedSubject && (
          <Chip
            icon={<BookOpen size={14} color={C.primaryMid} />}
            label="Subject"
            value={selectedSubject.name}
          />
        )}
        {selectedTime && (
          <Chip
            icon={<Clock size={14} color={C.primaryMid} />}
            label="Time Slot"
            value={selectedTime.name}
          />
        )}
      </ScrollView>
    </View>
  );
});

const chip = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: C.primaryBorder,
    gap: 8,
    elevation: 2,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 9.5,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    maxWidth: 120,
  },
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  heading: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 2,
  },
  strip: {
    paddingRight: 4,
  },
});
