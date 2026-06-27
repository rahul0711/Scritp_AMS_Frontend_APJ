import {
  AlertTriangle,
  Bell,
  CheckCircle,
  TrendingDown,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { C } from "../faculty/Theme";
import { StudentAttendance } from "@/services/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface LowSubject extends StudentAttendance {
  consecutiveNeeded: number;
}

interface StudentHeaderProps {
  greeting: string;
  name: string;
  enrollmentNo: string;
  semesterName: string;
  initials: string;
  overallPercentage: number;
  totalLectures: number;
  presentLectures: number;
  absentLectures: number;
  lowAttendanceSubjects: LowSubject[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility — derive per-card interpolated style from a single Animated.Value.
// Staggering is achieved via input-range clamping (no nested useEffects).
// ─────────────────────────────────────────────────────────────────────────────
function cardStyle(anim: Animated.Value, index: number) {
  // Each card starts animating a bit later than the previous one
  const stagger = 0.14;
  const start = Math.min(index * stagger, 0.6);
  const end = Math.min(start + 0.45, 1);

  return {
    opacity: anim.interpolate({
      inputRange: [0, start, end],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, start, end],
          outputRange: [18, 18, 0],
          extrapolate: "clamp",
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, start, end],
          outputRange: [0.94, 0.94, 1],
          extrapolate: "clamp",
        }),
      },
    ],
  } as const;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline mini progress bar — no extra component, no extra animation state
