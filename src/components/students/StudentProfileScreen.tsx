import { StudentData, changeStudentPassword } from "@/services/auth";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  Layers,
  Lock,
  LogOut,
  Mail,
  Phone,
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
import { NotificationBanner } from "../faculty/NotificationBanner";
import { C } from "../faculty/Theme";

interface StudentProfileScreenProps {
  studentData: StudentData;
  initials: string;
  onLogout: () => void;
}

export const StudentProfileScreen = React.memo(({
  studentData,
  initials,
  onLogout,
}: StudentProfileScreenProps) => {
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
      const response = await changeStudentPassword({
        StudentRegistrationId: studentData.studentRegistrationId,
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

  return (
    <View style={{ flex: 1 }}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{studentData.name}</Text>
        <Text style={styles.profileEnroll}>Enrollment No: {studentData.enrollmentNo}</Text>
        <View style={styles.studentRoleBadge}>
          <Text style={styles.studentRoleText}>Student</Text>
        </View>
      </View>

      {/* Profile Details scroll */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.profileScrollContent}
        showsVerticalScrollIndicator={false}
      >

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

        <View style={styles.infoCard}>
          <Text style={styles.infoSectionTitle}>Academic Info</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Clock size={16} color={C.primaryMid} />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Semester</Text>
              <Text style={styles.infoValue}>{studentData.semesterName} Semester</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Layers size={16} color={C.primaryMid} />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Programme / Course Code</Text>
              <Text style={styles.infoValue}>Course ID: {studentData.courseId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoSectionTitle}>Contact Details</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Mail size={16} color={C.primaryMid} />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{studentData.emailId || "Not provided"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Phone size={16} color={C.primaryMid} />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{studentData.mobile || "Not provided"}</Text>
            </View>
          </View>
        </View>

        {/* Change Password Card */}


        {/* Logout button */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.85}>
          <LogOut size={18} color={C.danger} />
          <Text style={styles.logoutText}>Logout from Portal</Text>
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
  profileHeader: {
    backgroundColor: C.white,
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.primaryBorder,
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 26,
    fontWeight: "800",
    color: C.primaryMid,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
  },
  profileEnroll: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
  studentRoleBadge: {
    backgroundColor: C.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  studentRoleText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primaryMid,
  },
  profileScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 12,
  },
  infoSectionTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10.5,
    color: C.textLight,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 13.5,
    color: C.text,
    fontWeight: "700",
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: C.dangerBg,
    borderWidth: 1.5,
    borderColor: C.dangerBorder,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "800",
    color: C.danger,
  },

  // Collapsible Change Password Card
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.text,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
  },
  inputLabel: {
    fontSize: 10.5,
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
    marginBottom: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 13.5,
    color: C.text,
    fontWeight: "600",
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    backgroundColor: C.primaryMid,
    borderRadius: 12,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 13.5,
    fontWeight: "700",
  },
});
