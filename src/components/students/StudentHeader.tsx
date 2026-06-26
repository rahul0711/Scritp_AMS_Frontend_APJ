import { AlertCircle, AlertTriangle, Bell, CheckCircle2, X } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { C } from "../faculty/Theme";
import { StudentAttendance } from "@/services/auth";

interface StudentHeaderProps {
  greeting: string;
  name: string;
  enrollmentNo: string;
  semesterName: string;
  initials: string;
  overallPercentage: number;
  attendance: StudentAttendance[];
}

export const StudentHeader = React.memo(({
  greeting,
  name,
  enrollmentNo,
  semesterName,
  initials,
  overallPercentage,
  attendance,
}: StudentHeaderProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Compute notifications list dynamically when attendance data changes
  const notifications = useMemo(() => {
    const alerts = [];

    // Check overall attendance
    if (overallPercentage < 75) {
      alerts.push({
        id: "overall",
        title: "Low Overall Attendance",
        message: `Your overall attendance is ${overallPercentage}%, which is below the minimum required 75%. Please attend more classes to improve it.`,
        type: "danger" as const,
      });
    }

    // Check per-subject attendance
    attendance.forEach((subject) => {
      if (subject.totalLectures > 0 && subject.attendancePercentage < 75) {
        alerts.push({
          id: `subject-${subject.subjectId}`,
          title: `${subject.subjectName} Warning`,
          message: `Your attendance in ${subject.subjectName} is ${subject.attendancePercentage}%, which is below the required 75%.`,
          type: "warning" as const,
        });
      }
    });

    return alerts;
  }, [overallPercentage, attendance]);

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.studentName} numberOfLines={1}>{name}</Text>
          <Text style={styles.headerSub}>
            {enrollmentNo}  ·  Sem {semesterName}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.iconBtn}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Bell size={20} color={C.textMuted} />
        {notifications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attendance Alerts</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={20} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            
            {/* Scrollable Alerts List */}
            <ScrollView contentContainerStyle={styles.notificationList} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <CheckCircle2 size={48} color={C.success} style={{ marginBottom: 12 }} />
                  <Text style={styles.emptyTitle}>All Clear!</Text>
                  <Text style={styles.emptyMessage}>
                    Your attendance is on track. Keep up the good work!
                  </Text>
                </View>
              ) : (
                notifications.map((notif) => (
                  <View
                    key={notif.id}
                    style={[
                      styles.notificationCard,
                      notif.type === "danger" ? styles.dangerCard : styles.warningCard
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      {notif.type === "danger" ? (
                        <AlertCircle size={20} color={C.danger} />
                      ) : (
                        <AlertTriangle size={20} color={C.warn} />
                      )}
                      <Text
                        style={[
                          styles.cardTitle,
                          notif.type === "danger" ? styles.dangerText : styles.warningText
                        ]}
                      >
                        {notif.title}
                      </Text>
                    </View>
                    <Text style={styles.cardMessage}>{notif.message}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});


const styles = StyleSheet.create({
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerInfo: {
    flex: 1,
  },
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
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: C.primaryMid,
  },
  greeting: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "500",
  },
  studentName: {
    fontSize: 17,
    fontWeight: "800",
    color: C.text,
  },
  headerSub: {
    fontSize: 11,
    color: C.textLight,
    fontWeight: "600",
    marginTop: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: C.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: C.white,
  },
  badgeText: {
    color: C.white,
    fontSize: 9,
    fontWeight: "800",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 24, 50, 0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    minHeight: "45%",
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
  },
  closeBtn: {
    padding: 4,
  },
  notificationList: {
    padding: 20,
    gap: 12,
  },
  notificationCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  dangerCard: {
    backgroundColor: C.dangerBg,
    borderColor: C.dangerBorder,
  },
  warningCard: {
    backgroundColor: C.warnBg,
    borderColor: C.warnBorder,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  dangerText: {
    color: C.dangerDark,
  },
  warningText: {
    color: C.warn,
  },
  cardMessage: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
    marginBottom: 6,
  },
  emptyMessage: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 18,
  },
});