// ─────────────────────────────────────────────────────────────────────────────
const ProgressBar = React.memo(
  ({ pct, color }: { pct: number; color: string }) => (
    <View style={n.track}>
      <View
        style={[n.fill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: color }]}
      />
      <View style={n.marker} />
    </View>
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// NotificationPanel — ONE Animated.Value drives ALL visual changes
// ─────────────────────────────────────────────────────────────────────────────
interface PanelProps {
  visible: boolean;
  onClose: () => void;
  overallPercentage: number;
  totalLectures: number;
  presentLectures: number;
  absentLectures: number;
  lowAttendanceSubjects: LowSubject[];
}

const NotificationPanel = React.memo(
  ({
    visible,
    onClose,
    overallPercentage,
    totalLectures,
    presentLectures,
    absentLectures,
    lowAttendanceSubjects,
  }: PanelProps) => {
    // Single driver: 0 = closed, 1 = open
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(anim, {
        toValue: visible ? 1 : 0,
        damping: 22,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
    }, [visible]);

    // Backdrop fades from 0 → 0.6 opacity
    const backdropOpacity = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.6],
    });

    // Header row slides + fades in first
    const headerStyle = {
      opacity: anim.interpolate({ inputRange: [0, 0.3, 0.7], outputRange: [0, 0, 1], extrapolate: "clamp" }),
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 0.3, 0.7],
            outputRange: [-8, -8, 0],
            extrapolate: "clamp",
          }),
        },
      ],
    } as const;

    const isOverallSafe = overallPercentage >= 75;
    const isOverallWarn = overallPercentage >= 65 && overallPercentage < 75;
    const overallColor = isOverallSafe ? C.success : isOverallWarn ? C.warn : C.danger;
    const overallLabel = isOverallSafe ? "Safe" : isOverallWarn ? "At Risk" : "Critical";
    const alertCount = lowAttendanceSubjects.length;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        {/* ── Backdrop: dimmed, tap to dismiss ── */}
        <Animated.View
          style={[n.backdrop, { opacity: backdropOpacity }]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* ── Floating notification column ── */}
        <View style={n.column} pointerEvents="box-none">

          {/* Section label */}
          <Animated.View style={[n.sectionRow, headerStyle]}>
            <Bell size={13} color="rgba(255,255,255,0.7)" />
            <Text style={n.sectionText}>Attendance Alerts</Text>
            {alertCount > 0 && (
              <View style={n.sectionBadge}>
                <Text style={n.sectionBadgeText}>{alertCount}</Text>
              </View>
            )}
            <TouchableOpacity
              style={n.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <X size={13} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
          </Animated.View>

          {/* ── Card 0: Overall Attendance ── */}
          <Animated.View style={[n.card, cardStyle(anim, 0)]}>
            <View style={[n.iconBox, { backgroundColor: `${overallColor}1A` }]}>
              {isOverallSafe
                ? <CheckCircle size={20} color={overallColor} />
                : <AlertTriangle size={20} color={overallColor} />}
            </View>
            <View style={n.body}>
              <View style={n.topRow}>
                <Text style={n.cardHeading}>Overall Attendance</Text>
                <Text style={[n.bigPct, { color: overallColor }]}>
                  {overallPercentage}%
                </Text>
              </View>
              <View style={n.statusRow}>
                <View style={[n.dot, { backgroundColor: overallColor }]} />
                <Text style={[n.statusLabel, { color: overallColor }]}>{overallLabel}</Text>
                <Text style={n.meta}>
                  · {presentLectures}P · {absentLectures}A · {totalLectures} total
                </Text>
              </View>
              <ProgressBar pct={overallPercentage} color={overallColor} />
            </View>
          </Animated.View>

          {/* ── Cards: low-attendance subjects ── */}
          {alertCount > 0 ? (
            lowAttendanceSubjects.map((item, idx) => {
              const pct = item.attendancePercentage;
              const color = pct < 65 ? C.danger : C.warn;
              return (
                <Animated.View
                  key={item.subjectId}
                  style={[n.card, cardStyle(anim, idx + 1)]}
                >
                  <View style={[n.iconBox, { backgroundColor: `${color}1A` }]}>
                    <AlertTriangle size={20} color={color} />
                  </View>
                  <View style={n.body}>
                    <View style={n.topRow}>
                      <Text style={n.cardHeading} numberOfLines={1}>
                        {item.subjectName}
                      </Text>
                      <Text style={[n.bigPct, { color, fontSize: 17 }]}>{pct}%</Text>
                    </View>
                    <Text style={n.meta}>
                      {item.presentLectures}/{item.totalLectures} classes attended
                    </Text>
                    <ProgressBar pct={pct} color={color} />
                    {item.consecutiveNeeded > 0 && (
                      <View style={n.needRow}>
                        <TrendingDown size={11} color={C.danger} />
                        <Text style={n.needText}>
                          Need {item.consecutiveNeeded} more consecutive classes
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })
          ) : (
            /* All clear */
            <Animated.View style={[n.card, cardStyle(anim, 1)]}>
              <View style={[n.iconBox, { backgroundColor: `${C.success}1A` }]}>
                <CheckCircle size={20} color={C.success} />
              </View>
              <View style={n.body}>
                <Text style={n.cardHeading}>All Subjects Clear</Text>
                <Text style={n.meta}>Every subject is above 75% attendance.</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    );
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// StudentHeader
// ─────────────────────────────────────────────────────────────────────────────
export const StudentHeader = React.memo(
  ({
    greeting,
    name,
    enrollmentNo,
    semesterName,
    initials,
    overallPercentage,
    totalLectures,
    presentLectures,
    absentLectures,
    lowAttendanceSubjects,
  }: StudentHeaderProps) => {
    const [panelVisible, setPanelVisible] = useState(false);
    const bellScale = useRef(new Animated.Value(1)).current;
    const hasAlerts = lowAttendanceSubjects.length > 0;

    const handleBellPress = useCallback(() => {
      Animated.sequence([
        Animated.timing(bellScale, { toValue: 1.3, duration: 80, useNativeDriver: true }),
        Animated.spring(bellScale, { toValue: 1, damping: 8, stiffness: 300, useNativeDriver: true }),
      ]).start();
      setPanelVisible(true);
    }, [bellScale]);

    const handleClose = useCallback(() => setPanelVisible(false), []);

    return (
      <>
        <View style={s.header}>
          <View style={s.left}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={s.info}>
              <Text style={s.greeting}>{greeting},</Text>
              <Text style={s.name} numberOfLines={1}>{name}</Text>
              <Text style={s.sub}>{enrollmentNo}  ·  Sem {semesterName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[s.bellBtn, hasAlerts && s.bellBtnAlert]}
            activeOpacity={0.75}
            onPress={handleBellPress}
          >
            <Animated.View style={{ transform: [{ scale: bellScale }] }}>
              <Bell size={20} color={hasAlerts ? C.danger : C.textMuted} />
            </Animated.View>
            {hasAlerts && (
              <View style={s.badge}>
                <Text style={s.badgeText}>
                  {lowAttendanceSubjects.length > 9 ? "9+" : lowAttendanceSubjects.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <NotificationPanel
          visible={panelVisible}
          onClose={handleClose}
          overallPercentage={overallPercentage}
          totalLectures={totalLectures}
          presentLectures={presentLectures}
          absentLectures={absentLectures}
          lowAttendanceSubjects={lowAttendanceSubjects}
        />
      </>
    );
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Header styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  info: { flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.primaryBorder,
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: C.primaryMid },
  greeting: { fontSize: 12, color: C.textMuted, fontWeight: "500" },
  name: { fontSize: 17, fontWeight: "800", color: C.text },
  sub: { fontSize: 11, color: C.textLight, fontWeight: "600", marginTop: 1 },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  bellBtnAlert: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1.5,
    borderColor: "#FECACA",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: C.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: C.white,
  },
  badgeText: { fontSize: 9, fontWeight: "800", color: C.white, lineHeight: 12 },
});

// ─────────────────────────────────────────────────────────────────────────────
// Notification styles
// ─────────────────────────────────────────────────────────────────────────────
const n = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000",
  },
  column: {
    position: "absolute",
    top: 54,
    left: 14,
    right: 14,
    gap: 9,
  },

  // Section title row
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  sectionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.2,
  },
  sectionBadge: {
    backgroundColor: C.danger,
    borderRadius: 8,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Notification card
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    padding: 13,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },

  // Left rounded icon square
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Card content
  body: { flex: 1, gap: 3 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  cardHeading: { flex: 1, fontSize: 13, fontWeight: "700", color: C.text },
  bigPct: { fontSize: 19, fontWeight: "900", letterSpacing: -0.5 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: "700" },
  meta: { fontSize: 11, color: C.textMuted, fontWeight: "500" },

  // Progress bar
  track: {
    marginTop: 6,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.07)",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
  },
  fill: { position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: 2 },
  marker: {
    position: "absolute",
    left: "75%",
    top: -1,
    bottom: -1,
    width: 1.5,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  // Need-more chip
  needRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  needText: { fontSize: 11, fontWeight: "600", color: C.danger, flex: 1 },
});
