import { UserData, changeFacultyPassword } from "@/services/auth";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogOut,
  Mail,
  Phone,
  Shield,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NotificationBanner } from "./NotificationBanner";
import { C } from "./Theme";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProfileScreenProps {
  /** Pass the full array returned by the API (one item per course/sem/subject) */
  allRecords: UserData[];
  onLogout: () => void;
}

type SemesterGroup = { semesterId: number; semesterName: string; subjects: { subjectId: number; subjectName: string }[] };
type CourseGroup  = { courseId: number; courseName: string; semesters: SemesterGroup[] };

/** Group flat UserData[] → CourseGroup[] */
function groupByCourse(records: UserData[]): CourseGroup[] {
  const courseMap = new Map<number, CourseGroup>();
  for (const r of records) {
    if (!courseMap.has(r.courseId)) {
      courseMap.set(r.courseId, { courseId: r.courseId, courseName: r.courseName, semesters: [] });
    }
    const course = courseMap.get(r.courseId)!;
    let sem = course.semesters.find((s) => s.semesterId === r.semesterId);
    if (!sem) {
      sem = { semesterId: r.semesterId, semesterName: r.semesterName, subjects: [] };
      course.semesters.push(sem);
    }
    if (!sem.subjects.find((sub) => sub.subjectId === r.subjectId)) {
      sem.subjects.push({ subjectId: r.subjectId, subjectName: r.subjectName });
    }
  }
  return Array.from(courseMap.values());
}

export const ProfileScreen = React.memo(({ allRecords, onLogout }: ProfileScreenProps) => {
  if (!allRecords || allRecords.length === 0) return null;

  // Use first record for common fields (name, email, phone, userType – same across all rows)
  const record = allRecords[0];
  const courseGroups = React.useMemo(() => groupByCourse(allRecords), [allRecords]);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [notification, setNotification] = React.useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  const showBanner = (message: string, type: "success" | "error") => {
    setNotification({ visible: true, message, type });
  };

  const hideBanner = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      showBanner("Please fill in all fields", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showBanner("New passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await changeFacultyPassword({
        UserId: record.userId,
        OldPassword: oldPassword,
        NewPassword: newPassword,
        ConfirmNewPassword: confirmNewPassword,
      });

      if (response.success) {
        showBanner("Password changed successfully", "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setIsExpanded(false);
      } else {
        showBanner(response.message || "Failed to change password", "error");
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "An error occurred";
      showBanner(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const initials = record.facultyName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const infoRows = [
    { Icon: Mail,        label: "Email",     value: record.emailId   ?? "Not provided" },
    { Icon: Phone,       label: "Contact",   value: record.contactNo ?? "Not provided" },
    { Icon: Shield,      label: "User Type", value: record.userType === "2" ? "Faculty" : record.userType },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name banner */}
        <LinearGradient
          colors={[C.primary, C.primaryMid, C.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{record.facultyName}</Text>

         
        </LinearGradient>



  {/* Change Password Card */}


        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.cardHeader}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeaderLeft}>
              <Lock size={18} color={C.primaryMid} />
              <Text style={styles.cardTitle}>Change Password</Text>
            </View>
            {isExpanded ? (
              <ChevronUp size={18} color={C.textMuted} />
            ) : (
              <ChevronDown size={18} color={C.textMuted} />
            )}
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter current password"
                  placeholderTextColor={C.textLight}
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  style={styles.eyeBtn}
                >
                  {showOldPassword ? (
                    <EyeOff size={16} color={C.textMuted} />
                  ) : (
                    <Eye size={16} color={C.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter new password"
                  placeholderTextColor={C.textLight}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeBtn}
                >
                  {showNewPassword ? (
                    <EyeOff size={16} color={C.textMuted} />
                  ) : (
                    <Eye size={16} color={C.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm new password"
                  placeholderTextColor={C.textLight}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} color={C.textMuted} />
                  ) : (
                    <Eye size={16} color={C.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          {infoRows.map(({ Icon, label, value }) => (
            <View key={label} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon size={16} color={C.primaryMid} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Assigned Courses card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Assigned Courses</Text>
          {courseGroups.map((course, ci) => (
            <View key={course.courseId} style={[styles.courseBlock, ci > 0 && styles.courseBlockBorder]}>
              {/* Course header */}
              <View style={styles.courseHeader}>
                <View style={styles.courseIconWrap}>
                  <GraduationCap size={15} color={C.primaryMid} />
                </View>
                <Text style={styles.courseName}>{course.courseName}</Text>
              </View>

              {course.semesters.map((sem) => (
                <View key={sem.semesterId} style={styles.semBlock}>
                  {/* Semester label */}
                  <View style={styles.semHeader}>
                    <View style={styles.semDot} />
                    <Text style={styles.semName}>Semester: {sem.semesterName}</Text>
                  </View>

                  {/* Subjects */}
                  <View style={styles.subjectList}>
                    {sem.subjects.map((sub) => (
                      <View key={sub.subjectId} style={styles.subjectChip}>
                        <BookOpen size={11} color={C.primaryMid} style={{ marginRight: 4 }} />
                        <Text style={styles.subjectChipText}>{sub.subjectName}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

      


        {/* Logout */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.85}>
          <LogOut size={18} color={C.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <NotificationBanner
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onClose={hideBanner}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 40 },

  // Banner
  banner: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: { fontSize: 30, fontWeight: "800", color: C.white },
  name: { fontSize: 20, fontWeight: "800", color: C.white, marginBottom: 4 },
  username: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { fontSize: 13, fontWeight: "700", color: C.primaryMid },

  // Info card
  infoCard: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 14,
    elevation: 3,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 10.5, fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: "700", color: C.text },

  // ── Assigned Courses Card ──────────────────────────────────────────────────
  courseBlock: { paddingVertical: 10 },
  courseBlockBorder: { borderTopWidth: 1, borderTopColor: C.border },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  courseIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  courseName: { fontSize: 14, fontWeight: "800", color: C.text, flex: 1 },

  semBlock: { paddingLeft: 36, marginBottom: 6 },
  semHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  semDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.primaryMid,
  },
  semName: { fontSize: 12, fontWeight: "700", color: C.primaryMid, textTransform: "uppercase", letterSpacing: 0.4 },

  subjectList: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingLeft: 13 },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.primaryBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  subjectChipText: { fontSize: 12, fontWeight: "600", color: C.text },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: C.dangerBg,
    borderWidth: 1.5,
    borderColor: C.dangerBorder,
  },
  logoutText: { fontSize: 16, fontWeight: "800", color: C.danger },

  // Collapsible Change Password Card
  card: {
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 14,
    elevation: 3,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  formContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.bg,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 48,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: C.text,
    fontWeight: "600",
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    backgroundColor: C.primaryMid,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
